import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api";

export async function GET() {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: { sortOrder: "asc" },
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

    const faq = await prisma.fAQ.create({
      data: {
        question: question.trim(),
        answer: answer.trim(),
        sortOrder: sortOrder ?? 0,
      },
    });

    return successResponse(faq, undefined, 201);
  } catch (error) {
    console.error("Failed to create FAQ:", error);
    return errorResponse("Internal server error.", 500);
  }
}
