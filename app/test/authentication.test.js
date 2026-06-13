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

let server;
let baseUrl;

function findUserByEmail(email) {
  return users.find((user) => user.email === email) || null;
}

function findActiveUserById(userId) {
  return users.find((user) => user.user_id === userId && user.is_active) || null;
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

before(async () => {
  const app = createApp({
    auth: {
      findUserByEmail,
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
  for (const route of ["/account", "/staff", "/admin"]) {
    const response = await request(route);

    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "/login");
  }
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

test("role guards enforce Member, Staff, and Owner direct URL access", async () => {
  const cases = [
    ["member@cinema.test", "/account", 200],
    ["member@cinema.test", "/staff", 403],
    ["member@cinema.test", "/admin", 403],
    ["staff@cinema.test", "/account", 403],
    ["staff@cinema.test", "/staff", 200],
    ["staff@cinema.test", "/admin", 403],
    ["owner@cinema.test", "/account", 403],
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
