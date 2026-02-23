import { NextRequest } from "next/server";
import { query, execute, generateId, now, toBoolAll } from "@/lib/db";
import { rateLimit } from "@/lib/api/middleware";
import { successResponse, errorResponse } from "@/lib/api";
import type { GuestBookEntry } from "@/lib/db-types";

const postLimiter = rateLimit({ windowMs: 60_000, maxRequests: 3 });

export async function GET() {
  try {
    const entries = await query<GuestBookEntry>(
      "SELECT * FROM GuestBookEntry WHERE isVisible = 1 ORDER BY createdAt DESC"
    );
    toBoolAll(entries, "isVisible");

    return successResponse(entries);
  } catch (error) {
    console.error("Failed to fetch guest book entries:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function POST(req: NextRequest) {
  const limited = await postLimiter(req, {});
  if (limited) return limited;
  try {
    const body = await req.json();
    const { name, message } = body;

    if (!name?.trim() || !message?.trim()) {
      return errorResponse("Name and message are required.", 400);
    }

    const id = generateId();
    const timestamp = now();
    await execute(
      "INSERT INTO GuestBookEntry (id, name, message, isVisible, createdAt) VALUES (?, ?, ?, 0, ?)",
      [id, name.trim().slice(0, 100), message.trim().slice(0, 500), timestamp]
    );

    return successResponse({ message: "Thank you for your message!" }, undefined, 201);
  } catch (error) {
    console.error("Failed to create guest book entry:", error);
    return errorResponse("Internal server error.", 500);
  }
}
