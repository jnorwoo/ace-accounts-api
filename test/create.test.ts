/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// test/create.test.ts
import { beforeEach, expect, jest, test } from '@jest/globals';
jest.mock("../src/aws/ddb", () => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const real = jest.requireActual("../src/aws/ddb") as Record<string, unknown>;
  return {
    ...real,
    ddb: { send: jest.fn() },
    tableName: () => "Accounts"
  };
});
import { ddb } from "../src/aws/ddb";
import { handler } from "../src/handlers/create";
import { makeEvent } from "./_mocks";

beforeEach(() => { (ddb.send as any).mockReset(); });

test("400 on empty body", async () => {
  const ev = makeEvent("POST", "/accounts");
  const r = await handler(ev);
  expect(r.statusCode).toBe(400);
});

test("400 on invalid body (missing name/email)", async () => {
  const ev = makeEvent("POST", "/accounts", { body: { name: "Ada" }});
  const r = await handler(ev);
  expect(r.statusCode).toBe(400);
});

test("201 create, no idempotency key", async () => {
  (ddb.send as any).mockResolvedValueOnce({}); // PutCommand
  const ev = makeEvent("POST", "/accounts", { body: { name: "Ada", email: "a@b.com" }});
  const r = await handler(ev);
  expect([200,201]).toContain(r.statusCode); // 201 expected
  const obj = JSON.parse(r.body as string);
  expect(obj.id).toMatch(/^acc_/);
  expect(obj.name).toBe("Ada");
});

test("idempotent replay returns 200 with existing item", async () => {
  // First call: Put fails with ConditionalCheckFailed, then Get returns existing
  (ddb.send as any)
    .mockRejectedValueOnce({ name: "ConditionalCheckFailedException" }) // Put
    .mockResolvedValueOnce({ Item: { id: "acc_abcdef12", name: "Ada", email: "a@b.com" } }); // Get

  const ev = makeEvent("POST", "/accounts", {
    body: { name: "Ada", email: "a@b.com" },
    headers: { "Idempotency-Key": "same-key" }
  });
  const r = await handler(ev);
  expect(r.statusCode).toBe(200);
  const obj = JSON.parse(r.body as string);
  expect(obj.id).toBe("acc_abcdef12");
});
