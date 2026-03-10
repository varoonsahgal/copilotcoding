import { fetchWithRetry } from "./retry.js";
import { logError, logInfo } from "./logger.js";

export async function getShippingQuote(zip, deps = {}) {
  const fetchImpl = deps.fetchImpl ?? global.fetch;

  const requestFn = async () => {
    const response = await fetchImpl(
      `https://shipping.example.test/quote?zip=${encodeURIComponent(zip)}`
    );
    return response;
  };

  const response = await fetchWithRetry(requestFn, { retries: 3 });

  if (!response.ok) {
    logError("Shipping quote request failed", { status: response.status });
    throw new Error(`Downstream shipping provider failed with ${response.status}`);
  }

  const data = await response.json();

  logInfo("Shipping quote fetched", { zip, carrier: data.carrier });

  return data;
}
