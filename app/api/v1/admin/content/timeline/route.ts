import { NextRequest } from "next/server";
import { query, queryOne, execute, generateId, now } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { TimelineEvent } from "@/lib/db-types";

export async function GET() {
  try {
    const events = await query<TimelineEvent>(
      "SELECT * FROM TimelineEvent ORDER BY sortOrder ASC"
    );
    return successResponse(events);
  } catch (error) {
    console.error("Failed to fetch timeline events:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, time, icon, sortOrder } = body;

    if (!title?.trim()) return errorResponse("Title is required.", 400);

    const id = generateId();
    const timestamp = now();
    await execute(
      `INSERT INTO TimelineEvent (id, title, description, time, icon, sortOrder, eventType, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, 'wedding-day', ?, ?)`,
      [id, title.trim(), description || "", time || "", icon || null, sortOrder ?? 0, timestamp, timestamp]
    );

    const event = await queryOne<TimelineEvent>("SELECT * FROM TimelineEvent WHERE id = ?", [id]);
    return successResponse(event, undefined, 201);
  } catch (error) {
    console.error("Failed to create timeline event:", error);
    return errorResponse("Internal server error.", 500);
  }
}
