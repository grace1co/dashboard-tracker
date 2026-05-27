// app/api/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.dashboardSettings.findFirst({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.dashboardSettings.create({
        data: { id: "default" },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    const settings = await prisma.dashboardSettings.upsert({
      where: { id: "default" },
      update: {
        ...(body.weeklyFocus !== undefined && { weeklyFocus: body.weeklyFocus }),
        ...(body.userName !== undefined && { userName: body.userName }),
        ...(body.phoneNumber !== undefined && { phoneNumber: body.phoneNumber }),
        ...(body.smsEnabled !== undefined && { smsEnabled: body.smsEnabled }),
        ...(body.morningTime !== undefined && { morningTime: body.morningTime }),
        ...(body.eveningTime !== undefined && { eveningTime: body.eveningTime }),
        ...(body.timezone !== undefined && { timezone: body.timezone }),
        ...(body.primaryColor !== undefined && { primaryColor: body.primaryColor }),
        ...(body.accentColor !== undefined && { accentColor: body.accentColor }),
      },
      create: {
        id: "default",
        ...body,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
