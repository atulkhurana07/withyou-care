// Read-only credential checks. Never prints keys, tokens, or raw provider errors.
import { existsSync } from "node:fs";
process.loadEnvFile("apps/website/.env.cloud.local");
async function inspect(provider, url, headers) {
  try {
    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(15000),
    });
    const data = await response.json();
    const result = { provider, status: response.status, ok: response.ok };
    if (provider === "gemini" && response.ok)
      result.modelAvailable =
        data.models?.some(
          (m) => m.name === `models/${process.env.GEMINI_MODEL}`,
        ) || false;
    if (provider === "resend" && response.ok)
      result.verifiedDomains = (data.data || [])
        .filter((d) => d.status === "verified")
        .map((d) => d.name);
    if (!response.ok)
      result.reason =
        data.error?.details?.find((d) => d.reason)?.reason ||
        data.error?.status ||
        data.name ||
        "request_rejected";
    return result;
  } catch {
    return { provider, ok: false, reason: "connection_failed" };
  }
}
const results = await Promise.all([
  inspect("gemini", "https://generativelanguage.googleapis.com/v1beta/models", {
    "x-goog-api-key": process.env.GEMINI_API_KEY,
  }),
  inspect("resend", "https://api.resend.com/domains", {
    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
  }),
  inspect(
    "firebase-web",
    `https://identitytoolkit.googleapis.com/v1/projects?key=${encodeURIComponent(process.env.FIREBASE_WEB_API_KEY)}`,
    {},
  ),
]);
results.push({
  provider: "firebase-server",
  credentialFileConfigured: Boolean(
    process.env.GOOGLE_APPLICATION_CREDENTIALS &&
    existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS),
  ),
});
console.log(JSON.stringify(results, null, 2));
