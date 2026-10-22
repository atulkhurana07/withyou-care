import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
export async function sendTransactionalEmail(
  to: string,
  subject: string,
  text: string,
) {
  if (process.env.EMAIL_MODE === "local") {
    if (process.env.FIREBASE_MODE && process.env.FIREBASE_MODE !== "emulator")
      throw new Error("Local email previews require the emulator environment.");
    const id = randomUUID();
    const directory = join(process.cwd(), ".local-mail");
    await mkdir(directory, { recursive: true });
    await writeFile(
      join(directory, `${id}.json`),
      JSON.stringify(
        {
          id,
          to,
          subject,
          text,
          status: "preview_available",
          createdAt: new Date().toISOString(),
        },
        null,
        2,
      ),
      { flag: "wx" },
    );
    return { status: "preview_available", providerId: id };
  }
  if (process.env.EMAIL_MODE && process.env.EMAIL_MODE !== "resend")
    throw new Error("Unsupported email mode.");
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM)
    throw new Error("Email delivery is not configured.");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [to],
      subject,
      text,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw new Error("Email provider did not accept this message.");
  const result = await response.json();
  return { status: "submitted", providerId: result.id };
}
