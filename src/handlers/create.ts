/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/handlers/create.ts
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { ddb, tableName } from "../aws/ddb";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID, createHash } from "node:crypto";
import { validateAccountCreate } from "../lib/validate";
import { getRequestId, getUserId } from "../lib/auth";
import { log } from "../lib/log";

function makeIdFromIdemKey(key: string) {
  const h = createHash("sha256").update(key).digest("hex").slice(0, 12);
  return `acc_${h}`;
}

export const handler = async (evt: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
  const rid = getRequestId(evt);
  const uid = getUserId(evt);
  log(evt, "info", "POST /accounts start", { rid, uid });

  if (!evt.body) {
    return { statusCode: 400, body: JSON.stringify({ error: "BAD_REQUEST", detail: "empty body" }) };
  }
  const payload = typeof evt.body === "string" ? JSON.parse(evt.body) : evt.body;

  const v = validateAccountCreate(payload);
  if (!v.ok) {
    log(evt, "warn", "validation failed", { errors: v.errors });
    return { statusCode: 400, body: JSON.stringify({ error: "VALIDATION_ERROR", details: v.errors }) };
  }

  const headers = Object.fromEntries(Object.entries(evt.headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
  const idemKey = headers["idempotency-key"] || headers["x-idempotency-key"];
  const id = idemKey ? makeIdFromIdemKey(String(idemKey)) : ("acc_" + randomUUID().slice(0, 8));

  const item = { id, ...payload };

  try {
    await ddb.send(new PutCommand({
      TableName: tableName(),
      Item: item,
      // do not overwrite if an item with this id already exists
      ConditionExpression: "attribute_not_exists(id)"
    }));
    log(evt, "info", "account created", { id });
    return { statusCode: 201, headers: {'content-type':'application/json'}, body: JSON.stringify(item) };
  } catch (err: any) {
    // If this is a conditional failure and we used an idempotency key, return the existing item
    if (idemKey && (err?.name === "ConditionalCheckFailedException" || err?.$metadata?.httpStatusCode === 400)) {
      const out = await ddb.send(new GetCommand({ TableName: tableName(), Key: { id } }));
      if (out.Item) {
        log(evt, "info", "idempotent re-play", { id });
        return { statusCode: 200, headers: {'content-type':'application/json'}, body: JSON.stringify(out.Item) };
      }
    }
    log(evt, "error", "create failed", { id, err: String(err?.name || err) });
    return { statusCode: 500, body: JSON.stringify({ error: "INTERNAL_ERROR", id }) };
  }
};
