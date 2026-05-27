// app/api/habits/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  try {
    let completionWhere = {};
    if (month && year) {
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      completionWhere = {
        completedAt: {
          gte: startOfMonth(date),
          lte: endOfMonth(date),
        },
      };
    } else {
      // Default: last 35 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 35);
      completionWhere = { completedAt: { gte: thirtyDaysAgo } };
    }

    const habits = await prisma.habit.findMany({
      where: { isActive: true },
      include: {
        completions: {
          where: completionWhere,
          orderBy: { completedAt: "desc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(habits);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch habits" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const habit = await prisma.habit.create({
      data: {
        name: body.name,
        description: body.description,
        emoji: body.emoji || "✅",
        color: body.color || "#6B9080",
        frequency: body.frequency || "DAILY",
        targetDays: body.targetDays || 7,
      },
    });
    return NextResponse.json(habit, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create habit" }, { status: 500 });
  }
}
