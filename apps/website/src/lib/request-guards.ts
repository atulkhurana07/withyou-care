import { createHash } from "node:crypto";
import { db, cloudFirebase } from "./firebase";
const buckets = new Map<string, { count: number; until: number }>();
export async function consumeLimit(
  key: string,
  maximum: number,
  windowMs: number,
) {
  const id = createHash("sha256").update(key).digest("hex");
  const now = Date.now();
  if (cloudFirebase) {
    return db.runTransaction(async (tx) => {
      const ref = db.collection("rateLimits").doc(id);
      const record = (await tx.get(ref)).data();
      const count = record && record.until > now ? record.count : 0;
      const until =
        record && record.until > now ? record.until : now + windowMs;
      if (count >= maximum) return false;
      tx.set(ref, { count: count + 1, until, expiresAt: new Date(until) });
      return true;
    });
  }
  if (buckets.size > 10000)
    for (const [oldKey, bucket] of buckets)
      if (bucket.until <= now) buckets.delete(oldKey);
  if (buckets.size > 10000 && !buckets.has(id)) return false;
  const record = buckets.get(id);
  const count = record && record.until > now ? record.count : 0;
  if (count >= maximum) return false;
  buckets.set(id, {
    count: count + 1,
    until: record && record.until > now ? record.until : now + windowMs,
  });
  return true;
}
export async function boundedJson(req: Request) {
  const reader = req.body?.getReader();
  if (!reader) return {};
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.length;
      if (bytes > 32768) {
        await reader.cancel();
        throw new Error("Request exceeds the 32 KB limit.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = Buffer.concat(chunks).toString("utf8");
  return JSON.parse(body || "{}");
}
