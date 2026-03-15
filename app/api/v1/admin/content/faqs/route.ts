import { NextRequest } from "next/server";
import { query, queryOne, execute, generateId, toBool } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";
import type { FAQ } from "@/lib/db-types";
import { FAQ_BOOLS } from "@/lib/db-types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const faqs = await query<FAQ>("SELECT * FROM FAQ ORDER BY sortOrder ASC");
    faqs.forEach((f) => {
      if (f.isVisible === undefined || f.isVisible === null) f.isVisible = true;
      toBool(f, ...FAQ_BOOLS);
    });
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
    try {
      const isVisible = body.isVisible !== undefined ? (body.isVisible ? 1 : 0) : 1;
      await execute(
        "INSERT INTO FAQ (id, question, answer, sortOrder, isVisible) VALUES (?, ?, ?, ?, ?)",
        [id, question.trim(), answer.trim(), sortOrder ?? 0, isVisible]
      );
    } catch {
      // Fallback if isVisible column doesn't exist yet
      await execute(
        "INSERT INTO FAQ (id, question, answer, sortOrder) VALUES (?, ?, ?, ?)",
        [id, question.trim(), answer.trim(), sortOrder ?? 0]
      );
    }

    const faq = await queryOne<FAQ>("SELECT * FROM FAQ WHERE id = ?", [id]);
    if (faq) {
      if (faq.isVisible === undefined || faq.isVisible === null) faq.isVisible = true;
      toBool(faq, ...FAQ_BOOLS);
    }
    return successResponse(faq, undefined, 201);
  } catch (error) {
    console.error("Failed to create FAQ:", error);
    return errorResponse("Internal server error.", 500);
  }
}
