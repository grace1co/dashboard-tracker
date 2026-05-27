// app/api/habits/gym-count/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const week = searchParams.get("week");

  try {
    // Find the gym/workout habit
    const gymHabit = await prisma.habit.findFirst({
      where: {
        OR: [
          { name: { contains: "gym", mode: "insensitive" } },
          { name: { contains: "workout", mode: "insensitive" } },
          { name: { contains: "exercise", mode: "insensitive" } },
          { emoji: "🏋️" },
          { emoji: "💪" },
        ],
      },
    });

    if (!gymHabit) {
      return NextResponse.json({ count: 0 });
    }

    let dateFilter: any = {};

    if (week) {
      const now = new Date();
      dateFilter = {
        completedAt: {
          gte: startOfWeek(now, { weekStartsOn: 1 }),
          lte: endOfWeek(now, { weekStartsOn: 1 }),
        },
      };
    } else if (month && year) {
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      dateFilter = {
        completedAt: {
          gte: startOfMonth(date),
          lte: endOfMonth(date),
        },
      };
    } else {
      // Default: this week
      const now = new Date();
      dateFilter = {
        completedAt: {
          gte: startOfWeek(now, { weekStartsOn: 1 }),
          lte: endOfWeek(now, { weekStartsOn: 1 }),
        },
      };
    }

    const count = await prisma.habitCompletion.count({
      where: {
        habitId: gymHabit.id,
        ...dateFilter,
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ count: 0 });
  }
}
