import test from "node:test";
import assert from "node:assert/strict";
import { emulatorArgs } from "../scripts/start-emulators.mjs";
test("a fresh clone starts without importing a missing private export", () => {
  assert.equal(
    emulatorArgs(false).some((value) => value.startsWith("--import=")),
    false,
  );
  assert.ok(emulatorArgs(false).includes("--export-on-exit=./firebase/data"));
});
test("later emulator launches restore the existing local export", () => {
  assert.ok(emulatorArgs(true).includes("--import=./firebase/data"));
  assert.deepEqual(emulatorArgs(true).slice(0, 3), [
    "emulators:start",
    "--project",
    "demo-withyou",
  ]);
});
