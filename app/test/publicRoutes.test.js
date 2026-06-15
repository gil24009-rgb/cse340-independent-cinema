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
    findPublicFilms: async () => [film],
    findPublicUpcomingScreenings: async () => [screening],
  }, async (baseUrl) => {
    const filmsResponse = await fetch(`${baseUrl}/films`);
    const filmsBody = await filmsResponse.text();
    assert.equal(filmsResponse.status, 200);
    assert.match(filmsBody, /House of Hummingbird/);
    assert.match(filmsBody, /2 upcoming/);
    assert.match(filmsBody, /Featured/);

    const screeningsResponse = await fetch(`${baseUrl}/screenings`);
    const screeningsBody = await screeningsResponse.text();
    assert.equal(screeningsResponse.status, 200);
    assert.match(screeningsBody, /House of Hummingbird/);
    assert.match(screeningsBody, /57 seats available/);
    assert.match(screeningsBody, /Guest talk/);
  });
});

test("public film and screening database failures use the global error state", async () => {
  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    await withServer({
      findPublicFilms: async () => {
        throw new Error("film query failed");
      },
      findPublicUpcomingScreenings: async () => {
        throw new Error("screening query failed");
      },
    }, async (baseUrl) => {
      for (const route of ["/films", "/screenings"]) {
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
