import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, isVegetarian, isVegan, isGlutenFree } = body;

    const meal = await prisma.mealOption.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description }),
        ...(isVegetarian !== undefined && { isVegetarian }),
        ...(isVegan !== undefined && { isVegan }),
        ...(isGlutenFree !== undefined && { isGlutenFree }),
      },
    });

    return successResponse(meal);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return errorResponse("Meal option not found.", 404);
    }
    console.error("Failed to update meal:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.mealOption.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return errorResponse("Meal option not found.", 404);
    }
    console.error("Failed to delete meal:", error);
    return errorResponse("Internal server error.", 500);
  }
}
