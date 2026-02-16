import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

export async function GET() {
  try {
    const events = await prisma.timelineEvent.findMany({
      orderBy: { sortOrder: "asc" },
    });
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

    if (!title?.trim()) {
      return errorResponse("Title is required.", 400);
    }

    const event = await prisma.timelineEvent.create({
      data: {
        title: title.trim(),
        description: description || null,
        time: time || null,
        icon: icon || null,
        sortOrder: sortOrder ?? 0,
      },
    });

    return successResponse(event, undefined, 201);
  } catch (error) {
    console.error("Failed to create timeline event:", error);
    return errorResponse("Internal server error.", 500);
  }
}
