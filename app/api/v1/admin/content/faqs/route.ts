import { NextRequest } from "next/server";
import { query, queryOne, execute, generateId } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { FAQ } from "@/lib/db-types";

export async function GET() {
  try {
    const faqs = await query<FAQ>("SELECT * FROM FAQ ORDER BY sortOrder ASC");
    return successResponse(faqs);
  } catch (error) {
    console.error("Failed to fetch FAQs:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, answer, sortOrder } = body;

    if (!question?.trim() || !answer?.trim()) {
      return errorResponse("Question and answer are required.", 400);
    }

    const id = generateId();
    await execute(
      "INSERT INTO FAQ (id, question, answer, sortOrder) VALUES (?, ?, ?, ?)",
      [id, question.trim(), answer.trim(), sortOrder ?? 0]
    );

    const faq = await queryOne<FAQ>("SELECT * FROM FAQ WHERE id = ?", [id]);
    return successResponse(faq, undefined, 201);
  } catch (error) {
    console.error("Failed to create FAQ:", error);
    return errorResponse("Internal server error.", 500);
  }
}
