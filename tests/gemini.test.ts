import { test } from "node:test";
import assert from "node:assert/strict";
import { extractNotes } from "../apps/website/src/lib/extraction";
const note =
  "Examplemed 10mg 1tablet oral once daily 08:00 2026-10-13 2026-10-15";
const medicine = {
  name: "Examplemed",
  strength: "10mg",
  dose: "1tablet",
  route: "oral",
  frequency: "once daily",
  times: "08:00",
  start: "2026-10-13",
  end: "2026-10-15",
  food: "",
};
test("Gemini extraction preserves source, never grants approval, and fails closed", async () => {
  const saved = { ...process.env };
  const previousFetch = globalThis.fetch;
  let calls = 0;
  let result: unknown = { medicines: [{ source: note, medicine }] };
  let status = "completed";
  try {
    process.env.AI_PROVIDER = "gemini";
    process.env.GEMINI_API_KEY = "fake-test-key";
    process.env.GEMINI_MODEL = "gemini-3.5-flash-lite";
    delete process.env.GEMINI_DATA_APPROVED;
    globalThis.fetch = (async (url, init) => {
      calls++;
      assert.equal(
        url,
        "https://generativelanguage.googleapis.com/v1beta/interactions",
      );
      const body = JSON.parse(init!.body as string);
      assert.equal(body.store, false);
      assert.equal(body.input, note);
      assert.equal(body.response_format.mime_type, "application/json");
      assert.ok(body.response_format.schema);
      return Response.json({
        status,
        steps: [
          {
            type: "model_output",
            content: [{ type: "text", text: JSON.stringify(result) }],
          },
        ],
      });
    }) as typeof fetch;
    assert.equal((await extractNotes(note))[0].status, "needs_clarification");
    assert.equal(calls, 0); // No sensitive-data transmission before configuration approval.
    process.env.GEMINI_DATA_APPROVED = "true";
    const valid = (await extractNotes(note))[0];
    assert.equal(valid.status, "extracted");
    assert.equal(valid.source, note);
    assert.deepEqual(valid.times, ["08:00"]);
    result = { medicines: [{ source: "Invented source", medicine }] };
    assert.equal((await extractNotes(note))[0].status, "needs_clarification");
    result = {
      medicines: [
        { source: note, medicine: { ...medicine, dose: "invented-dose" } },
      ],
    };
    assert.equal((await extractNotes(note))[0].status, "needs_clarification");
    result = {
      medicines: [{ source: note, medicine: { ...medicine, times: "" } }],
    };
    assert.deepEqual((await extractNotes(note))[0].times, []);
    status = "incomplete";
    assert.equal((await extractNotes(note))[0].status, "needs_clarification");
    globalThis.fetch = (async () =>
      Response.json({}, { status: 429 })) as typeof fetch;
    assert.equal((await extractNotes(note))[0].status, "needs_clarification");
  } finally {
    globalThis.fetch = previousFetch;
    for (const key of [
      "AI_PROVIDER",
      "GEMINI_API_KEY",
      "GEMINI_MODEL",
      "GEMINI_DATA_APPROVED",
    ]) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  }
});
