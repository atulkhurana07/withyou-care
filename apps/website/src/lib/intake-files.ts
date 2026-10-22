import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
export const uploadLimit = 8 * 1024 * 1024;
export async function validatePrescriptionFile(bytes: Buffer) {
  if (!bytes.length || bytes.length > uploadLimit)
    throw new Error("Choose a file between 1 byte and 8 MB.");
  if (bytes.subarray(0, 5).toString() === "%PDF-") {
    const pdf = await PDFDocument.load(bytes, { updateMetadata: false });
    if (pdf.isEncrypted || pdf.getPageCount() < 1 || pdf.getPageCount() > 10)
      throw new Error("Use an unencrypted PDF with 1–10 pages.");
    // Active PDF content cannot be accepted as an ordinary medical scan.
    const objects = [...pdf.context.enumerateIndirectObjects()]
      .map(([, object]) => object.toString())
      .join("\n");
    if (
      /\/(JavaScript|JS|Launch|EmbeddedFiles|OpenAction|AA|RichMedia|AcroForm)\b/.test(
        objects,
      )
    )
      throw new Error(
        "Use a plain scanned PDF without forms, attachments or active content.",
      );
    return {
      bytes,
      type: "application/pdf",
      extension: "pdf",
      pages: pdf.getPageCount(),
      quality: "All pages require a legibility check by your clinician.",
    };
  }
  const png = bytes
    .subarray(0, 8)
    .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (!png && !jpeg)
    throw new Error("Only genuine JPEG, PNG and PDF files are supported.");
  const image = sharp(bytes, { limitInputPixels: 20000000, failOn: "warning" });
  const meta = await image.metadata();
  if (
    !meta.width ||
    !meta.height ||
    (meta.pages || 1) > 1 ||
    Math.min(meta.width, meta.height) < 400
  )
    throw new Error("Use one clear image at least 400 pixels on each side.");
  const clean = await image.rotate().png().toBuffer();
  if (clean.length > uploadLimit)
    throw new Error(
      "The decoded image is too large. Use a smaller clear photograph.",
    );
  return {
    bytes: clean,
    type: "image/png",
    extension: "png",
    pages: 1,
    quality:
      "File opens correctly. Blur, handwriting and patient identity still require human review.",
  };
}
