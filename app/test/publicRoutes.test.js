import assert from "node:assert/strict";
import { test } from "node:test";

import { createApp } from "../src/app.js";

async function withServer(site, callback) {
  const app = createApp({
    session: { sessionSecret: "test-session-secret" },
    site,
  });
  const server = await new Promise((resolve) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });
  const address = server.address();

  try {
    await callback(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

async function withAppServer(options, callback) {
  const app = createApp({
    session: { sessionSecret: "test-session-secret" },
    ...options,
  });
  const server = await new Promise((resolve) => {
    const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
  });
  const address = server.address();

  try {
    await callback(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

function extractCsrfToken(body) {
  return body.match(/name="csrfToken" value="([^"]+)"/)?.[1] || "";
}

const film = {
  age_rating: "15+",
  country: "South Korea",
  director: "Kim Bora",
  film_id: 1,
  genre: "Drama",
  is_featured: true,
  next_screening_id: 1,
  next_screening_at: new Date("2026-06-20T01:00:00.000Z"),
  poster_url: "/images/films/house-of-hummingbird.jpg",
  release_year: 2018,
  runtime_minutes: 138,
  slug: "house-of-hummingbird",
  synopsis: "A quiet coming-of-age story following a teenage girl in 1994 Seoul.",
  title: "House of Hummingbird",
  upcoming_screening_count: 2,
};

const screening = {
  active_booking_count: 3,
  age_rating: "15+",
  capacity: 60,
  director: "Kim Bora",
  film_id: 1,
  film_slug: "house-of-hummingbird",
  film_title: "House of Hummingbird",
  has_guest_talk: true,
  program_label: "Director Focus",
  remaining_capacity: 57,
  runtime_minutes: 138,
  screening_id: 1,
  starts_at: new Date("2026-06-20T01:00:00.000Z"),
  ticket_price_cents: 1200,
};

const users = [
  {
    email: "member@cinema.test",
    first_name: "Sora",
    is_active: true,
    last_name: "Kim",
    password_hash: "valid-password",
    role: "member",
    user_id: 1,
  },
  {
    email: "staff@cinema.test",
    first_name: "Joon",
    is_active: true,
    last_name: "Lee",
    password_hash: "valid-password",
    role: "staff",
    user_id: 2,
  },
];

function cookieFrom(response) {
  const setCookie = response.headers.get("set-cookie") || "";
  return setCookie.split(";")[0];
}

async function login(baseUrl, email) {
  const loginPage = await fetch(`${baseUrl}/login`);
  const loginBody = await loginPage.text();
  const cookie = cookieFrom(loginPage);
  const csrfToken = extractCsrfToken(loginBody);
  const response = await fetch(`${baseUrl}/login`, {
    body: new URLSearchParams({
      csrfToken,
      email,
      password: "correct-password",
    }),
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      cookie,
    },
    method: "POST",
    redirect: "manual",
  });

  return cookieFrom(response);
}

function createAuthenticatedOptions(site = {}) {
  return {
    auth: {
      findUserByEmail: async (email) => users.find((user) => user.email === email) || null,
      verifyPassword: async (password, hash) => password === "correct-password" && hash === "valid-password",
    },
    site: {
      findPublicFilmBySlug: async () => film,
      findPublicFilms: async () => [film],
      findPublicScreeningById: async () => screening,
      findPublicScreeningsByFilmId: async () => [screening],
      findPublicUpcomingScreenings: async () => [screening],
      ...site,
    },
    users: {
      findActiveUserById: async (userId) => users.find((user) => user.user_id === userId && user.is_active) || null,
    },
  };
}

test("public film and screening routes render data-backed normal states", async () => {
  await withServer({
    findPublicFilmBySlug: async () => film,
    findPublicFilms: async () => [film],
    findPublicScreeningById: async () => screening,
    findPublicScreeningsByFilmId: async () => [screening],
    findPublicUpcomingScreenings: async () => [screening],
  }, async (baseUrl) => {
    const homeResponse = await fetch(baseUrl);
    const homeBody = await homeResponse.text();
    assert.equal(homeResponse.status, 200);
    assert.match(homeBody, /Next screening/);
    assert.match(homeBody, /House of Hummingbird/);
    assert.match(homeBody, /57 seats available/);

    const filmsResponse = await fetch(`${baseUrl}/films`);
    const filmsBody = await filmsResponse.text();
    assert.equal(filmsResponse.status, 200);
    assert.match(filmsBody, /House of Hummingbird/);
    assert.match(filmsBody, /2 upcoming/);
    assert.match(filmsBody, /Featured/);
    assert.match(filmsBody, /Film detail/);

    const screeningsResponse = await fetch(`${baseUrl}/screenings`);
    const screeningsBody = await screeningsResponse.text();
    assert.equal(screeningsResponse.status, 200);
    assert.match(screeningsBody, /House of Hummingbird/);
    assert.match(screeningsBody, /57 seats available/);
    assert.match(screeningsBody, /Guest talk/);
    assert.match(screeningsBody, /Screening detail/);

    const filmDetailResponse = await fetch(`${baseUrl}/films/house-of-hummingbird`);
    const filmDetailBody = await filmDetailResponse.text();
    assert.equal(filmDetailResponse.status, 200);
    assert.match(filmDetailBody, /Screenings for this film/);
    assert.match(filmDetailBody, /Director Focus/);
    assert.match(filmDetailBody, /Go to screening/);

    const screeningDetailResponse = await fetch(`${baseUrl}/screenings/1`);
    const screeningDetailBody = await screeningDetailResponse.text();
    assert.equal(screeningDetailResponse.status, 200);
    assert.match(screeningDetailBody, /House of Hummingbird/);
    assert.match(screeningDetailBody, /\$12\.00/);
    assert.match(screeningDetailBody, /View film detail/);
    assert.match(screeningDetailBody, /Sign in to book/);
  });
});

test("screening detail creates member bookings and handles booking conflicts", async () => {
  const bookingAttempts = [];

  await withAppServer(createAuthenticatedOptions({
    createMemberBooking: async (booking) => {
      bookingAttempts.push(booking);

      if (bookingAttempts.length === 2) {
        const error = new Error("You already have a booking for this screening.");
        error.name = "BookingDuplicateConflictError";
        throw error;
      }

      return {
        booked_at: new Date(),
        booking_id: 55,
        cancelled_at: null,
        film_title: "House of Hummingbird",
        screening_id: booking.screeningId,
        starts_at: screening.starts_at,
        status: "confirmed",
        user_id: booking.userId,
      };
    },
  }), async (baseUrl) => {
    const unauthenticatedPost = await fetch(`${baseUrl}/screenings/1/bookings`, {
      method: "POST",
      redirect: "manual",
    });
    assert.equal(unauthenticatedPost.status, 303);
    assert.equal(unauthenticatedPost.headers.get("location"), "/login");

    const staffCookie = await login(baseUrl, "staff@cinema.test");
    const staffDetail = await fetch(`${baseUrl}/screenings/1`, {
      headers: { cookie: staffCookie },
    });
    assert.equal(staffDetail.status, 200);
    assert.match(await staffDetail.text(), /Only Member accounts can book screenings/);

    const memberCookie = await login(baseUrl, "member@cinema.test");
    const memberDetail = await fetch(`${baseUrl}/screenings/1`, {
      headers: { cookie: memberCookie },
    });
    const memberDetailBody = await memberDetail.text();
    const csrfToken = extractCsrfToken(memberDetailBody);
    assert.equal(memberDetail.status, 200);
    assert.match(memberDetailBody, /Book This Screening/);
    assert.ok(csrfToken);

    const createdResponse = await fetch(`${baseUrl}/screenings/1/bookings`, {
      body: new URLSearchParams({ csrfToken }),
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        cookie: memberCookie,
      },
      method: "POST",
      redirect: "manual",
    });
    assert.equal(createdResponse.status, 303);
    assert.equal(createdResponse.headers.get("location"), "/account/bookings/55");
    assert.deepEqual(bookingAttempts[0], { screeningId: 1, userId: 1 });

    const conflictResponse = await fetch(`${baseUrl}/screenings/1/bookings`, {
      body: new URLSearchParams({ csrfToken }),
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        cookie: memberCookie,
      },
      method: "POST",
    });
    const conflictBody = await conflictResponse.text();
    assert.equal(conflictResponse.status, 409);
    assert.match(conflictBody, /You already have a booking for this screening/);
  });
});

test("public home, film, and screening database failures use the global error state", async () => {
  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    await withServer({
      findPublicFilmBySlug: async () => {
        throw new Error("film detail query failed");
      },
      findPublicFilms: async () => {
        throw new Error("film query failed");
      },
      findPublicScreeningById: async () => {
        throw new Error("screening detail query failed");
      },
      findPublicScreeningsByFilmId: async () => {
        throw new Error("film screenings query failed");
      },
      findPublicUpcomingScreenings: async () => {
        throw new Error("screening query failed");
      },
    }, async (baseUrl) => {
      for (const route of ["/", "/films", "/films/house-of-hummingbird", "/screenings", "/screenings/1"]) {
        const response = await fetch(`${baseUrl}${route}`);
        const body = await response.text();

        assert.equal(response.status, 500);
        assert.match(body, /This request could not be completed/);
      }
    });
  } finally {
    console.error = originalConsoleError;
  }
});

