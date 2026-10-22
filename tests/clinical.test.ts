import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fromMedicine,
  extractFixture,
  publicationIssues,
  occurrenceDates,
} from "../apps/website/src/lib/clinical";
const medicine = {
  name: "Synthetic medicine",
  strength: "demo strength",
  dose: "demo unit",
  route: "documented route",
  frequency: "twice daily",
  times: "08:00, 20:00",
  start: "2026-10-13",
  end: "2026-10-15",
  food: "",
};
test("each treatment day receives a separate occurrence, including both boundaries", () => {
  assert.deepEqual(occurrenceDates("2026-10-13", "2026-10-15"), [
    "2026-10-13",
    "2026-10-14",
    "2026-10-15",
  ]);
  assert.deepEqual(occurrenceDates("2026-10-15", "2026-10-13"), []);
});
test("structured values preserve source and require human verification", () => {
  const c = fromMedicine(medicine);
  assert.equal(c.status, "extracted");
  assert.deepEqual(c.times, ["08:00", "20:00"]);
  assert.equal(c.source, JSON.stringify(medicine));
  assert.ok(publicationIssues([c]).length);
  assert.deepEqual(publicationIssues([{ ...c, status: "verified" }]), []);
});
test("BD never invents a timing or food instruction", () => {
  const c = fromMedicine({ ...medicine, frequency: "BD", times: "" });
  assert.equal(c.status, "needs_clarification");
  assert.equal(c.times.length, 0);
  assert.ok(!c.instruction.includes("food"));
});
test("conditional medicines cannot become recurring reminders", () => {
  const c = fromMedicine({ ...medicine, frequency: "SOS" });
  assert.ok(c.issues.some((i) => i.includes("Conditional")));
  assert.ok(publicationIssues([{ ...c, status: "verified" }]).length);
});
test("invalid dates and duplicate timings are rejected", () => {
  const c = fromMedicine({
    ...medicine,
    start: "2026-10-15",
    end: "2026-10-13",
    times: "08:00, 08:00",
  });
  assert.equal(c.issues.length, 2);
});
test("unconfigured free text remains blocked instead of guessed", () => {
  const c = extractFixture("Medication BD after meals")[0];
  assert.equal(c.source, "Medication BD after meals");
  assert.equal(c.status, "needs_clarification");
  assert.deepEqual(c.times, []);
});
test("a rejected-only or duplicate plan cannot be published", () => {
  const c = { ...fromMedicine(medicine), status: "verified" as const };
  assert.ok(publicationIssues([{ ...c, status: "rejected" }]).length);
  assert.ok(publicationIssues([c, c]).some((i) => i.includes("Duplicate")));
});
