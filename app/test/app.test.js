import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { createApp } from "../src/app.js";

let server;
let baseUrl;

before(async () => {
  const app = createApp({
    session: { sessionSecret: "test-session-secret" },
    site: {
      findPublicFilms: async () => [],
      findPublicScreeningById: async () => null,
      findPublicScreeningsByFilmId: async () => [],
      findPublicUpcomingScreenings: async () => [],
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

test("renders the cinema foundation home page", async () => {
  const response = await fetch(baseUrl);
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("set-cookie"), null);
  assert.match(body, /Independent films, one focused screen/);
  assert.match(body, /aria-current="page"/);
});

test("renders stable empty states for public and authentication routes", async () => {
  for (const route of ["/films", "/screenings", "/visit", "/login", "/signup"]) {
    const response = await fetch(`${baseUrl}${route}`);
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(body, route === "/films"
      ? /next film program is taking shape/
      : route === "/screenings"
        ? /next screening schedule is almost ready/
        : route === "/visit"
          ? /Send one clear message/
          : /form/);
  }
});

test("owned member detail routes fail safely without database access", async () => {
  for (const route of ["/account/bookings/1", "/account/reviews/1"]) {
    const response = await fetch(`${baseUrl}${route}`, { redirect: "manual" });
    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "/login");
  }
});

test("reports application health without requiring a database", async () => {
  const response = await fetch(`${baseUrl}/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.status, "ok");
  assert.equal(typeof body.databaseConfigured, "boolean");
});

test("renders a stable not found page", async () => {
  const response = await fetch(`${baseUrl}/missing-page`);
  const body = await response.text();

  assert.equal(response.status, 404);
  assert.match(body, /The screening has moved on/);
});

test("falls back to plain text when an error template cannot render", async () => {
  const brokenApp = createApp({ session: { sessionSecret: "test-session-secret" } });
  brokenApp.set("views", "/path/that/does/not/exist");
  const originalConsoleError = console.error;
  console.error = () => {};
  let brokenServer;

  try {
    brokenServer = await new Promise((resolve) => {
      const listener = brokenApp.listen(0, "127.0.0.1", () => resolve(listener));
    });
    const address = brokenServer.address();
    const response = await fetch(`http://127.0.0.1:${address.port}/missing`);
    const body = await response.text();

    assert.equal(response.status, 404);
    assert.equal(body, "Page not found.");
  } finally {
    if (brokenServer) {
      await new Promise((resolve) => brokenServer.close(resolve));
    }
    console.error = originalConsoleError;
  }
});

test("passes database configuration errors to the global error handler", {
  skip: Boolean(process.env.DATABASE_URL),
}, async () => {
  const response = await fetch(`${baseUrl}/health/database`);
  const body = await response.text();

  assert.equal(response.status, 500);
  assert.match(body, /This request could not be completed/);
});
