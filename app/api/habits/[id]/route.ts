// app/api/habits/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.habit.update({
      where: { id: params.id },
      data: { isActive: false },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete habit" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const habit = await prisma.habit.update({
      where: { id: params.id },
      data: {
        name: body.name,
        emoji: body.emoji,
        color: body.color,
        description: body.description,
      },
    });
    return NextResponse.json(habit);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update habit" }, { status: 500 });
  }
}
