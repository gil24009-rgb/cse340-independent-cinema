import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { createApp } from "../src/app.js";

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
  {
    email: "owner@cinema.test",
    first_name: "Mina",
    is_active: true,
    last_name: "Park",
    password_hash: "valid-password",
    role: "owner",
    user_id: 3,
  },
];
const bookings = [
  {
    booked_at: "2026-06-10T18:30:00.000Z",
    booking_id: 1,
    cancelled_at: null,
    film_title: "House of Hummingbird",
    screening_id: 10,
    starts_at: "2026-06-15T01:00:00.000Z",
    status: "confirmed",
    user_id: 1,
  },
  {
    booked_at: "2026-06-02T18:30:00.000Z",
    booking_id: 2,
    cancelled_at: null,
    film_title: "Microhabitat",
    screening_id: 11,
    starts_at: "2026-06-08T01:00:00.000Z",
    status: "completed",
    user_id: 1,
  },
  {
    booked_at: "2026-06-09T18:30:00.000Z",
    booking_id: 3,
    cancelled_at: "2026-06-10T18:30:00.000Z",
    film_title: "Little Forest",
    screening_id: 12,
    starts_at: "2026-06-16T01:00:00.000Z",
    status: "cancelled",
    user_id: 4,
  },
];
const reviews = [
  {
    body: "A precise and quietly moving film that stayed with me after the screening.",
    created_at: "2026-06-09T18:30:00.000Z",
    film_title: "Microhabitat",
    is_visible: true,
    rating: 5,
    review_id: 1,
    updated_at: "2026-06-09T18:30:00.000Z",
    user_id: 1,
  },
  {
    body: "Another member review.",
    created_at: "2026-06-11T18:30:00.000Z",
    film_title: "Little Forest",
    is_visible: true,
    rating: 4,
    review_id: 2,
    updated_at: "2026-06-11T18:30:00.000Z",
    user_id: 4,
  },
];

let server;
let baseUrl;
let nextUserId = 5;

function findUserByEmail(email) {
  return users.find((user) => user.email === email) || null;
}

function findActiveUserById(userId) {
  return users.find((user) => user.user_id === userId && user.is_active) || null;
}

async function createMemberUser({ email, firstName, lastName, passwordHash }) {
  if (findUserByEmail(email)) {
    const error = new Error("duplicate email");
    error.code = "23505";
    error.constraint = "users_email_key";
    throw error;
  }

  const user = {
    email,
    first_name: firstName,
    is_active: true,
    last_name: lastName,
    password_hash: passwordHash,
    role: "member",
    user_id: nextUserId,
  };

  nextUserId += 1;
  users.push(user);
  return user;
}

async function findBookingById(bookingId) {
  return bookings.find((booking) => booking.booking_id === bookingId) || null;
}

async function findReviewById(reviewId) {
  return reviews.find((review) => review.review_id === reviewId) || null;
}

function cookieFrom(response) {
  return response.headers.get("set-cookie")?.split(";")[0] || "";
}

function csrfFrom(body) {
  return body.match(/name="csrfToken" value="([^"]+)"/)?.[1] || "";
}

async function request(path, options = {}) {
  return fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    ...options,
  });
}

