// app/api/sms/send-morning/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isToday, startOfDay, endOfDay, addDays } from "date-fns";

export async function POST(req: NextRequest) {
  // Protect with a cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await prisma.dashboardSettings.findFirst({ where: { id: "default" } });
    if (!settings?.smsEnabled || !settings.phoneNumber) {
      return NextResponse.json({ message: "SMS not enabled" });
    }

    const now = new Date();
    const threeDaysFromNow = addDays(now, 3);

    // Gather today's data
    const [todayTasks, todayEvents, upcomingTasks, openTasks] = await Promise.all([
      prisma.task.findMany({
        where: {
          status: { in: ["NOT_STARTED", "IN_PROGRESS"] },
          dueDate: { gte: startOfDay(now), lte: endOfDay(now) },
        },
      }),
      prisma.calendarEvent.findMany({
        where: {
          startTime: { gte: startOfDay(now), lte: endOfDay(now) },
        },
        orderBy: { startTime: "asc" },
      }),
      prisma.task.findMany({
        where: {
          status: { in: ["NOT_STARTED", "IN_PROGRESS"] },
          dueDate: { gte: now, lte: threeDaysFromNow },
        },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),
      prisma.task.findMany({
        where: { status: "OVERDUE" },
        take: 3,
      }),
    ]);

    // Build message
    let message = `🌅 Good morning, ${settings.userName}!\n\n`;

    if (todayEvents.length > 0) {
      message += `📅 TODAY'S EVENTS:\n`;
      todayEvents.forEach((e) => {
        const time = e.isAllDay ? "All day" : new Date(e.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
        message += `• ${e.title} @ ${time}\n`;
      });
      message += "\n";
    }

    if (todayTasks.length > 0) {
      message += `✅ TODAY'S TASKS:\n`;
      todayTasks.forEach((t) => { message += `• ${t.title}\n`; });
      message += "\n";
    }

    if (openTasks.length > 0) {
      message += `⏰ COMING UP:\n`;
      openTasks.forEach((t) => {
        const due = t.dueDate ? new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
        message += `• ${t.title}${due ? ` (${due})` : ""}\n`;
      });
      message += "\n";
    }

    if (openTasks.length === 0 && todayTasks.length === 0) {
      message += "✨ No urgent tasks today — enjoy some breathing room!\n\n";
    }

    message += `Have a great day! Reply with updates:\n"gym" • "read [book]" • "done [task]"`;

    // Send via Twilio
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const twilio = require("twilio")(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await twilio.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: settings.phoneNumber,
      });

      await prisma.smsLog.create({
        data: {
          direction: "OUTBOUND",
          message,
          processed: true,
          action: "morning_summary",
        },
      });
    }

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("SMS error:", error);
    return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
  }
}
