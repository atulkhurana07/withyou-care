// Sends only a fixed fictional PDF. Does not load any patient record or enable application AI.
import { PDFDocument, StandardFonts } from "pdf-lib";
process.loadEnvFile("apps/website/.env.local");
process.env.GEMINI_DATA_APPROVED = "true";
const { readPrescriptionDocument } =
  await import("../apps/website/src/lib/document-reading");
const originalFetch = globalThis.fetch;
globalThis.fetch = async (...args) => {
  const response = await originalFetch(...args);
  if (!response.ok) {
    const error = await response.clone().json();
    const message = String(error.error?.message || "").replaceAll(
      process.env.GEMINI_API_KEY || "__no_key__",
      "[redacted]",
    );
    console.log(
      JSON.stringify({
        providerStatus: response.status,
        reason: message.slice(0, 800),
      }),
    );
  }
  return response;
};
const document = await PDFDocument.create();
const font = await document.embedFont(StandardFonts.Helvetica);
document
  .addPage()
  .drawText(
    "FICTIONAL TRAINING DOCUMENT\nExamplemed 10 mg\nOnce daily. Review with clinician.",
    { font, size: 16 },
  );
const result = await readPrescriptionDocument(
  Buffer.from(await document.save()),
  "application/pdf",
);
const passed =
  result.transcription.includes("Examplemed") &&
  result.transcription.includes("10");
console.log(
  JSON.stringify({
    syntheticDocumentReadingPassed: passed,
    unclearAreas: result.unclear.length,
    approvalGranted: false,
  }),
);
if (!passed) process.exitCode = 1;
