import { NextRequest } from "next/server";
import { query, queryOne, execute, generateId, now, toBool, toBoolAll } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

// ─── Value transforms ───────────────────────────────────────────────

type SqlValue = string | number | null;
type ValueTransform = (value: unknown) => SqlValue;

/** Common field transforms for mapping request body values to SQL values. */
export const T = {
  /** Trim whitespace. */
  trim: ((v: unknown) => String(v ?? "").trim()) as ValueTransform,
  /** Default to empty string if falsy. */
  str: ((v: unknown) => (v || "")) as ValueTransform,
  /** Default to null if falsy. */
  nullable: ((v: unknown) => (v || null)) as ValueTransform,
  /** Default to null if nullish (keeps 0, "", false). */
  nullish: ((v: unknown) => (v ?? null)) as ValueTransform,
  /** Convert boolean to SQLite integer (0/1). */
  boolInt: ((v: unknown) => (v ? 1 : 0)) as ValueTransform,
  /** Convert to ISO 8601 date string, or null. */
  date: ((v: unknown) => (v ? new Date(v as string).toISOString() : null)) as ValueTransform,
  /** Pass value through unchanged. */
  pass: ((v: unknown) => v as SqlValue) as ValueTransform,
  /** Default to a specific number if nullish. */
  numDefault: (def: number): ValueTransform => ((v: unknown) => (v ?? def) as SqlValue),
  /** Default to a specific string if falsy. */
  strDefault: (def: string): ValueTransform => ((v: unknown) => (v || def) as SqlValue),
};

// ─── Config types ───────────────────────────────────────────────────

interface FieldConfig {
  /** SQL column name if different from the field key (e.g., '"group"' for reserved words). */
  column?: string;
  /** Transform for PUT (and POST fallback). Defaults to T.pass. */
  toSql?: ValueTransform;
  /** Override transform for POST only. Falls back to toSql. */
  toSqlCreate?: ValueTransform;
}

export interface CrudConfig {
  /** SQL table name. */
  table: string;
  /** Human-readable label for error messages (e.g., "Hotel", "Guest"). */
  label: string;
  /** ORDER BY clause for GET list (e.g., "sortOrder ASC"). */
  orderBy: string;
  /** Boolean field names that need toBool() conversion after query. */
  boolFields?: readonly string[];
  /** Field definitions: key = body field name, value = column + transform config. */
  fields: Record<string, FieldConfig>;
  /** Subset of field keys to use in POST. If omitted, all fields are used. */
  postFields?: string[];
  /** Hardcoded column values added only in POST INSERT (not from body). */
  postDefaults?: Record<string, SqlValue>;
  /** Required field validation for POST. */
  required?: { fields: string[]; message: string };
  /** Custom PUT body validation. Return error message string, or null if valid. */
  validatePut?: (body: Record<string, unknown>) => string | null;
  /** Auto-add createdAt/updatedAt timestamps (POST creates both, PUT updates updatedAt). */
  timestamps?: boolean;
}

// ─── Handler factories ──────────────────────────────────────────────

function colName(key: string, field: FieldConfig): string {
  return field.column || key;
}

function postTransform(value: unknown, field: FieldConfig): SqlValue {
  return (field.toSqlCreate || field.toSql || T.pass)(value);
}

function putTransform(value: unknown, field: FieldConfig): SqlValue {
  return (field.toSql || T.pass)(value);
}

/**
 * Create GET (list) and POST (create) handlers for a list route.
 */
