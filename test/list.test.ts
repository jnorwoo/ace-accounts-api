/* Jest unit test: mocks DDB to avoid Docker dependency */
jest.mock("../src/aws/ddb", () => {
  const actual: Record<string, unknown> = jest.requireActual("../src/aws/ddb");
  return {
    ...actual,
    ddb: { send: jest.fn().mockResolvedValue({ Items: [{ id: "acc_1234", name: "Test", email: "t@e.com" }] }) },
    tableName: () => "Accounts"
  };
});

import { APIGatewayProxyEventV2 } from "aws-lambda";
import { handler } from "../src/handlers/list";
test("list returns 200 with items", async () => {
  const res = await handler({} as APIGatewayProxyEventV2);
  expect(res.statusCode).toBe(200);
  const body = JSON.parse(res.body as string) as { items: unknown[] };
  expect(Array.isArray(body.items)).toBe(true);
  expect(body.items.length).toBeGreaterThan(0);
});