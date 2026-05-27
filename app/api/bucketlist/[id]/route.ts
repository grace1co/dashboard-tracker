// app/api/bucketlist/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const item = await prisma.bucketListItem.update({
      where: { id: params.id },
      data: {
        ...(body.status !== undefined && {
          status: body.status,
          completedAt: body.status === "COMPLETED" ? new Date() : null,
        }),
        ...(body.title !== undefined && { title: body.title }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.description !== undefined && { description: body.description }),
      },
    });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.bucketListItem.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
