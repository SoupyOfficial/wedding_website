import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

export async function GET() {
  try {
    const registries = await prisma.registryItem.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return successResponse(registries);
  } catch (error) {
    console.error("Failed to fetch registry:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, url, iconUrl, sortOrder } = body;

    if (!name?.trim()) {
      return errorResponse("Name is required.", 400);
    }

    const registry = await prisma.registryItem.create({
      data: {
        name: name.trim(),
        url: url?.trim() || "",
        iconUrl: iconUrl || null,
        sortOrder: sortOrder ?? 0,
      },
    });

    return successResponse(registry, undefined, 201);
  } catch (error) {
    console.error("Failed to create registry item:", error);
    return errorResponse("Internal server error.", 500);
  }
}
