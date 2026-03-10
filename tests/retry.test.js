import { describe, expect, it, vi } from "vitest";
import { fetchWithRetry } from "../src/retry.js";

function createResponse(status, headers = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get(name) {
        return headers[name] ?? headers[name.toLowerCase()] ?? null;
      }
    }
  };
}

describe("fetchWithRetry", () => {
  it("returns immediately on success", async () => {
    const requestFn = vi.fn().mockResolvedValue(createResponse(200));

    const result = await fetchWithRetry(requestFn, { retries: 3 });

    expect(result.status).toBe(200);
    expect(requestFn).toHaveBeenCalledTimes(1);
  });

  it("should honor Retry-After for 429 responses", async () => {
    const requestFn = vi
      .fn()
      .mockResolvedValueOnce(createResponse(429, { "Retry-After": "2" }))
      .mockResolvedValueOnce(createResponse(200));

    const start = Date.now();
    const result = await fetchWithRetry(requestFn, { retries: 1 });
    const elapsedMs = Date.now() - start;

    expect(result.status).toBe(200);

    // We expect a wait close to 2 seconds.
    // This will FAIL with the seeded buggy implementation.
    expect(elapsedMs).toBeGreaterThanOrEqual(1900);
  });

  it("should not retry for 400 bad request", async () => {
    const requestFn = vi.fn().mockResolvedValue(createResponse(400));

    const result = await fetchWithRetry(requestFn, { retries: 3 });

    expect(result.status).toBe(400);
    expect(requestFn).toHaveBeenCalledTimes(1);
  });
});
