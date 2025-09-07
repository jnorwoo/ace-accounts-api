/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function makeEvent(method: string, path: string, opts: any = {}) {
  return {
    version: "2.0",
    routeKey: `${method} ${path}`,
    rawPath: path,
    headers: { "x-user-id": "u_123", ...(opts.headers || {}) },
    requestContext: { requestId: opts.requestId || "req-abc" },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    pathParameters: opts.pathParameters || undefined,
  } as any;
}