export function createListHandlers(config: CrudConfig) {
  async function GET() {
    try {
      const rows = await query<Record<string, unknown>>(
        `SELECT * FROM ${config.table} ORDER BY ${config.orderBy}`
      );
      if (config.boolFields?.length) {
        toBoolAll(rows, ...(config.boolFields as string[]));
      }
      return successResponse(rows);
    } catch (error) {
      console.error(`Failed to fetch ${config.label.toLowerCase()}s:`, error);
      return errorResponse("Internal server error.", 500);
    }
  }

  async function POST(req: NextRequest) {
    try {
      const body = await req.json();

      // Validate required fields
      if (config.required) {
        const missing = config.required.fields.some(
          (f) => !body[f] || (typeof body[f] === "string" && !body[f].trim())
        );
        if (missing) return errorResponse(config.required.message, 400);
      }

      const id = generateId();
      const fieldKeys = config.postFields || Object.keys(config.fields);

      // Build column list and values from body fields
      const columns: string[] = ["id"];
      const values: SqlValue[] = [id];

      for (const key of fieldKeys) {
        const fieldDef = config.fields[key];
        if (!fieldDef) continue;
        columns.push(colName(key, fieldDef));
        values.push(postTransform(body[key], fieldDef));
      }

      // Add hardcoded POST defaults
      if (config.postDefaults) {
        for (const [col, val] of Object.entries(config.postDefaults)) {
          columns.push(col);
          values.push(val);
        }
      }

      // Add timestamps
      if (config.timestamps) {
        const timestamp = now();
        columns.push("createdAt", "updatedAt");
        values.push(timestamp, timestamp);
      }

      const placeholders = values.map(() => "?").join(", ");
      await execute(
        `INSERT INTO ${config.table} (${columns.join(", ")}) VALUES (${placeholders})`,
        values
      );

      const row = await queryOne<Record<string, unknown>>(
        `SELECT * FROM ${config.table} WHERE id = ?`,
        [id]
      );
      if (row && config.boolFields?.length) {
        toBool(row, ...(config.boolFields as string[]));
      }

      return successResponse(row, undefined, 201);
    } catch (error) {
      console.error(`Failed to create ${config.label.toLowerCase()}:`, error);
      return errorResponse("Internal server error.", 500);
    }
  }

  return { GET, POST };
}

/**
 * Create PUT (update) and DELETE handlers for a detail [id] route.
 */
export function createDetailHandlers(config: CrudConfig) {
  async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await params;
      const body = await req.json();

      // Custom validation
      if (config.validatePut) {
        const error = config.validatePut(body);
        if (error) return errorResponse(error, 400);
      }

      const sets: string[] = [];
      const args: SqlValue[] = [];

      // Build dynamic SET clause from fields present in body
      for (const [key, fieldDef] of Object.entries(config.fields)) {
        if (body[key] !== undefined) {
          sets.push(`${colName(key, fieldDef)} = ?`);
          args.push(putTransform(body[key], fieldDef));
        }
      }

      // Auto-update timestamp
      if (config.timestamps) {
        sets.push("updatedAt = ?");
        args.push(now());
      }

      if (sets.length === 0) return errorResponse("No fields to update.", 400);

      args.push(id);
      const { rowsAffected } = await execute(
        `UPDATE ${config.table} SET ${sets.join(", ")} WHERE id = ?`,
        args
      );
      if (rowsAffected === 0) {
        return errorResponse(`${config.label} not found.`, 404);
      }

      const row = await queryOne<Record<string, unknown>>(
        `SELECT * FROM ${config.table} WHERE id = ?`,
        [id]
      );
      if (row && config.boolFields?.length) {
        toBool(row, ...(config.boolFields as string[]));
      }

      return successResponse(row);
    } catch (error) {
      console.error(`Failed to update ${config.label.toLowerCase()}:`, error);
      return errorResponse("Internal server error.", 500);
    }
  }

  async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      const { id } = await params;
      const { rowsAffected } = await execute(
        `DELETE FROM ${config.table} WHERE id = ?`,
        [id]
      );
      if (rowsAffected === 0) {
        return errorResponse(`${config.label} not found.`, 404);
      }
      return successResponse({ deleted: true });
    } catch (error) {
      console.error(`Failed to delete ${config.label.toLowerCase()}:`, error);
      return errorResponse("Internal server error.", 500);
    }
  }

  return { PUT, DELETE };
}
