// app/api/finance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year");
  const quarter = searchParams.get("quarter");

  try {
    const where: any = {};
    if (year) where.year = parseInt(year);
    if (quarter) where.quarter = parseInt(quarter);

    const finances = await prisma.finance.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(finances);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch finances" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const finance = await prisma.finance.create({
      data: {
        title: body.title,
        category: body.category || "SAVINGS",
        target: parseFloat(body.target),
        current: parseFloat(body.current || 0),
        year: body.year || new Date().getFullYear(),
        quarter: body.quarter || null,
        notes: body.notes,
      },
    });
    return NextResponse.json(finance, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create finance goal" }, { status: 500 });
  }
}
