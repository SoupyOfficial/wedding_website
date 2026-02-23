import { NextRequest } from "next/server";
import { queryOne, execute, toBool } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { MealOption } from "@/lib/db-types";
import { MEAL_BOOLS } from "@/lib/db-types";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, isVegetarian, isVegan, isGlutenFree } = body;

    const sets: string[] = [];
    const args: (string | number | null)[] = [];

    if (name !== undefined) { sets.push("name = ?"); args.push(name.trim()); }
    if (description !== undefined) { sets.push("description = ?"); args.push(description); }
    if (isVegetarian !== undefined) { sets.push("isVegetarian = ?"); args.push(isVegetarian ? 1 : 0); }
    if (isVegan !== undefined) { sets.push("isVegan = ?"); args.push(isVegan ? 1 : 0); }
    if (isGlutenFree !== undefined) { sets.push("isGlutenFree = ?"); args.push(isGlutenFree ? 1 : 0); }

    if (sets.length === 0) return errorResponse("No fields to update.", 400);

    args.push(id);
    const { rowsAffected } = await execute(
      `UPDATE MealOption SET ${sets.join(", ")} WHERE id = ?`,
      args
    );
    if (rowsAffected === 0) return errorResponse("Meal option not found.", 404);

    const meal = await queryOne<MealOption>("SELECT * FROM MealOption WHERE id = ?", [id]);
    if (meal) toBool(meal, ...MEAL_BOOLS);
    return successResponse(meal);
  } catch (error) {
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
    const { rowsAffected } = await execute("DELETE FROM MealOption WHERE id = ?", [id]);
    if (rowsAffected === 0) return errorResponse("Meal option not found.", 404);
    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Failed to delete meal:", error);
    return errorResponse("Internal server error.", 500);
  }
}
