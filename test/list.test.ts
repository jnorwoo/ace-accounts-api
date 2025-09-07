/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// test/create.test.ts
import { beforeEach, expect, jest, test } from '@jest/globals';
// test/list.test.ts
jest.mock("../src/aws/ddb", () => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const real = jest.requireActual("../src/aws/ddb") as Record<string, unknown>;
  return {
    ...real,
    ddb: { send: jest.fn<any>().mockResolvedValue({ Items: [{ id: "acc_x", name: "N", email:"e@e.com"}] }) },
    tableName: () => "Accounts"
  };
});
import { handler } from "../src/handlers/list";
import { makeEvent } from "./_mocks";

test("list returns items", async () => {
  const r = await handler(makeEvent("GET", "/accounts"));
  expect(r.statusCode).toBe(200);
  const body = JSON.parse(r.body as string);
  expect(Array.isArray(body.items)).toBe(true);
  expect(body.items.length).toBe(1);
});