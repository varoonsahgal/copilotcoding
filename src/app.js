import express from "express";
import { getShippingQuote } from "./shippingClient.js";
import { logError } from "./logger.js";

export function createApp(deps = {}) {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/quote", async (req, res) => {
    const zip = req.query.zip;

    if (!zip) {
      return res.status(400).json({
        error: "zip is required"
      });
    }

    try {
      const data = await getShippingQuote(zip, deps);
      return res.json({
        quote: data
      });
    } catch (error) {
      logError("Quote endpoint failed", { error: error.message });

      return res.status(502).json({
        error: "Unable to fetch shipping quote"
      });
    }
  });

  return app;
}
