import type { PDFFont } from "pdf-lib";
import "regenerator-runtime/runtime.js";
export function printableLines(
  value: string,
  font: PDFFont,
  size: number,
  width = 490,
) {
  const supported = new Set(font.getCharacterSet());
  for (const character of value)
    if (
      !["\n", "\r", "\t"].includes(character) &&
      !supported.has(character.codePointAt(0)!)
    )
      throw new Error(
        "This report contains characters unsupported by the print font. Text has not been removed; use an appropriate language template before printing.",
      );
  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  const lines: string[] = [];
  for (const paragraph of value
    .replace(/\r\n?/g, "\n")
    .replace(/\t/g, " ")
    .split("\n")) {
    let row = "";
    for (const { segment } of segmenter.segment(paragraph)) {
      if (row && font.widthOfTextAtSize(row + segment, size) > width) {
        lines.push(row.trimEnd());
        row = segment.trimStart();
      } else row += segment;
    }
    lines.push(row);
  }
  return lines;
}
