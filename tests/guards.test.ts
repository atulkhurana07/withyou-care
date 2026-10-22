import { test } from "node:test";
import assert from "node:assert/strict";
import { boundedJson, consumeLimit } from "../apps/website/src/lib/request-guards";
test("request limits reject oversized JSON and authentication bursts", async () => {
  const key = `test-${crypto.randomUUID()}`;
  assert.equal(await consumeLimit(key,2,60000), true);
  assert.equal(await consumeLimit(key,2,60000), true);
  assert.equal(await consumeLimit(key,2,60000), false);
  assert.deepEqual(await boundedJson(new Request("http://localhost",{method:"POST",body:JSON.stringify({value:"okay"})})),{value:"okay"});
  await assert.rejects(() => boundedJson(new Request("http://localhost",{method:"POST",body:JSON.stringify({value:"x".repeat(33000)})})));
});
