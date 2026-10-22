import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { printableLines } from "../apps/website/src/lib/print-layout";
test("printing preserves Hindi and refuses unsupported characters rather than deleting them", async () => {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(
    await readFile("apps/website/public/fonts/NotoSansDevanagari.ttf"),
    { subset: true },
  );
  const text = "रोगी कमला देवी सुबह दवा लें";
  const lines = printableLines(text, font, 11, 100);
  assert.equal(lines.join("").replace(/\s/g, ""), text.replace(/\s/g, ""));
  for (const line of lines) assert.ok(font.widthOfTextAtSize(line, 11) <= 100);
  assert.throws(() => printableLines("Medicine 🦄", font, 11));
  pdf.addPage().drawText(text, { font, size: 16 });
  assert.ok((await pdf.save()).byteLength > 1000);
});
