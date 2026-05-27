// app/api/habits/[id]/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const today = new Date();
    today.setHours(12, 0, 0, 0); // Use noon to avoid timezone issues

    const completion = await prisma.habitCompletion.create({
      data: {
        habitId: params.id,
        completedAt: today,
      },
    });

    // Update streak
    const habit = await prisma.habit.findUnique({ where: { id: params.id } });
    if (habit) {
      const newStreak = habit.streak + 1;
      await prisma.habit.update({
        where: { id: params.id },
        data: {
          streak: newStreak,
          bestStreak: Math.max(habit.bestStreak, newStreak),
        },
      });
    }

    return NextResponse.json(completion, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Already completed today" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to complete habit" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const today = new Date();

    await prisma.habitCompletion.deleteMany({
      where: {
        habitId: params.id,
        completedAt: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
      },
    });

    // Decrement streak
    const habit = await prisma.habit.findUnique({ where: { id: params.id } });
    if (habit && habit.streak > 0) {
      await prisma.habit.update({
        where: { id: params.id },
        data: { streak: habit.streak - 1 },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove completion" }, { status: 500 });
  }
}
