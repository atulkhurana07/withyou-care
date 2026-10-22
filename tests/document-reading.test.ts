import test from "node:test";
import assert from "node:assert/strict";
import { readPrescriptionDocument } from "../apps/website/src/lib/document-reading";
test("document reading is data-gated and never produces an approval state", async () => {
  const saved = { ...process.env },
    originalFetch = globalThis.fetch;
  let calls = 0;
  try {
    process.env.GEMINI_API_KEY = "synthetic-key";
    delete process.env.GEMINI_DATA_APPROVED;
    globalThis.fetch = (async (_url, init) => {
      calls++;
      const body = JSON.parse(String(init?.body));
      assert.equal(body.store, false);
      assert.equal(body.input[0].type, "document");
      return Response.json({
        status: "completed",
        steps: [
          {
            type: "model_output",
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  transcription: "Fictional wording",
                  unclear: ["An unreadable date"],
                }),
              },
            ],
          },
        ],
      });
    }) as typeof fetch;
    await assert.rejects(
      readPrescriptionDocument(Buffer.from("synthetic"), "application/pdf"),
    );
    assert.equal(calls, 0);
    process.env.GEMINI_DATA_APPROVED = "true";
    const result = await readPrescriptionDocument(
      Buffer.from("synthetic"),
      "application/pdf",
    );
    assert.equal(result.transcription, "Fictional wording");
    assert.equal("approved" in result, false);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
    process.env = saved;
  }
});
