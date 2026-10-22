import type { Candidate } from "../../../../packages/shared-types";
export type Medicine = {
  name: string;
  strength: string;
  dose: string;
  route: string;
  frequency: string;
  times: string;
  start: string;
  end: string;
  food: string;
};
export function fromMedicine(m: Medicine, id = "medicine-1"): Candidate {
  const times = m.times
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const issues: string[] = [];
  for (const field of ["start", "end"] as const) {
    if (
      m[field] &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(m[field]) ||
        !Number.isFinite(Date.parse(m[field])) ||
        new Date(m[field]).toISOString().slice(0, 10) !== m[field])
    )
      issues.push(`Invalid ${field} date.`);
  }
  for (const key of [
    "name",
    "strength",
    "dose",
    "route",
    "frequency",
    "start",
    "end",
  ] as const)
    if (!m[key].trim()) issues.push(`Missing ${key}`);
  if (/\b(sos|prn|as needed)\b/i.test(m.frequency))
    issues.push(
      "Conditional medicine requires explicit clinical conditions; recurring reminders are blocked.",
    );
  if (!times.length || times.some((t) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(t)))
    issues.push("Clinician-approved reminder times are required (HH:mm).");
  if (m.start && m.end && m.end < m.start)
    issues.push("End date precedes start date.");
  if (
    m.start &&
    m.end &&
    (Date.parse(m.end) - Date.parse(m.start)) / 86400000 > 29
  )
    issues.push("The demo supports treatment periods up to 30 days.");
  if (times.length > 4)
    issues.push("The demo supports up to four approved times per day.");
  if (/once|\bOD\b/i.test(m.frequency) && times.length !== 1)
    issues.push("Once daily requires one explicit time.");
  if (
    !/^(once daily|twice daily|three times daily|four times daily|OD|BD|TDS|QID)$/i.test(
      m.frequency.trim(),
    )
  )
    issues.push(
      "Unsupported frequency. Use explicit daily frequency or clarify the instruction.",
    );
  if (/twice|\bBD\b/i.test(m.frequency) && times.length !== 2)
    issues.push("Twice daily requires two explicit times.");
  if (/three|\bTDS\b/i.test(m.frequency) && times.length !== 3)
    issues.push("Three daily doses require three explicit times.");
  if (/four|\bQID\b/i.test(m.frequency) && times.length !== 4)
    issues.push("Four daily doses require four explicit times.");
  if (new Set(times).size !== times.length)
    issues.push("Duplicate reminder times.");
  const instruction = [m.strength, m.dose, m.route, m.frequency, m.food]
    .filter(Boolean)
    .join(" · ");
  return {
    id,
    title: m.name || "Unnamed medicine",
    instruction,
    source: JSON.stringify(m),
    times,
    start: m.start,
    end: m.end,
    type: "medication",
    issues,
    status: issues.length ? "needs_clarification" : "extracted",
  };
}
export function occurrenceDates(start: string, end: string): string[] {
  const dates: string[] = [];
  for (
    let time = Date.parse(start);
    time <= Date.parse(end) && dates.length < 30;
    time += 86400000
  )
    dates.push(new Date(time).toISOString().slice(0, 10));
  return dates;
}
// Conservative offline fixture parser, not an AI service. Unsupported text is never guessed.
export function extractFixture(notes: string): Candidate[] {
  if (!notes.trim()) return [];
  return notes
    .split("\n")
    .filter((s) => s.trim())
    .map((source, i) => ({
      id: `text-${i}`,
      title: "Instruction requiring review",
      instruction: source,
      source,
      times: [],
      start: "",
      end: "",
      type: "care",
      status: "needs_clarification",
      issues: [
        "Free-text AI provider is not configured. Enter structured instructions or clarify this item.",
      ],
    }));
}
export function publicationIssues(candidates: Candidate[]): string[] {
  const included = candidates.filter((c) => c.status !== "rejected");
  if (!included.length) return ["At least one verified task is required."];
  const issues = included.flatMap((c) =>
    c.status !== "verified"
      ? [`${c.title}: verify or reject this instruction.`]
      : c.issues.map((i) => `${c.title}: ${i}`),
  );
  const seen = new Set<string>();
  if (
    included.reduce(
      (count, c) =>
        count + occurrenceDates(c.start, c.end).length * c.times.length,
      0,
    ) > 200
  )
    issues.push(
      "The demo supports at most 200 scheduled occurrences per approved plan.",
    );
  for (const c of included) {
    const key = `${c.title.toLowerCase()}|${c.start}|${c.end}`;
    if (seen.has(key)) issues.push(`Duplicate instruction: ${c.title}`);
    seen.add(key);
  }
  return issues;
}
