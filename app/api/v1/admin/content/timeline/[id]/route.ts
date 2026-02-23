import { NextRequest } from "next/server";
import { queryOne, execute, now } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { TimelineEvent } from "@/lib/db-types";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, description, time, icon, sortOrder, eventType } = body;

    const sets: string[] = [];
    const args: (string | number | null)[] = [];

    if (title !== undefined) { sets.push("title = ?"); args.push(title.trim()); }
    if (description !== undefined) { sets.push("description = ?"); args.push(description || ""); }
    if (time !== undefined) { sets.push("time = ?"); args.push(time || ""); }
    if (icon !== undefined) { sets.push("icon = ?"); args.push(icon || null); }
    if (sortOrder !== undefined) { sets.push("sortOrder = ?"); args.push(sortOrder); }
    if (eventType !== undefined) { sets.push("eventType = ?"); args.push(eventType); }

    sets.push("updatedAt = ?");
    args.push(now());
    args.push(id);

    const { rowsAffected } = await execute(
      `UPDATE TimelineEvent SET ${sets.join(", ")} WHERE id = ?`,
      args
    );
    if (rowsAffected === 0) return errorResponse("Event not found.", 404);

    const event = await queryOne<TimelineEvent>("SELECT * FROM TimelineEvent WHERE id = ?", [id]);
    return successResponse(event);
  } catch (error) {
    console.error("Failed to update timeline event:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { rowsAffected } = await execute("DELETE FROM TimelineEvent WHERE id = ?", [id]);
    if (rowsAffected === 0) return errorResponse("Event not found.", 404);
    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Failed to delete timeline event:", error);
    return errorResponse("Internal server error.", 500);
  }
}
