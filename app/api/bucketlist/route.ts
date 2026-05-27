// app/api/bucketlist/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status");

  try {
    const where: any = {};
    if (category && category !== "ALL") where.category = category;
    if (status) where.status = status;

    const items = await prisma.bucketListItem.findMany({
      where,
      orderBy: [
        { status: "asc" },
        { createdAt: "desc" },
      ],
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bucket list" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const item = await prisma.bucketListItem.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category || "EXPERIENCES",
        status: body.status || "NOT_STARTED",
        targetDate: body.targetDate ? new Date(body.targetDate) : null,
        notes: body.notes,
        imageUrl: body.imageUrl,
        link: body.link,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create bucket list item" }, { status: 500 });
  }
}
