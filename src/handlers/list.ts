// src/handlers/list.ts
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { ddb, tableName } from "../aws/ddb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { log } from "../lib/log";

export const handler = async (evt: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
  log(evt, "info", "GET /accounts start", {});
  const res = await ddb.send(new ScanCommand({
    TableName: tableName(),
    Limit: 50
  }));
  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ items: res.Items ?? [], nextPageToken: null })
  };
};
