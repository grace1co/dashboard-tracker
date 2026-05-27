// app/api/reflections/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const year = searchParams.get("year");
  const month = searchParams.get("month");
  const quarter = searchParams.get("quarter");

  try {
    const where: any = {};
    if (type) where.type = type;
    if (year) where.year = parseInt(year);
    if (month) where.month = parseInt(month);
    if (quarter) where.quarter = parseInt(quarter);

    const reflections = await prisma.reflection.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(reflections);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reflections" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Upsert: update existing or create new
    if (body.id) {
      const reflection = await prisma.reflection.update({
        where: { id: body.id },
        data: {
          wentRight: body.wentRight,
          wentWrong: body.wentWrong,
          toChange: body.toChange,
          freeform: body.freeform,
          wantToBecome: body.wantToBecome,
          focusOn: body.focusOn,
          supportHabits: body.supportHabits,
          noLongerAvailable: body.noLongerAvailable,
        },
      });
      return NextResponse.json(reflection);
    }

    const reflection = await prisma.reflection.create({
      data: {
        type: body.type,
        period: body.period,
        year: body.year,
        month: body.month || null,
        quarter: body.quarter || null,
        wentRight: body.wentRight,
        wentWrong: body.wentWrong,
        toChange: body.toChange,
        freeform: body.freeform,
        wantToBecome: body.wantToBecome,
        focusOn: body.focusOn,
        supportHabits: body.supportHabits,
        noLongerAvailable: body.noLongerAvailable,
      },
    });
    return NextResponse.json(reflection, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save reflection" }, { status: 500 });
  }
}