async function login(email, password = "correct-password") {
  const loginPage = await request("/login");
  const loginBody = await loginPage.text();
  const initialSetCookie = loginPage.headers.get("set-cookie") || "";
  const initialCookie = cookieFrom(loginPage);
  const csrfToken = csrfFrom(loginBody);
  const response = await request("/login", {
    body: new URLSearchParams({ csrfToken, email, password }),
    headers: {
      cookie: initialCookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  return {
    cookie: cookieFrom(response),
    initialCookie,
    initialSetCookie,
    response,
  };
}

async function signup(fields) {
  const signupPage = await request("/signup");
  const signupBody = await signupPage.text();
  const initialSetCookie = signupPage.headers.get("set-cookie") || "";
  const initialCookie = cookieFrom(signupPage);
  const csrfToken = csrfFrom(signupBody);
  const response = await request("/signup", {
    body: new URLSearchParams({ csrfToken, ...fields }),
    headers: {
      cookie: initialCookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  return {
    cookie: cookieFrom(response),
    initialCookie,
    initialSetCookie,
    response,
  };
}

before(async () => {
  const app = createApp({
    account: {
      findBookingById,
      findReviewById,
    },
    auth: {
      createMemberUser,
      findUserByEmail,
      hashPassword: async (password, rounds) => `hashed:${rounds}:${password}`,
      verifyPassword: async (password, hash) => password === "correct-password" && hash === "valid-password",
    },
    session: {
      sessionSecret: "test-session-secret",
    },
    users: {
      findActiveUserById,
    },
  });

  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", () => {
      const address = server.address();
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test("protected routes redirect unauthenticated direct access", async () => {
  for (const route of ["/account", "/account/bookings/1", "/account/reviews/1", "/staff", "/admin"]) {
    const response = await request(route);

    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "/login");
  }
});

test("signup page is public and redirects authenticated users to their account destination", async () => {
  const publicPage = await request("/signup");
  assert.equal(publicPage.status, 200);

  const { cookie } = await login("member@cinema.test");
  const authenticatedPage = await request("/signup", { headers: { cookie } });

  assert.equal(authenticatedPage.status, 303);
  assert.equal(authenticatedPage.headers.get("location"), "/account");
});

test("login uses one generic message for unknown email and wrong password", async () => {
  for (const credentials of [
    ["unknown@cinema.test", "correct-password"],
    ["member@cinema.test", "wrong-password"],
  ]) {
    const result = await login(...credentials);
    const body = await result.response.text();

    assert.equal(result.response.status, 401);
    assert.match(body, /Email or password is incorrect/);
  }
});

test("login session uses the configured cookie and regenerates its identifier", async () => {
  const { cookie, initialCookie, initialSetCookie } = await login("member@cinema.test");

  assert.match(initialCookie, /^cinema_session=/);
  assert.match(initialSetCookie, /HttpOnly/);
  assert.match(initialSetCookie, /SameSite=Lax/);
  assert.match(cookie, /^cinema_session=/);
  assert.notEqual(cookie, initialCookie);
});

test("signup validates required fields and preserves non-secret values", async () => {
  const { response } = await signup({
    confirmPassword: "different-password",
    email: "BadEmail",
    firstName: "  Sora  ",
    lastName: "",
    password: "short",
  });
  const body = await response.text();

  assert.equal(response.status, 422);
  assert.match(body, /Please correct the following/);
  assert.match(body, /Email must be a valid email address/);
  assert.match(body, /Last name is required/);
  assert.match(body, /Password must be at least 8 characters/);
  assert.match(body, /Password confirmation must match Password/);
  assert.match(body, /value="bademail"/);
  assert.match(body, /value="Sora"/);
  assert.doesNotMatch(body, /short/);
});

test("signup creates a Member account with a normalized email and hashed password", async () => {
  const { cookie, initialCookie, initialSetCookie, response } = await signup({
    confirmPassword: "P@ssword123",
    email: "NEWMEMBER@Cinema.Test ",
    firstName: " New ",
    lastName: " Member ",
    password: "P@ssword123",
  });

  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "/account");
  assert.match(initialCookie, /^cinema_session=/);
  assert.match(initialSetCookie, /HttpOnly/);
  assert.match(cookie, /^cinema_session=/);
  assert.notEqual(cookie, initialCookie);

  const createdUser = findUserByEmail("newmember@cinema.test");
  assert.equal(createdUser.role, "member");
  assert.equal(createdUser.password_hash, "hashed:12:P@ssword123");
  assert.equal(createdUser.first_name, "New");
  assert.equal(createdUser.last_name, "Member");

  const accountResponse = await request("/account", { headers: { cookie } });
  const accountBody = await accountResponse.text();
  assert.equal(accountResponse.status, 200);
  assert.match(accountBody, /Welcome, New/);
});

test("signup returns a conflict for duplicate emails", async () => {
  const { response } = await signup({
    confirmPassword: "P@ssword123",
    email: "MEMBER@cinema.test",
    firstName: "Sora",
    lastName: "Kim",
    password: "P@ssword123",
  });
  const body = await response.text();

  assert.equal(response.status, 409);
  assert.match(body, /An account with that email already exists/);
});

test("role guards enforce Member, Staff, and Owner direct URL access", async () => {
  const cases = [
    ["member@cinema.test", "/account", 200],
    ["member@cinema.test", "/account/bookings/1", 200],
    ["member@cinema.test", "/account/reviews/1", 200],
    ["member@cinema.test", "/staff", 403],
    ["member@cinema.test", "/admin", 403],
    ["staff@cinema.test", "/account", 403],
    ["staff@cinema.test", "/account/bookings/1", 403],
    ["staff@cinema.test", "/staff", 200],
    ["staff@cinema.test", "/admin", 403],
    ["owner@cinema.test", "/account", 403],
    ["owner@cinema.test", "/account/reviews/1", 403],
    ["owner@cinema.test", "/staff", 200],
    ["owner@cinema.test", "/admin", 200],
  ];

  for (const [email, route, expectedStatus] of cases) {
    const { cookie, response: loginResponse } = await login(email);
    const response = await request(route, { headers: { cookie } });

    assert.equal(loginResponse.status, 303);
    assert.equal(response.status, expectedStatus, `${email} ${route}`);
  }
});

test("current user is reloaded and inactive sessions lose access", async () => {
  const member = findUserByEmail("member@cinema.test");
  const { cookie } = await login(member.email);

  member.is_active = false;
  const response = await request("/account", { headers: { cookie } });
  member.is_active = true;

  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "/login");
});

test("current role is reloaded so stale privileges are rejected", async () => {
  const staff = findUserByEmail("staff@cinema.test");
  const { cookie } = await login(staff.email);

  staff.role = "member";
  const response = await request("/staff", { headers: { cookie } });
  staff.role = "staff";

  assert.equal(response.status, 403);
});

test("member-owned booking and review routes reject invalid, missing, and cross-account access", async () => {
  const otherMember = await createMemberUser({
    email: "othermember@cinema.test",
    firstName: "Other",
    lastName: "Member",
    passwordHash: "valid-password",
  });
  bookings.push({
    booked_at: "2026-06-11T18:30:00.000Z",
    booking_id: 4,
    cancelled_at: null,
    film_title: "Little Forest",
    screening_id: 13,
    starts_at: "2026-06-17T01:00:00.000Z",
    status: "confirmed",
    user_id: otherMember.user_id,
  });
  reviews.push({
    body: "Other member private review.",
    created_at: "2026-06-12T18:30:00.000Z",
    film_title: "House of Hummingbird",
    is_visible: true,
    rating: 4,
    review_id: 3,
    updated_at: "2026-06-12T18:30:00.000Z",
    user_id: otherMember.user_id,
  });

  const { cookie } = await login("member@cinema.test");
  const cases = [
    ["/account/bookings/not-a-number", 404],
    ["/account/bookings/999", 404],
    ["/account/bookings/4", 404],
    ["/account/reviews/not-a-number", 404],
    ["/account/reviews/999", 404],
    ["/account/reviews/3", 404],
  ];

  for (const [route, expectedStatus] of cases) {
    const response = await request(route, { headers: { cookie } });
    assert.equal(response.status, expectedStatus, route);
  }
});

test("owned booking and review pages render resource details for the signed-in member", async () => {
  const { cookie } = await login("member@cinema.test");

  const bookingResponse = await request("/account/bookings/1", { headers: { cookie } });
  const bookingBody = await bookingResponse.text();
  assert.equal(bookingResponse.status, 200);
  assert.match(bookingBody, /House of Hummingbird/);
  assert.match(bookingBody, /Booking ID/);

  const reviewResponse = await request("/account/reviews/1", { headers: { cookie } });
  const reviewBody = await reviewResponse.text();
  assert.equal(reviewResponse.status, 200);
  assert.match(reviewBody, /Microhabitat/);
  assert.match(reviewBody, /A precise and quietly moving film/);
});

test("logout requires CSRF and invalidates the active session", async () => {
  const { cookie } = await login("member@cinema.test");
  const accountPage = await request("/account", { headers: { cookie } });
  const accountBody = await accountPage.text();
  const csrfToken = csrfFrom(accountBody);

  const invalidCsrf = await request("/logout", {
    body: new URLSearchParams({ csrfToken: "invalid" }),
    headers: {
      cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(invalidCsrf.status, 403);

  const logoutResponse = await request("/logout", {
    body: new URLSearchParams({ csrfToken }),
    headers: {
      cookie,
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  assert.equal(logoutResponse.status, 303);

  const afterLogout = await request("/account", { headers: { cookie } });
  assert.equal(afterLogout.status, 303);
  assert.equal(afterLogout.headers.get("location"), "/login");
});
