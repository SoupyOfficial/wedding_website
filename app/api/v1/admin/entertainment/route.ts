import { NextRequest } from "next/server";
import { query, queryOne, execute, generateId } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { Entertainment } from "@/lib/db-types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await query<Entertainment>(
      "SELECT * FROM Entertainment ORDER BY sortOrder ASC"
    );
    return successResponse(items);
  } catch (error) {
    console.error("Failed to fetch entertainment:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, icon, sortOrder } = body;

    if (!name?.trim()) return errorResponse("Entertainment name is required.", 400);

    const id = generateId();
    await execute(
      "INSERT INTO Entertainment (id, name, description, icon, sortOrder) VALUES (?, ?, ?, ?, ?)",
      [id, name.trim(), description || "", icon || null, sortOrder ?? 0]
    );

    const item = await queryOne<Entertainment>("SELECT * FROM Entertainment WHERE id = ?", [id]);
    return successResponse(item, undefined, 201);
  } catch (error) {
    console.error("Failed to create entertainment:", error);
    return errorResponse("Internal server error.", 500);
  }
}
