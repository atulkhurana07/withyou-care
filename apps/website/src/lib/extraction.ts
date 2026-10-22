import { z } from "zod";
import { extractFixture, fromMedicine } from "./clinical";
import { requestGeminiExtraction } from "./gemini";
import type { Candidate } from "../../../../packages/shared-types";
const outputSchema = z.object({
  medicines: z
    .array(
      z.object({
        source: z.string().min(1),
        medicine: z.object({
          name: z.string(),
          strength: z.string(),
          dose: z.string(),
          route: z.string(),
          frequency: z.string(),
          times: z.string(),
          start: z.string(),
          end: z.string(),
          food: z.string(),
        }),
      }),
    )
    .max(10),
});
/** Vendor-neutral server adapter. The provider is never allowed to supply approval states. */
export async function extractNotes(notes: string): Promise<Candidate[]> {
  if (!notes.trim()) return [];
  const gemini = process.env.AI_PROVIDER === "gemini";
  if (gemini && process.env.GEMINI_DATA_APPROVED !== "true")
    return extractFixture(notes).map((c) => ({
      ...c,
      issues: [
        "Automated extraction requires an approved data-processing configuration. Enter structured fields to continue.",
      ],
    }));
  if (!gemini && !process.env.AI_EXTRACTION_URL) return extractFixture(notes);
  try {
    let rawResult: unknown;
    if (gemini) rawResult = await requestGeminiExtraction(notes);
    else {
      const endpoint = new URL(process.env.AI_EXTRACTION_URL!);
      if (
        endpoint.protocol !== "https:" &&
        !["127.0.0.1", "localhost"].includes(endpoint.hostname)
      )
        throw new Error("Extraction provider must use HTTPS.");
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.AI_EXTRACTION_KEY || ""}`,
        },
        body: JSON.stringify({
          text: notes,
          instructions:
            "Extract only documented medication fields. Do not invent dose, frequency, food, dates or exact times. Preserve verbatim source. Missing fields must be empty strings. Return {medicines:[{source,medicine:{name,strength,dose,route,frequency,times,start,end,food}}]}.",
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error("Extraction provider unavailable.");
      rawResult = await response.json();
    }
    const result = outputSchema.parse(rawResult);
    if (!result.medicines.length) return extractFixture(notes);
    return result.medicines.map((item, i) => {
      if (!notes.includes(item.source))
        throw new Error("Extracted source is not in the original document.");
      const candidate = fromMedicine(item.medicine, `ai-${i}`);
      // Values absent from verbatim source require explicit correction, rather than silent normalization.
      for (const [field, value] of Object.entries(item.medicine)) {
        if (value && !item.source.toLowerCase().includes(value.toLowerCase()))
          candidate.issues.push(
            `${field} is not verbatim in its source. Clinician correction required.`,
          );
      }
      return {
        ...candidate,
        source: item.source,
        status: candidate.issues.length ? "needs_clarification" : "extracted",
      };
    });
  } catch {
    return extractFixture(notes).map((c) => ({
      ...c,
      issues: [
        "Extraction failed or returned unsupported data. Enter structured fields or clarify this instruction.",
      ],
    }));
  }
}
