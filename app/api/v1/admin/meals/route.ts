import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const meals = await prisma.mealOption.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ success: true, data: meals });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, isVegetarian, isVegan, isGlutenFree } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
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

    return NextResponse.json({ success: true, data: meal }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
