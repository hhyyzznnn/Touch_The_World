import assert from "node:assert/strict";
import test from "node:test";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

test("허용 횟수까지는 통과하고 그다음부터 차단한다", async () => {
  const key = `test:${Date.now()}:${Math.random()}`;
  const results = [];
  for (let i = 0; i < 4; i++) results.push(await checkRateLimit(key, 3, 60_000));
  assert.deepEqual(results.map((r) => r.allowed), [true, true, true, false]);
  assert.deepEqual(results.map((r) => r.remaining), [2, 1, 0, 0]);
});

test("키가 다르면 서로 영향을 주지 않는다", async () => {
  const base = `test:${Date.now()}:${Math.random()}`;
  await checkRateLimit(`${base}:a`, 1, 60_000);
  assert.equal((await checkRateLimit(`${base}:a`, 1, 60_000)).allowed, false);
  assert.equal((await checkRateLimit(`${base}:b`, 1, 60_000)).allowed, true);
});

test("차단 응답은 429와 재시도 시간을 본문·헤더 양쪽에 담는다", async () => {
  const response = rateLimitResponse(
    { allowed: false, remaining: 0, resetTime: Date.now() + 30_000, source: "memory" },
    "잠시 후 다시 시도해주세요.",
    { meta: { isAuthenticated: false } }
  );
  assert.equal(response.status, 429);
  const body = await response.json();
  assert.equal(body.error, "잠시 후 다시 시도해주세요.");
  assert.equal(body.meta.isAuthenticated, false);
  assert.ok(body.retryAfter >= 29 && body.retryAfter <= 30);
  assert.equal(response.headers.get("Retry-After"), String(body.retryAfter));
});
