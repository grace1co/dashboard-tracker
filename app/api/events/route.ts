// app/api/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek, addDays } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const week = searchParams.get("week");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  try {
    let dateFilter: any = {};

    if (week) {
      const now = new Date();
      dateFilter = {
        startTime: {
          gte: startOfWeek(now, { weekStartsOn: 1 }),
          lte: endOfWeek(now, { weekStartsOn: 1 }),
        },
      };
    } else if (start && end) {
      dateFilter = {
        startTime: {
          gte: new Date(start),
          lte: new Date(end),
        },
      };
    }

    const events = await prisma.calendarEvent.findMany({
      where: dateFilter,
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = await prisma.calendarEvent.create({
      data: {
        title: body.title,
        description: body.description,
        startTime: new Date(body.startTime),
        endTime: body.endTime ? new Date(body.endTime) : null,
        location: body.location,
        color: body.color,
        isAllDay: body.isAllDay || false,
      },
    });
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
