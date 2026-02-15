import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { name, description, isVegetarian, isVegan, isGlutenFree } = body;

    const meal = await prisma.mealOption.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description }),
        ...(isVegetarian !== undefined && { isVegetarian }),
        ...(isVegan !== undefined && { isVegan }),
        ...(isGlutenFree !== undefined && { isGlutenFree }),
      },
    });

    return NextResponse.json({ success: true, data: meal });
  } catch {
    return NextResponse.json({ error: "Meal option not found." }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.mealOption.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Meal option not found." }, { status: 404 });
  }
}
