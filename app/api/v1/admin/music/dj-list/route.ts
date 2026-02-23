import { NextRequest } from "next/server";
import { query, queryOne, execute, generateId } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { DJList } from "@/lib/db-types";

export async function GET() {
  try {
    const items = await query<DJList>("SELECT * FROM DJList");
    return successResponse(items);
  } catch (error) {
    console.error("Failed to fetch DJ list:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { songName, artist, listType, playTime } = body;

    if (!songName?.trim()) return errorResponse("Song name is required.", 400);

    const id = generateId();
    await execute(
      "INSERT INTO DJList (id, songName, artist, listType, playTime) VALUES (?, ?, ?, ?, ?)",
      [id, songName.trim(), artist || "", listType || "must-play", playTime || ""]
    );

    const item = await queryOne<DJList>("SELECT * FROM DJList WHERE id = ?", [id]);
    return successResponse(item, undefined, 201);
  } catch (error) {
    console.error("Failed to create DJ list item:", error);
    return errorResponse("Internal server error.", 500);
  }
}
