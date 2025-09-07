// src/handlers/getById.ts
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { ddb, tableName } from "../aws/ddb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { log } from "../lib/log";

export const handler = async (evt: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
  const id = evt.pathParameters?.id;
  if (!id) return { statusCode: 400, body: JSON.stringify({ error: "BAD_REQUEST" }) };

  log(evt, "info", "GET /accounts/{id} start", { id });
  const out = await ddb.send(new GetCommand({ TableName: tableName(), Key: { id } }));
  if (!out.Item) return { statusCode: 404, body: JSON.stringify({ error: "NOT_FOUND", id }) };

  return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify(out.Item) };
};
