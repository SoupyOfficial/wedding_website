import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { rateLimit } from "@/lib/api/middleware";
import { successResponse, errorResponse } from "@/lib/api";

const postLimiter = rateLimit({ windowMs: 60_000, maxRequests: 3 });

export async function GET() {
  try {
    const entries = await prisma.guestBookEntry.findMany({
      where: { isVisible: true },
      orderBy: { createdAt: "desc" },
    });

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

    const entry = await prisma.guestBookEntry.create({
      data: {
        name: name.trim().slice(0, 100),
        message: message.trim().slice(0, 500),
        isVisible: false,
      },
    });

    return successResponse({ message: "Thank you for your message!" }, undefined, 201);
  } catch (error) {
    console.error("Failed to create guest book entry:", error);
    return errorResponse("Internal server error.", 500);
  }
}
