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

test("public film and screening routes render data-backed normal states", async () => {
  await withServer({
    findPublicFilmBySlug: async () => film,
    findPublicFilms: async () => [film],
    findPublicScreeningById: async () => screening,
    findPublicScreeningsByFilmId: async () => [screening],
    findPublicUpcomingScreenings: async () => [screening],
  }, async (baseUrl) => {
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
  });
});

test("public film and screening database failures use the global error state", async () => {
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
      for (const route of ["/films", "/films/house-of-hummingbird", "/screenings", "/screenings/1"]) {
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
