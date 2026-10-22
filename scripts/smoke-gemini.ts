// Fixed synthetic input only. No patient records are loaded or sent by this script.
process.loadEnvFile("apps/website/.env.local");
process.env.GEMINI_DATA_APPROVED = "true";
const { extractNotes } = await import("../apps/website/src/lib/extraction");
const note =
  "Fictional training instruction: Examplemed 10mg, 1tablet, oral, once daily, 08:00, 2026-10-13 to 2026-10-15.";
const candidates = await extractNotes(note);
const success =
  candidates.length === 1 &&
  candidates[0].title === "Examplemed" &&
  candidates[0].source.includes("Examplemed") &&
  candidates[0].status !== "verified" &&
  candidates[0].times.includes("08:00");
console.log(
  JSON.stringify(
    {
      model: process.env.GEMINI_MODEL,
      syntheticExtractionPassed: success,
      candidates: candidates.length,
      approvalGranted: candidates.some((c) => c.status === "verified"),
    },
    null,
    2,
  ),
);
if (!success) process.exitCode = 1;
