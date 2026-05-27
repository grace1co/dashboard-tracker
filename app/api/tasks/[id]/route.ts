// app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data: any = {};

    if (body.title !== undefined) data.title = body.title;
    if (body.status !== undefined) {
      data.status = body.status;
      if (body.status === "COMPLETED") data.completedAt = new Date();
      if (body.status === "NOT_STARTED") data.completedAt = null;
    }
    if (body.priority !== undefined) data.priority = body.priority;
    if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.category !== undefined) data.category = body.category;
    if (body.description !== undefined) data.description = body.description;

    const task = await prisma.task.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.task.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
