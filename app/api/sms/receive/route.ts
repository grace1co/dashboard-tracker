// app/api/sms/receive/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Twilio sends form data for incoming SMS
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const body = formData.get("Body")?.toString().toLowerCase().trim() || "";
    const from = formData.get("From")?.toString() || "";

    // Log incoming message
    await prisma.smsLog.create({
      data: {
        direction: "INBOUND",
        message: body,
        processed: false,
      },
    });

    let reply = "";
    let action = "";

    // ── Parse commands ────────────────────────────────────
    // "gym" or "worked out" → log gym habit completion
    if (body.includes("gym") || body.includes("worked out") || body.includes("workout")) {
      const gymHabit = await prisma.habit.findFirst({
        where: { name: { contains: "workout", mode: "insensitive" } },
      });

      if (gymHabit) {
        try {
          const today = new Date();
          today.setHours(12, 0, 0, 0);
          await prisma.habitCompletion.create({
            data: { habitId: gymHabit.id, completedAt: today },
          });
          await prisma.habit.update({
            where: { id: gymHabit.id },
            data: { streak: { increment: 1 } },
          });
          reply = `💪 Gym logged! Keep going!`;
          action = "gym_logged";
        } catch {
          reply = "💪 Looks like gym was already logged today!";
        }
      }
    }

    // "read [book title]" or "finished [book]" → mark book complete
    else if (body.startsWith("finished reading") || body.startsWith("done reading") || body.startsWith("read ")) {
      const bookQuery = body
        .replace(/^finished reading\s*/i, "")
        .replace(/^done reading\s*/i, "")
        .replace(/^read\s*/i, "")
        .trim();

      const book = await prisma.book.findFirst({
        where: {
          title: { contains: bookQuery, mode: "insensitive" },
          status: "READING",
        },
      });

      if (book) {
        await prisma.book.update({
          where: { id: book.id },
          data: {
            status: "COMPLETED",
            finishedAt: new Date(),
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
          },
        });
        reply = `📚 "${book.title}" marked as finished! ✨`;
        action = "book_completed";
      } else {
        reply = `📚 Couldn't find that book. Check the dashboard to update manually.`;
      }
    }

    // "done [task]" or "completed [task]" → mark task complete
    else if (body.startsWith("done ") || body.startsWith("completed ") || body.startsWith("finished ")) {
      const taskQuery = body
        .replace(/^done\s*/i, "")
        .replace(/^completed\s*/i, "")
        .replace(/^finished\s*/i, "")
        .trim();

      const task = await prisma.task.findFirst({
        where: {
          title: { contains: taskQuery, mode: "insensitive" },
          status: { not: "COMPLETED" },
        },
      });

      if (task) {
        await prisma.task.update({
          where: { id: task.id },
          data: { status: "COMPLETED", completedAt: new Date() },
        });
        reply = `✅ "${task.title}" marked as done!`;
        action = "task_completed";
      } else {
        reply = `❓ Couldn't find that task. Check the dashboard.`;
      }
    }

    // "win: [something]" → add weekly win
    else if (body.startsWith("win:") || body.startsWith("win ")) {
      const winText = body.replace(/^win:?\s*/i, "").trim();
      if (winText) {
        await prisma.win.create({
          data: {
            title: winText,
            weekOf: new Date(),
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
          },
        });
        reply = `🏆 Win recorded: "${winText}"`;
        action = "win_added";
      }
    }

    // "help" → show commands
    else if (body === "help") {
      reply = `📱 Dashboard Commands:\n• "gym" - log workout\n• "read [book]" - mark book done\n• "done [task]" - complete a task\n• "win: [text]" - add a win`;
      action = "help";
    }

    else {
      reply = `👋 Got your message! Try "help" for available commands.`;
      action = "unknown";
    }

    // Update log with processed status
    await prisma.smsLog.updateMany({
      where: { message: body, processed: false },
      data: { processed: true, action },
    });

    // Return TwiML response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${reply}</Message>
</Response>`;

    return new Response(twiml, {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    console.error("SMS receive error:", error);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>Something went wrong. Check the dashboard!</Message></Response>`, {
      headers: { "Content-Type": "text/xml" },
    });
  }
}
