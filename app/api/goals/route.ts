// app/api/goals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const year = searchParams.get("year");
  const quarter = searchParams.get("quarter");
  const month = searchParams.get("month");

  try {
    const where: any = {};
    if (type) where.type = type;
    if (year) where.year = parseInt(year);
    if (quarter) where.quarter = parseInt(quarter);
    if (month) where.month = parseInt(month);

    const goals = await prisma.goal.findMany({
      where,
      include: { subtasks: { orderBy: { createdAt: "asc" } } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(goals);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const goal = await prisma.goal.create({
      data: {
        title: body.title,
        description: body.description,
        type: body.type,
        year: body.year || new Date().getFullYear(),
        quarter: body.quarter,
        month: body.month,
        category: body.category,
        targetDate: body.targetDate ? new Date(body.targetDate) : null,
      },
      include: { subtasks: true },
    });
    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}
