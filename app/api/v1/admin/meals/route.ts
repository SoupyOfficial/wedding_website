import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

export async function GET() {
  try {
    const meals = await prisma.mealOption.findMany({
      orderBy: { name: "asc" },
    });
    return successResponse(meals);
  } catch (error) {
    console.error("Failed to fetch meals:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, isVegetarian, isVegan, isGlutenFree } = body;

    if (!name?.trim()) {
      return errorResponse("Name is required.", 400);
    }

    const meal = await prisma.mealOption.create({
      data: {
        name: name.trim(),
        description: description || null,
        isVegetarian: isVegetarian ?? false,
        isVegan: isVegan ?? false,
        isGlutenFree: isGlutenFree ?? false,
      },
    });

    return successResponse(meal, undefined, 201);
  } catch (error) {
    console.error("Failed to create meal:", error);
    return errorResponse("Internal server error.", 500);
  }
}
