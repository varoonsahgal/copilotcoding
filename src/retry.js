import { logWarn } from "./logger.js";

/**
 * BUGGY implementation on purpose for the lab.
 *
 * Problems:
 * 1. Retries immediately with no backoff.
 * 2. Ignores Retry-After entirely.
 * 3. Retries on every non-2xx status, including many cases where retrying is not useful.
 * 4. Produces noisy warning logs on every retry.
 */
export async function fetchWithRetry(requestFn, options = {}) {
  const retries = options.retries ?? 3;

  let lastResponse;
  let lastError;

  for (let attempt = 1; attempt <= retries + 1; attempt += 1) {
    try {
      const response = await requestFn();
      lastResponse = response;

      if (response.ok) {
        return response;
      }

      if (attempt <= retries) {
        logWarn("Retrying downstream request", {
          attempt,
          status: response.status
        });
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;

      if (attempt <= retries) {
        logWarn("Retrying after thrown error", {
          attempt,
          error: error.message
        });
        continue;
      }

      throw error;
    }
  }

  if (lastResponse) {
    return lastResponse;
  }

  throw lastError ?? new Error("Unknown retry failure");
}
