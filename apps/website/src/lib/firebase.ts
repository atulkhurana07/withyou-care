import { initializeApp, getApps, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
export const firebaseMode = process.env.FIREBASE_MODE || "emulator";
if (!["emulator", "cloud"].includes(firebaseMode))
  throw new Error("Invalid FIREBASE_MODE.");
export const cloudFirebase = firebaseMode === "cloud";
const projectId =
  process.env.FIREBASE_PROJECT_ID || (cloudFirebase ? "" : "demo-withyou");
if (cloudFirebase) {
  if (!projectId || projectId.startsWith("demo-"))
    throw new Error("A real Firebase project ID is required in cloud mode.");
  if (
    process.env.FIRESTORE_EMULATOR_HOST ||
    process.env.FIREBASE_AUTH_EMULATOR_HOST ||
    process.env.FIREBASE_STORAGE_EMULATOR_HOST
  )
    throw new Error("Remove emulator endpoints before selecting cloud mode.");
} else {
  if (!projectId.startsWith("demo-"))
    throw new Error("Use a demo- project ID for local emulators.");
  process.env.FIRESTORE_EMULATOR_HOST ||= "127.0.0.1:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST ||= "127.0.0.1:9099";
}
export const identityBase = cloudFirebase
  ? "https://identitytoolkit.googleapis.com/v1"
  : `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1`;
export const identityKey = cloudFirebase
  ? process.env.FIREBASE_WEB_API_KEY
  : "demo-key";
const app =
  getApps()[0] ??
  initializeApp({
    projectId,
    ...(cloudFirebase ? { credential: applicationDefault() } : {}),
  });
export const db = getFirestore(app);
export const auth = getAuth(app);
