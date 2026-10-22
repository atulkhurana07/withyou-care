// Configuration check only. Passing is not clinical, privacy or security certification.
import { existsSync } from "node:fs";
process.loadEnvFile("apps/website/.env.local");
let url;
try {
  url = new URL(process.env.APP_URL || "");
} catch {}
const checks = {
  cloud_database_selected: process.env.FIREBASE_MODE === "cloud",
  production_environment_declared: process.env.APP_ENV === "production",
  development_checkout_disabled: process.env.DEVELOPMENT_CHECKOUT === "false",
  public_https_url:
    url?.protocol === "https:" &&
    !["localhost", "127.0.0.1"].includes(url.hostname),
  verified_sender_configured:
    process.env.EMAIL_MODE === "resend" &&
    Boolean(process.env.EMAIL_FROM) &&
    !process.env.EMAIL_FROM.includes("@resend.dev"),
  cloud_server_credential_configured:
    Boolean(
      process.env.GOOGLE_APPLICATION_CREDENTIALS &&
      existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS),
    ) || Boolean(process.env.K_SERVICE),
  ai_data_processing_approved:
    process.env.AI_PROVIDER !== "gemini" ||
    process.env.GEMINI_DATA_APPROVED === "true",
};
console.log(
  JSON.stringify(
    {
      configurationReady: Object.values(checks).every(Boolean),
      checks,
      notice:
        "Cloud runtime tests, clinical approval, privacy review, MFA, delivery, monitoring, backups and native device testing are separate required release gates.",
    },
    null,
    2,
  ),
);
if (!Object.values(checks).every(Boolean)) process.exitCode = 1;
