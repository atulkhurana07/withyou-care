import { test } from "node:test";
import assert from "node:assert/strict";
import { extractNotes } from "../apps/website/src/lib/extraction";
test("no configured provider leaves unsupported notes in clarification", async () => {
  const previous = process.env.AI_EXTRACTION_URL;
  delete process.env.AI_EXTRACTION_URL;
  try {
    const result = await extractNotes("Unclear instructions");
    assert.equal(result[0].status, "needs_clarification");
    assert.deepEqual(result[0].times, []);
  } finally {
    if (previous) process.env.AI_EXTRACTION_URL = previous;
  }
});
test("provider errors fail closed", async () => {
  const previous = process.env.AI_EXTRACTION_URL;
  process.env.AI_EXTRACTION_URL =
    "http://not-a-permitted-local-provider.invalid";
  try {
    const result = await extractNotes("Original source");
    assert.equal(result[0].source, "Original source");
    assert.equal(result[0].status, "needs_clarification");
  } finally {
    if (previous) process.env.AI_EXTRACTION_URL = previous;
    else delete process.env.AI_EXTRACTION_URL;
  }
});
