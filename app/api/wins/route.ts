// app/api/wins/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const week = searchParams.get("week");
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  try {
    const where: any = {};

    if (week) {
      const now = new Date();
      where.weekOf = {
        gte: startOfWeek(now, { weekStartsOn: 1 }),
        lte: endOfWeek(now, { weekStartsOn: 1 }),
      };
    }
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);

    const wins = await prisma.win.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(wins);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch wins" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const now = new Date();
    const win = await prisma.win.create({
      data: {
        title: body.title,
        description: body.description,
        weekOf: body.weekOf ? new Date(body.weekOf) : now,
        month: body.month || now.getMonth() + 1,
        year: body.year || now.getFullYear(),
        category: body.category,
      },
    });
    return NextResponse.json(win, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add win" }, { status: 500 });
  }
}
