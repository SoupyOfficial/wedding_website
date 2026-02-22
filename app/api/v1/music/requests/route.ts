import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

/**
 * GET /api/v1/music/requests
 * Returns all visible, approved song requests for the public playlist display.
 */
export async function GET() {
  try {
    const songs = await prisma.songRequest.findMany({
      where: { approved: true, isVisible: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        songTitle: true,
        artist: true,
        artworkUrl: true,
        guestName: true,
      },
    });
    return successResponse(songs);
  } catch (error) {
    console.error("Failed to fetch visible songs:", error);
    return errorResponse("Internal server error.", 500);
  }
}

/**
 * POST /api/v1/music/requests
 * Submit a new song request from a guest.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { guestName, songTitle, artist, artworkUrl, previewUrl } = body;

    if (!guestName?.trim() || !songTitle?.trim()) {
      return errorResponse("Name and song title are required.", 400);
    }

    // Basic duplicate check — same song+artist from same guest
    const existing = await prisma.songRequest.findFirst({
      where: {
        guestName: guestName.trim(),
        songTitle: songTitle.trim(),
        artist: (artist || "").trim(),
      },
    });

    if (existing) {
      return errorResponse("You've already requested this song!", 409);
    }

    const request = await prisma.songRequest.create({
      data: {
        guestName: guestName.trim(),
        songTitle: songTitle.trim(),
        artist: (artist || "").trim(),
        artworkUrl: artworkUrl || null,
        previewUrl: previewUrl || null,
      },
    });

    return successResponse(request, undefined, 201);
  } catch (error) {
    console.error("Failed to create song request:", error);
    return errorResponse("Internal server error.", 500);
  }
}
