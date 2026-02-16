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
    const { question, answer, sortOrder } = body;

    const faq = await prisma.fAQ.update({
      where: { id },
      data: {
        ...(question !== undefined && { question: question.trim() }),
        ...(answer !== undefined && { answer: answer.trim() }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return successResponse(faq);
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return errorResponse("FAQ not found.", 404);
    }
    console.error("Failed to update FAQ:", error);
    return errorResponse("Internal server error.", 500);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.fAQ.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return errorResponse("FAQ not found.", 404);
    }
    console.error("Failed to delete FAQ:", error);
    return errorResponse("Internal server error.", 500);
  }
}
