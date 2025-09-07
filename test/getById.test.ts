// test/getById.test.ts
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
import { handler } from "../src/handlers/getById";
import { makeEvent } from "./_mocks";

beforeEach(() => { (ddb.send as any).mockReset(); });

test("400 with no id", async () => {
    const r = await handler(makeEvent("GET", "/accounts/{id}"));
    expect(r.statusCode).toBe(400);
});

test("404 when not found", async () => {
    (ddb.send as any).mockResolvedValueOnce({ Item: undefined });
    const r = await handler(makeEvent("GET", "/accounts/{id}", { pathParameters: { id: "nope" } }));
    expect(r.statusCode).toBe(404);
});

test("200 when found", async () => {
    (ddb.send as any).mockResolvedValueOnce({ Item: { id: "acc_1", name: "N", email: "e@e.com" } });
    const r = await handler(makeEvent("GET", "/accounts/{id}", { pathParameters: { id: "acc_1" } }));
    expect(r.statusCode).toBe(200);
    const obj = JSON.parse(r.body as string);
    expect(obj.id).toBe("acc_1");
});
