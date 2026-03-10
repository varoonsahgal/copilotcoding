import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";

function makeResponse(status, body = {}, headers = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get(name) {
        return headers[name] ?? headers[name.toLowerCase()] ?? null;
      }
    },
    async json() {
      return body;
    }
  };
}

describe("GET /api/quote", () => {
  it("returns 400 when zip is missing", async () => {
    const app = createApp();

    const response = await request(app).get("/api/quote");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("zip is required");
  });

  it("returns quote data when downstream succeeds", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      makeResponse(200, {
        carrier: "ParcelPro",
        price: 12.99,
        currency: "USD"
      })
    );

    const app = createApp({ fetchImpl });

    const response = await request(app).get("/api/quote?zip=33139");

    expect(response.status).toBe(200);
    expect(response.body.quote.carrier).toBe("ParcelPro");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("returns 502 when downstream keeps failing", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(makeResponse(503));

    const app = createApp({ fetchImpl });

    const response = await request(app).get("/api/quote?zip=33139");

    expect(response.status).toBe(502);
    expect(response.body.error).toBe("Unable to fetch shipping quote");
  });
});
