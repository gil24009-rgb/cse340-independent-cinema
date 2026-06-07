import assert from "node:assert/strict";
import { test } from "node:test";

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
    email: [validEmail("email")],
    name: [requiredText("name", "Name", { maxLength: 80 })],
  });
  const request = { body: { email: "invalid", name: " " } };

  middleware(request, {}, () => {});

  assert.deepEqual(Object.keys(request.validationErrors), ["email", "name"]);
  assert.match(request.validationErrors.email[0], /valid email/);
  assert.match(request.validationErrors.name[0], /required/);
});
