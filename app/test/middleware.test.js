import assert from "node:assert/strict";
import { test } from "node:test";

import { createSessionMiddleware } from "../src/config/session.js";
import { buildNavigation } from "../src/middleware/viewContext.js";
import {
  requiredText,
  validEmail,
  validateRequest,
} from "../src/middleware/validation.js";

test("buildNavigation provides role-specific destinations", () => {
  const publicNav = buildNavigation("/", null);
  const staffNav = buildNavigation("/staff", { role: "staff" });
  const ownerNav = buildNavigation("/admin", { role: "owner" });

  assert.equal(publicNav.account.href, "/login");
  assert.equal(staffNav.account.href, "/staff");
  assert.equal(staffNav.account.active, true);
  assert.equal(ownerNav.account.href, "/admin");
});

test("validation middleware collects field errors", () => {
  const middleware = validateRequest({
    email: [validEmail()],
    name: [requiredText("Name", { maxLength: 80 })],
  });
  const request = { body: { email: "invalid", name: " " } };

  middleware(request, {}, () => {});

  assert.deepEqual(Object.keys(request.validationErrors), ["email", "name"]);
  assert.match(request.validationErrors.email[0], /valid email/);
  assert.match(request.validationErrors.name[0], /required/);
});

test("validation middleware handles a missing request body", () => {
  const middleware = validateRequest({
    name: [requiredText("Name")],
  });
  const request = {};

  middleware(request, {}, () => {});

  assert.match(request.validationErrors.name[0], /required/);
});

test("account navigation only marks exact routes and descendants active", () => {
  const exact = buildNavigation("/admin", { role: "owner" });
  const descendant = buildNavigation("/admin/users", { role: "owner" });
  const falsePrefix = buildNavigation("/administration", { role: "owner" });

  assert.equal(exact.account.active, true);
  assert.equal(descendant.account.active, true);
  assert.equal(falsePrefix.account.active, false);
});

test("session configuration rejects a missing secret", () => {
  assert.throws(
    () => createSessionMiddleware(),
    /SESSION_SECRET is required/,
  );
});
