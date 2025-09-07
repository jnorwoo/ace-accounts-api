// src/lib/auth.ts
import type { APIGatewayProxyEventV2 } from "aws-lambda";

export function getRequestId(evt: APIGatewayProxyEventV2): string {
  // HTTP API v2 request id lives here
  return evt.requestContext?.requestId ?? "unknown";
}

// Very light user detection: prefer x-user-id header, else sub from a Bearer JWT (decoded, not verified)
export function getUserId(evt: APIGatewayProxyEventV2): string | undefined {
  const headers = lowerKeys(evt.headers || {});
  const fromHeader = headers["x-user-id"] as string | undefined;
  if (fromHeader) return fromHeader;

  const auth = headers["authorization"];
  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice(7);
    const parts = token.split(".");
    if (parts.length >= 2) {
      try {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8")) as { sub?: string; user_id?: string };
        return payload?.sub ?? payload?.user_id;
      } catch { /* ignore */ }
    }
  }
  return undefined;
}

function lowerKeys<T extends Record<string, unknown>>(obj: T): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of Object.keys(obj || {})) out[k.toLowerCase()] = obj[k] as string;
  return out;
}
