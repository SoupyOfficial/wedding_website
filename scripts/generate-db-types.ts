/**
 * generate-db-types.ts
 *
 * Reads prisma/schema.prisma and generates lib/db-types.ts.
 * Run: npx tsx scripts/generate-db-types.ts
 */
import * as fs from "fs";
import * as path from "path";

const SCHEMA_PATH = path.resolve(__dirname, "../prisma/schema.prisma");
const OUTPUT_PATH = path.resolve(__dirname, "../lib/db-types.ts");

// ─── Type mappings ──────────────────────────────────────────────────

const PRISMA_TO_TS: Record<string, string> = {
  String: "string",
  Int: "number",
  Float: "number",
  Boolean: "boolean",
  DateTime: "string",
  BigInt: "bigint",
  Decimal: "number",
  Json: "unknown",
  Bytes: "Buffer",
};

// ─── Manual overrides for fields that deviate from auto-generation ──

interface FieldOverride {
  tsType: string;
}

const FIELD_OVERRIDES: Record<string, Record<string, FieldOverride>> = {
  // FeatureFlag.enabled can be raw SQLite integer or converted boolean
  FeatureFlag: {
    enabled: { tsType: "number | boolean" },
  },
};

// Models to skip entirely (e.g., removed email models still in schema)
const SKIP_MODELS = new Set(["EmailTemplate", "EmailCampaign", "EmailLog"]);

// Fields to skip (relation fields will be auto-detected, but list explicit ones here)
const SKIP_FIELDS: Record<string, Set<string>> = {};

// Custom BOOLS constant names (model → constant name)
const BOOLS_NAMES: Record<string, string> = {
  SiteSettings: "SETTINGS_BOOLS",
  Guest: "GUEST_BOOLS",
  FAQ: "FAQ_BOOLS",
  Photo: "PHOTO_BOOLS",
  GuestBookEntry: "GUESTBOOK_BOOLS",
  MealOption: "MEAL_BOOLS",
  SongRequest: "SONG_BOOLS",
  ContactMessage: "MESSAGE_BOOLS",
};

// ─── Parser ─────────────────────────────────────────────────────────

interface PrismaField {
  name: string;
  type: string;
  isOptional: boolean;
  isList: boolean;
  isRelation: boolean;
}

interface PrismaModel {
  name: string;
  fields: PrismaField[];
}

function parseSchema(schema: string): PrismaModel[] {
  const models: PrismaModel[] = [];
  const lines = schema.split("\n");

  let currentModel: PrismaModel | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Start of model
    const modelMatch = trimmed.match(/^model\s+(\w+)\s*\{/);
    if (modelMatch) {
      currentModel = { name: modelMatch[1], fields: [] };
      continue;
    }

    // End of model
    if (currentModel && trimmed === "}") {
      models.push(currentModel);
      currentModel = null;
      continue;
    }

    // Inside a model — parse field
    if (currentModel && trimmed && !trimmed.startsWith("//") && !trimmed.startsWith("@@")) {
      const fieldMatch = trimmed.match(/^(\w+)\s+(\w+)(\[\])?\??/);
      if (fieldMatch) {
        const [, name, type, listMarker] = fieldMatch;
        const isList = !!listMarker;
        const isOptional = trimmed.includes("?");
        const isRelation = !PRISMA_TO_TS[type];

        currentModel.fields.push({ name, type, isOptional, isList, isRelation });
      }
    }
  }

  return models;
}

// ─── Generator ──────────────────────────────────────────────────────

function generateInterface(model: PrismaModel): string {
  const lines: string[] = [];
  const boolFields: string[] = [];

  lines.push(`export interface ${model.name} {`);

  for (const field of model.fields) {
    // Skip relations
    if (field.isRelation) continue;
    // Skip explicitly excluded fields
    if (SKIP_FIELDS[model.name]?.has(field.name)) continue;

    // Check for override
    const override = FIELD_OVERRIDES[model.name]?.[field.name];
    let tsType: string;

    if (override) {
      tsType = override.tsType;
    } else {
      tsType = PRISMA_TO_TS[field.type] || "unknown";
    }

    // Track boolean fields for BOOLS constant
    if (field.type === "Boolean" && !override) {
      boolFields.push(field.name);
    }

    // Add null union for optional fields (unless override already handles it)
    if (field.isOptional && !override?.tsType.includes("null")) {
      tsType = `${tsType} | null`;
    }

    lines.push(`  ${field.name}: ${tsType};`);
  }

  lines.push("}");

  // Generate BOOLS constant if this model has boolean fields
  if (boolFields.length > 0 && BOOLS_NAMES[model.name]) {
    const constName = BOOLS_NAMES[model.name];
    lines.push("");
    lines.push(`export const ${constName} = [`);
    for (const f of boolFields) {
      lines.push(`  "${f}",`);
    }
    lines.push("] as const;");
  }

  return lines.join("\n");
}

// ─── Main ───────────────────────────────────────────────────────────

function main() {
  const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
  const models = parseSchema(schema).filter((m) => !SKIP_MODELS.has(m.name));

  const sections: string[] = [];

  // Header
  sections.push(`// ─────────────────────────────────────────────────────────────────────
// AUTO-GENERATED from prisma/schema.prisma — do not edit by hand.
// Run: npx tsx scripts/generate-db-types.ts
// Date fields are ISO 8601 strings (as stored by Prisma in SQLite).
// Boolean fields are converted to JS booleans via toBool().
// ─────────────────────────────────────────────────────────────────────`);

  // Generate each model
  for (const model of models) {
    sections.push(generateInterface(model));
  }

  // Manual additions (derived types that can't be auto-generated)
  sections.push(`// ─── Manual additions (derived types) ────────────────────────────────

/** Photo with its related tags (joined manually via _PhotoToPhotoTag). */
export interface PhotoWithTags extends Photo {
  tags: PhotoTag[];
}

/** PhotoTag with the count of associated photos. */
export interface PhotoTagWithCount extends PhotoTag {
  _count: { photos: number };
}`);

  const output = sections.join("\n\n") + "\n";
  fs.writeFileSync(OUTPUT_PATH, output, "utf-8");

  console.log(`Generated ${OUTPUT_PATH}`);
  console.log(`  Models: ${models.length}`);
  console.log(`  BOOLS constants: ${models.filter((m) => BOOLS_NAMES[m.name]).length}`);
}

main();
