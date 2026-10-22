import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, dirname, basename } from "node:path";
import { sendTransactionalEmail } from "../apps/website/src/lib/mail";
test("local mail saves a preview without contacting Resend and is blocked in cloud", async () => {
  const mode = process.env.EMAIL_MODE;
  const firebase = process.env.FIREBASE_MODE;
  const cwd = process.cwd();
  const temporary = await mkdtemp(join(tmpdir(), "withyou-mail-test-"));
  const fetch = globalThis.fetch;
  try {
    process.chdir(temporary);
    process.env.EMAIL_MODE = "local";
    process.env.FIREBASE_MODE = "emulator";
    globalThis.fetch = (async () => {
      throw new Error("External sending must not occur.");
    }) as typeof fetch;
    assert.equal(
      (
        await sendTransactionalEmail(
          "fictional@withyou.test",
          "Welcome",
          "Account created",
        )
      ).status,
      "preview_available",
    );
    const [filename] = await readdir(join(temporary, ".local-mail"));
    const message = JSON.parse(
      await readFile(join(temporary, ".local-mail", filename), "utf8"),
    );
    assert.equal(message.to, "fictional@withyou.test");
    assert.equal(message.status, "preview_available");
    process.env.FIREBASE_MODE = "cloud";
    await assert.rejects(() =>
      sendTransactionalEmail(
        "fictional@withyou.test",
        "Welcome",
        "No cloud preview",
      ),
    );
  } finally {
    process.chdir(cwd);
    globalThis.fetch = fetch;
    if (mode === undefined) delete process.env.EMAIL_MODE;
    else process.env.EMAIL_MODE = mode;
    if (firebase === undefined) delete process.env.FIREBASE_MODE;
    else process.env.FIREBASE_MODE = firebase;
    assert.equal(dirname(resolve(temporary)), resolve(tmpdir()));
    assert.ok(basename(temporary).startsWith("withyou-mail-test-"));
    await rm(temporary, { recursive: true, force: true });
  }
});
