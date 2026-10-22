import { test } from "node:test";
import assert from "node:assert/strict";
import {
  canUseDevelopmentCheckout,
  acceptedTestCard,
} from "../apps/website/src/lib/development-checkout";
test("development activation cannot be enabled in cloud mode", () => {
  assert.equal(canUseDevelopmentCheckout("cloud", "true"), false);
  assert.equal(canUseDevelopmentCheckout("emulator", undefined), false);
  assert.equal(canUseDevelopmentCheckout("emulator", "false"), false);
  assert.equal(canUseDevelopmentCheckout("emulator", "true"), true);
  assert.equal(acceptedTestCard("visa-success"), true);
  assert.equal(acceptedTestCard("4111111111111111"), false);
});
