// app/api/tasks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const week = searchParams.get("week");
  const status = searchParams.get("status");
  const category = searchParams.get("category");

  try {
    const where: any = {};

    if (week) {
      const now = new Date();
      const start = startOfWeek(now, { weekStartsOn: 1 });
      const end = endOfWeek(now, { weekStartsOn: 1 });
      where.weekOf = { gte: start, lte: end };
    }

    if (status) where.status = status;
    if (category) where.category = category;

    // Auto-mark overdue tasks
    await prisma.task.updateMany({
      where: {
        status: { in: ["NOT_STARTED", "IN_PROGRESS"] },
        dueDate: { lt: new Date() },
      },
      data: { status: "OVERDUE" },
    });

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [
        { status: "asc" },
        { priority: "asc" },
        { dueDate: "asc" },
      ],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        status: body.status || "NOT_STARTED",
        priority: body.priority || "MEDIUM",
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        weekOf: body.weekOf ? new Date(body.weekOf) : null,
        category: body.category,
      },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
