import { NextRequest } from "next/server";
import { queryOne, execute } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { FAQ } from "@/lib/db-types";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { question, answer, sortOrder } = body;

    const sets: string[] = [];
    const args: (string | number | null)[] = [];

    if (question !== undefined) { sets.push("question = ?"); args.push(question.trim()); }
    if (answer !== undefined) { sets.push("answer = ?"); args.push(answer.trim()); }
    if (sortOrder !== undefined) { sets.push("sortOrder = ?"); args.push(sortOrder); }

    if (sets.length === 0) return errorResponse("No fields to update.", 400);

    args.push(id);
    const { rowsAffected } = await execute(
      `UPDATE FAQ SET ${sets.join(", ")} WHERE id = ?`,
      args
    );
    if (rowsAffected === 0) return errorResponse("FAQ not found.", 404);

    const faq = await queryOne<FAQ>("SELECT * FROM FAQ WHERE id = ?", [id]);
    return successResponse(faq);
  } catch (error) {
    console.error("Failed to update FAQ:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { rowsAffected } = await execute("DELETE FROM FAQ WHERE id = ?", [id]);
    if (rowsAffected === 0) return errorResponse("FAQ not found.", 404);
    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Failed to delete FAQ:", error);
    return errorResponse("Internal server error.", 500);
  }
}
