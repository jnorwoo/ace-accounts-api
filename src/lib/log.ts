    // src/lib/log.ts
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { getRequestId, getUserId } from "./auth";

export function log(evt: APIGatewayProxyEventV2, level: "info"|"warn"|"error", msg: string, extra: Record<string, unknown> = {}) {
  const entry = {
    level,
    msg,
    requestId: getRequestId(evt),
    userId: getUserId(evt),
    ...extra,
  };
  // structured JSON log
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(entry));
}
