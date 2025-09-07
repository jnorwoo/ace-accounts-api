/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/lib/validate.ts
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import Ajv, { DefinedError } from "ajv";
import addFormats from "ajv-formats";

const openapiPath = path.resolve(__dirname, "../../api/openapi.yaml");
const doc = yaml.load(fs.readFileSync(openapiPath, "utf8")) as any;

const ajv = new Ajv({ allErrors: true, strict: false }); // OpenAPI 3.0 schemas sometimes need strict: false
addFormats(ajv);

const schemas = doc?.components?.schemas ?? {};
// add component schemas so $refs can resolve across them if needed
Object.entries(schemas).forEach(([name, schema]) => ajv.addSchema(schema as any, `#/components/schemas/${name}`));

const accountCreateSchema = schemas["AccountCreate"];
const validateAccountCreateFn = ajv.compile(accountCreateSchema);

export type ValidationResult = { ok: true } | { ok: false; errors: string[] };

export function validateAccountCreate(payload: unknown): ValidationResult {
  const ok = validateAccountCreateFn(payload);
  if (ok) return { ok: true };
  const msgs = (validateAccountCreateFn.errors as DefinedError[] | null | undefined)?.map(e => {
    const instancePath = e.instancePath || "";
    return `${instancePath} ${e.message}`;
  }) ?? ["invalid"];
  return { ok: false, errors: msgs };
}