test("public visit contact form validates and stores messages", async () => {
  const storedMessages = [];

  await withServer({
    createContactMessage: async (message) => {
      storedMessages.push(message);
      return { created_at: new Date(), message_id: 1, status: "new" };
    },
    findPublicFilmBySlug: async () => film,
    findPublicFilms: async () => [film],
    findPublicScreeningById: async () => screening,
    findPublicScreeningsByFilmId: async () => [screening],
    findPublicUpcomingScreenings: async () => [screening],
  }, async (baseUrl) => {
    const visitResponse = await fetch(`${baseUrl}/visit`);
    const visitBody = await visitResponse.text();
    const cookie = visitResponse.headers.get("set-cookie");
    const csrfToken = extractCsrfToken(visitBody);

    assert.equal(visitResponse.status, 200);
    assert.match(visitBody, /One room\. A clear arrival/);
    assert.match(visitBody, /Send Message/);
    assert.ok(csrfToken);

    const invalidResponse = await fetch(`${baseUrl}/visit`, {
      body: new URLSearchParams({
        body: "Too short",
        csrfToken,
        email: "not-an-email",
        name: "",
        subject: "",
      }),
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        cookie,
      },
      method: "POST",
    });
    const invalidBody = await invalidResponse.text();

    assert.equal(invalidResponse.status, 422);
    assert.match(invalidBody, /Please correct the following/);
    assert.match(invalidBody, /Name is required/);
    assert.match(invalidBody, /Email must be a valid email address/);
    assert.equal(storedMessages.length, 0);

    const validResponse = await fetch(`${baseUrl}/visit`, {
      body: new URLSearchParams({
        body: "Could you share the best arrival time for an accessibility request?",
        csrfToken,
        email: "Guest@Example.com",
        name: "Guest Viewer",
        subject: "Accessibility arrival",
      }),
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        cookie,
      },
      method: "POST",
      redirect: "manual",
    });

    assert.equal(validResponse.status, 303);
    assert.equal(validResponse.headers.get("location"), "/visit?sent=1");
    assert.deepEqual(storedMessages, [{
      body: "Could you share the best arrival time for an accessibility request?",
      email: "guest@example.com",
      name: "Guest Viewer",
      subject: "Accessibility arrival",
      userId: null,
    }]);

    const successResponse = await fetch(`${baseUrl}/visit?sent=1`, {
      headers: { cookie },
    });
    const successBody = await successResponse.text();

    assert.equal(successResponse.status, 200);
    assert.match(successBody, /Message received/);
  });
});

