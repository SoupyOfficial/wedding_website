import { NextRequest } from "next/server";
import { query, queryOne, execute, generateId, toBoolAll, toBool } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { MealOption } from "@/lib/db-types";
import { MEAL_BOOLS } from "@/lib/db-types";

export async function GET() {
  try {
    const meals = await query<MealOption>("SELECT * FROM MealOption ORDER BY name ASC");
    toBoolAll(meals, ...MEAL_BOOLS);
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

    if (!name?.trim()) return errorResponse("Name is required.", 400);

    const id = generateId();
    await execute(
      "INSERT INTO MealOption (id, name, description, isVegetarian, isVegan, isGlutenFree, isAvailable, sortOrder) VALUES (?, ?, ?, ?, ?, ?, 1, 0)",
      [id, name.trim(), description || "", isVegetarian ? 1 : 0, isVegan ? 1 : 0, isGlutenFree ? 1 : 0]
    );

    const meal = await queryOne<MealOption>("SELECT * FROM MealOption WHERE id = ?", [id]);
    if (meal) toBool(meal, ...MEAL_BOOLS);
    return successResponse(meal, undefined, 201);
  } catch (error) {
    console.error("Failed to create meal:", error);
    return errorResponse("Internal server error.", 500);
  }
}
