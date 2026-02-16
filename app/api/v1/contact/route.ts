import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { rateLimit } from "@/lib/api/middleware";
import { successResponse, errorResponse } from "@/lib/api";

const limiter = rateLimit({ windowMs: 60_000, maxRequests: 5 });

export async function POST(req: NextRequest) {
  const limited = await limiter(req, {});
  if (limited) return limited;
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return errorResponse("All fields are required.", 400);
    }

    const msg = await prisma.contactMessage.create({
      data: {
        name: name.trim().slice(0, 100),
        email: email.trim().slice(0, 200),
        subject: subject.trim().slice(0, 200),
        message: message.trim().slice(0, 2000),
      },
    });

    return successResponse({ message: "Message sent successfully." }, undefined, 201);
  } catch (error) {
    console.error("Failed to create contact message:", error);
    return errorResponse("Internal server error.", 500);
  }
}