test("public visit contact database failures use the global error state", async () => {
  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    await withServer({
      createContactMessage: async () => {
        throw new Error("contact insert failed");
      },
      findPublicFilmBySlug: async () => film,
      findPublicFilms: async () => [film],
      findPublicScreeningById: async () => screening,
      findPublicScreeningsByFilmId: async () => [screening],
      findPublicUpcomingScreenings: async () => [screening],
    }, async (baseUrl) => {
      const visitResponse = await fetch(`${baseUrl}/visit`);
      const visitBody = await visitResponse.text();
      const cookie = visitResponse.headers.get("set-cookie");
      const csrfToken = extractCsrfToken(visitBody);

      const response = await fetch(`${baseUrl}/visit`, {
        body: new URLSearchParams({
          body: "Please help me plan a group screening arrival time.",
          csrfToken,
          email: "guest@example.com",
          name: "Guest Viewer",
          subject: "Group screening",
        }),
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          cookie,
        },
        method: "POST",
      });
      const body = await response.text();

      assert.equal(response.status, 500);
      assert.match(body, /This request could not be completed/);
    });
  } finally {
    console.error = originalConsoleError;
  }
});

test("public detail routes reject invalid and missing identifiers with stable not found states", async () => {
  await withServer({
    findPublicFilmBySlug: async () => null,
    findPublicFilms: async () => [],
    findPublicScreeningById: async () => null,
    findPublicScreeningsByFilmId: async () => [],
    findPublicUpcomingScreenings: async () => [],
  }, async (baseUrl) => {
    for (const route of [
      "/films/BadSlug",
      "/films/missing-film",
      "/screenings/not-a-number",
      "/screenings/999",
    ]) {
      const response = await fetch(`${baseUrl}${route}`);
      const body = await response.text();

      assert.equal(response.status, 404, route);
      assert.match(body, /The screening has moved on/);
    }
  });
});
