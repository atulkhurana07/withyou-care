import { execFileSync } from "node:child_process";
import { readFileSync, statSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const git = (...args) =>
  execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
const actual = git("rev-parse", "--show-toplevel");
if (resolve(actual).toLowerCase() !== resolve(root).toLowerCase()) {
  console.error(
    "Repository root must be the WithYou project folder. Initialize Git here, not in its parent.",
  );
  process.exit(1);
}
const candidates = [
  ...new Set(
    git(
      "ls-files",
      "--cached",
      "--others",
      "--exclude-standard",
      "-z",
      "--",
      ".",
    )
      .split("\0")
      .filter(Boolean),
  ),
];
const privateValues = [];
for (const name of [
  "apps/website/.env.local",
  "apps/website/.env.cloud.local",
]) {
  const path = resolve(root, name);
  if (!existsSync(path)) continue;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(
      /^\s*(?:GEMINI_API_KEY|RESEND_API_KEY|AI_EXTRACTION_KEY)\s*=\s*(.+)$/,
    );
    if (match) {
      const value = match[1].trim().replace(/^['"]|['"]$/g, "");
      if (value.length > 10) privateValues.push(value);
    }
  }
}
const issues = [];
for (const file of candidates) {
  if (
    /(^|\/)(secrets|\.local-mail|node_modules|\.next|\.dart_tool|build|test-results[^/]*)(\/|$)|(^|\/)firebase\/data\//.test(
      file,
    ) ||
    /\.(apk|aab|jks|keystore|p12|pem|log|tsbuildinfo)$/i.test(file) ||
    /(^|\/)\.env(?!\.example$)/.test(file) ||
    /firebase-service-account\.json$/i.test(file)
  )
    issues.push({
      file,
      issue: "Private or generated file must not be committed",
    });
  const path = resolve(root, file);
  if (!existsSync(path)) continue;
  const stat = statSync(path);
  if (!stat.isFile()) continue;
  if (stat.size > 100 * 1024 * 1024)
    issues.push({ file, issue: "Over GitHub ordinary file size limit" });
  if (stat.size > 20 * 1024 * 1024) continue;
  const bytes = readFileSync(path);
  if (bytes.includes(0)) continue;
  const text = bytes.toString("utf8");
  if (
    privateValues.some((value) => text.includes(value)) ||
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text) ||
    /\bre_[A-Za-z0-9_]{25,}\b/.test(text) ||
    /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\b/.test(
      text,
    )
  )
    issues.push({
      file,
      issue: "Potential secret; inspect locally before publishing",
    });
}
console.log(
  JSON.stringify(
    {
      ready: issues.length === 0,
      candidateFiles: candidates.length,
      issues,
      scope:
        "Source/binary-size hygiene only; not a full security or history audit.",
    },
    null,
    2,
  ),
);
if (issues.length) process.exitCode = 1;
