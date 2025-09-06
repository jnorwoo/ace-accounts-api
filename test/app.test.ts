import request from "supertest";
import { app } from "../src/app";

describe("accounts api day 1", () => {
  it("Health ok should return 200 OK", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });

  it("Accounts should return empty list", async () => {
    const response = await request(app).get("/accounts");
    expect(response.status).toBe(200);
    expect(Array.isArray((response.body as { items: unknown[] }).items)).toBe(true);
  });
});
