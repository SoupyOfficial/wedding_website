import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

export async function GET() {
  try {
    const guests = await prisma.guest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return successResponse(guests);
  } catch (error) {
    console.error("Failed to fetch guests:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, group, plusOneAllowed } = body;

    if (!firstName?.trim() || !lastName?.trim()) {
      return errorResponse("Name is required.", 400);
    }

    const guest = await prisma.guest.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email || null,
        group: group || null,
        plusOneAllowed: plusOneAllowed || false,
      },
    });

    return successResponse(guest, undefined, 201);
  } catch (error) {
    console.error("Failed to create guest:", error);
    return errorResponse("Internal server error.", 500);
  }
}
