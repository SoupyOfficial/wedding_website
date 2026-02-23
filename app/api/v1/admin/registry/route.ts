import { NextRequest } from "next/server";
import { query, queryOne, execute, generateId } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { RegistryItem } from "@/lib/db-types";

export async function GET() {
  try {
    const registries = await query<RegistryItem>(
      "SELECT * FROM RegistryItem ORDER BY sortOrder ASC"
    );
    return successResponse(registries);
  } catch (error) {
    console.error("Failed to fetch registry:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, url, iconUrl, sortOrder } = body;

    if (!name?.trim()) return errorResponse("Name is required.", 400);

    const id = generateId();
    await execute(
      "INSERT INTO RegistryItem (id, name, url, iconUrl, sortOrder) VALUES (?, ?, ?, ?, ?)",
      [id, name.trim(), url?.trim() || "", iconUrl || null, sortOrder ?? 0]
    );

    const registry = await queryOne<RegistryItem>("SELECT * FROM RegistryItem WHERE id = ?", [id]);
    return successResponse(registry, undefined, 201);
  } catch (error) {
    console.error("Failed to create registry item:", error);
    return errorResponse("Internal server error.", 500);
  }
}
