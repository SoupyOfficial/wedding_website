import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

export async function GET() {
  try {
    const items = await prisma.dJList.findMany();
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

    if (!songName?.trim()) {
      return errorResponse("Song name is required.", 400);
    }

    const item = await prisma.dJList.create({
      data: {
        songName: songName.trim(),
        artist: artist || "",
        listType: listType || "must-play",
        playTime: playTime || "",
      },
    });

    return successResponse(item, undefined, 201);
  } catch (error) {
    console.error("Failed to create DJ list item:", error);
    return errorResponse("Internal server error.", 500);
  }
}
