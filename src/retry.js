import { logWarn } from "./logger.js";

function isRetryable(status) {
  // Only retry on 429 (rate limited) and 5xx (server errors); skip all other 4xx.
  return status === 429 || status >= 500;
}

function getRetryAfterMs(response) {
  const header = response.headers.get("Retry-After");
  if (!header) return 0;
  const seconds = parseFloat(header);
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 0;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

      if (attempt <= retries && isRetryable(response.status)) {
        const delayMs = getRetryAfterMs(response);
        if (delayMs > 0) {
          await sleep(delayMs);
        }
        logWarn("Retrying downstream request", { attempt, status: response.status });
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;

      if (attempt <= retries) {
        logWarn("Retrying after thrown error", { attempt, error: error.message });
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
