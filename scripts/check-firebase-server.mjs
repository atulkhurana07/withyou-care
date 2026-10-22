// Read-only cloud checks. Never print private key, account address, tokens or record data.
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { initializeApp, cert, deleteApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
let app;
try {
  const credentials = JSON.parse(
    await readFile(resolve("secrets/firebase-service-account.json"), "utf8"),
  );
  if (
    credentials.type !== "service_account" ||
    credentials.project_id !== "withyou-ef85d" ||
    !credentials.private_key ||
    !credentials.client_email
  )
    throw new Error("invalid_credential_file");
  delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
  delete process.env.FIRESTORE_EMULATOR_HOST;
  app = initializeApp(
    { projectId: credentials.project_id, credential: cert(credentials) },
    "cloud-credential-check",
  );
  const checks = await Promise.allSettled([
    getAuth(app).listUsers(1),
    getFirestore(app).listCollections(),
  ]);
  const token = await app.options.credential.getAccessToken();
  const databaseResponse = await fetch(
    "https://firestore.googleapis.com/v1/projects/withyou-ef85d/databases",
    {
      headers: { Authorization: `Bearer ${token.access_token}` },
      signal: AbortSignal.timeout(15000),
    },
  );
  const databaseMetadata = await databaseResponse.json();
  const databaseStatus = {
    httpStatus: databaseResponse.status,
    reason:
      databaseMetadata.error?.details?.find((d) => d.reason)?.reason ||
      databaseMetadata.error?.status ||
      "available",
  };
  console.log(
    JSON.stringify(
      {
        fileValid: true,
        authenticationAccessible: checks[0].status === "fulfilled",
        firestoreAccessible: checks[1].status === "fulfilled",
        databaseStatus,
        errors: checks.map((c) =>
          c.status === "rejected" ? c.reason?.code || "request_failed" : null,
        ),
      },
      null,
      2,
    ),
  );
} catch {
  console.log(
    JSON.stringify({
      fileValid: false,
      reason: "file_missing_invalid_or_unreadable",
    }),
  );
  process.exitCode = 1;
} finally {
  if (app) await deleteApp(app);
}
