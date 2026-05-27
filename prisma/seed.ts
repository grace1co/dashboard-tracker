// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { startOfWeek, addDays, subDays } from "date-fns";

const prisma = new PrismaClient();
const now = new Date();
const weekStart = startOfWeek(now, { weekStartsOn: 1 });

async function main() {
  console.log("🌱 Seeding database...");

  // Settings
  await prisma.dashboardSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      userName: "Alex",
      weeklyFocus: "Ship the dashboard MVP and establish a morning routine",
      primaryColor: "#6B9080",
      accentColor: "#D4856A",
      morningTime: "07:00",
      eveningTime: "21:00",
      timezone: "America/New_York",
    },
  });

  // Tasks
  await prisma.task.createMany({
    data: [
      { title: "Finish dashboard project", status: "IN_PROGRESS", priority: "HIGH", dueDate: addDays(now, 2), weekOf: weekStart, category: "Work" },
      { title: "Book dentist appointment", status: "NOT_STARTED", priority: "MEDIUM", dueDate: addDays(now, 5), weekOf: weekStart, category: "Health" },
      { title: "Call mom for birthday", status: "NOT_STARTED", priority: "HIGH", dueDate: addDays(now, 1), weekOf: weekStart, category: "Personal" },
      { title: "Return Amazon package", status: "COMPLETED", priority: "LOW", completedAt: subDays(now, 1), weekOf: weekStart, category: "Errands" },
      { title: "Review Q2 finances", status: "NOT_STARTED", priority: "HIGH", dueDate: addDays(now, 7), category: "Finance" },
      { title: "Read 30 pages of current book", status: "IN_PROGRESS", priority: "LOW", weekOf: weekStart, category: "Personal" },
    ],
    skipDuplicates: true,
  });

  // Goals
  const yearlyGoal1 = await prisma.goal.create({
    data: {
      title: "Run a half marathon",
      type: "YEARLY",
      year: now.getFullYear(),
      progress: 35,
      category: "Health",
      description: "Train consistently and complete a half marathon by November",
      subtasks: {
        create: [
          { title: "Run 3x per week", completed: true },
          { title: "Complete a 10K race", completed: false },
          { title: "Build up to 10-mile long run", completed: false },
        ],
      },
    },
  });

  await prisma.goal.create({
    data: {
      title: "Read 24 books",
      type: "YEARLY",
      year: now.getFullYear(),
      progress: 50,
      category: "Learning",
      description: "Two books per month to expand knowledge and creativity",
    },
  });

  await prisma.goal.create({
    data: {
      title: "Save $10,000 emergency fund",
      type: "QUARTERLY",
      year: now.getFullYear(),
      quarter: Math.ceil((now.getMonth() + 1) / 3),
      progress: 60,
      category: "Finance",
    },
  });

  await prisma.goal.create({
    data: {
      title: "Launch side project",
      type: "QUARTERLY",
      year: now.getFullYear(),
      quarter: Math.ceil((now.getMonth() + 1) / 3),
      progress: 40,
      category: "Career",
    },
  });

  await prisma.goal.create({
    data: {
      title: "Meditate daily for 30 days",
      type: "MONTHLY",
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      progress: 70,
      category: "Wellness",
    },
  });

  // Habits
  const habits = await Promise.all([
    prisma.habit.create({ data: { name: "Morning Workout", emoji: "💪", color: "#6B9080", streak: 5, bestStreak: 12 } }),
    prisma.habit.create({ data: { name: "Read 30 mins", emoji: "📚", color: "#D4856A", streak: 3, bestStreak: 21 } }),
    prisma.habit.create({ data: { name: "Meditate", emoji: "🧘", color: "#8B7EC8", streak: 7, bestStreak: 7 } }),
    prisma.habit.create({ data: { name: "Drink 8 glasses water", emoji: "💧", color: "#5BA4CF", streak: 10, bestStreak: 10 } }),
    prisma.habit.create({ data: { name: "No social media before 10am", emoji: "📵", color: "#E8A87C", streak: 2, bestStreak: 14 } }),
    prisma.habit.create({ data: { name: "Journal entry", emoji: "✍️", color: "#B5A4CF", streak: 4, bestStreak: 30 } }),
  ]);

  // Add habit completions for the past week
  for (const habit of habits) {
    for (let i = 0; i < habit.streak; i++) {
      const date = subDays(now, i);
      date.setHours(9, 0, 0, 0);
      try {
        await prisma.habitCompletion.create({
          data: { habitId: habit.id, completedAt: date },
        });
      } catch (e) {
        // skip duplicates
      }
    }
  }

  // Books
  await prisma.book.createMany({
    data: [
      { title: "Atomic Habits", author: "James Clear", status: "READING", currentPage: 180, pageCount: 320, genre: "Self-Help", startedAt: subDays(now, 10), year: now.getFullYear(), month: now.getMonth() + 1 },
      { title: "The Alchemist", author: "Paulo Coelho", status: "COMPLETED", rating: 5, finishedAt: subDays(now, 20), genre: "Fiction", year: now.getFullYear(), month: now.getMonth() },
      { title: "Deep Work", author: "Cal Newport", status: "COMPLETED", rating: 4, finishedAt: subDays(now, 45), genre: "Productivity", year: now.getFullYear() },
      { title: "The Body Keeps the Score", author: "Bessel van der Kolk", status: "WANT_TO_READ", genre: "Psychology", year: now.getFullYear() },
      { title: "Meditations", author: "Marcus Aurelius", status: "WANT_TO_READ", genre: "Philosophy" },
    ],
    skipDuplicates: true,
  });

  // Calendar Events
  await prisma.calendarEvent.createMany({
    data: [
      { title: "Team Standup", startTime: addDays(weekStart, 1), endTime: new Date(addDays(weekStart, 1).setHours(10, 0)), description: "Daily sync with the team" },
      { title: "Gym Session", startTime: new Date(now.setHours(7, 0, 0, 0)), endTime: new Date(new Date().setHours(8, 0, 0, 0)), color: "#6B9080" },
      { title: "Lunch with Sarah", startTime: addDays(weekStart, 2), endTime: new Date(addDays(weekStart, 2).setHours(13, 0)), location: "The Green Cafe" },
      { title: "Doctor Appointment", startTime: addDays(weekStart, 3), endTime: new Date(addDays(weekStart, 3).setHours(15, 0)), description: "Annual checkup", color: "#D4856A" },
      { title: "Friday Review", startTime: addDays(weekStart, 4), endTime: new Date(addDays(weekStart, 4).setHours(17, 0)), color: "#8B7EC8" },
    ],
    skipDuplicates: true,
  });

  // Wins
  await prisma.win.createMany({
    data: [
      { title: "Completed 5-day workout streak!", weekOf: weekStart, month: now.getMonth() + 1, year: now.getFullYear(), category: "Health" },
      { title: "Finished first book of the month", weekOf: weekStart, month: now.getMonth() + 1, year: now.getFullYear(), category: "Learning" },
      { title: "Had a great networking call", weekOf: subDays(weekStart, 7), month: now.getMonth() + 1, year: now.getFullYear(), category: "Career" },
    ],
    skipDuplicates: true,
  });

  // Finance Goals
  await prisma.finance.createMany({
    data: [
      { title: "Emergency Fund", category: "SAVINGS", target: 10000, current: 6000, year: now.getFullYear(), quarter: Math.ceil((now.getMonth() + 1) / 3) },
      { title: "Vacation Fund", category: "SAVINGS", target: 3000, current: 1200, year: now.getFullYear() },
      { title: "Pay Off Credit Card", category: "DEBT_PAYOFF", target: 2500, current: 1800, year: now.getFullYear() },
    ],
    skipDuplicates: true,
  });

  // Bucket List
  await prisma.bucketListItem.createMany({
    data: [
      { title: "Visit Japan during cherry blossom season", category: "TRAVEL", status: "PLANNED", description: "March/April in Tokyo and Kyoto" },
      { title: "Learn to surf", category: "EXPERIENCES", status: "NOT_STARTED" },
      { title: "Write and publish a book", category: "CAREER", status: "NOT_STARTED" },
      { title: "Run a marathon", category: "HEALTH", status: "IN_PROGRESS", description: "Currently training for my first half marathon" },
      { title: "See the Northern Lights", category: "TRAVEL", status: "NOT_STARTED" },
      { title: "Take a solo road trip across the country", category: "EXPERIENCES", status: "NOT_STARTED" },
      { title: "Learn to play guitar", category: "CREATIVITY", status: "IN_PROGRESS" },
      { title: "Skydive", category: "FUN", status: "NOT_STARTED" },
      { title: "Get scuba certified", category: "EXPERIENCES", status: "NOT_STARTED" },
      { title: "Visit all 7 continents", category: "TRAVEL", status: "IN_PROGRESS" },
    ],
    skipDuplicates: true,
  });

  // Yearly Reflection
  await prisma.reflection.create({
    data: {
      type: "YEARLY",
      period: `${now.getFullYear()}`,
      year: now.getFullYear(),
      wantToBecome: "Someone who moves with intention — healthy, creative, financially secure, and deeply present.",
      focusOn: "Physical health, building skills that compound, and deepening meaningful relationships.",
      supportHabits: "Daily movement, reading every day, no phone until 10am, journaling before sleep.",
      noLongerAvailable: "Mindless scrolling, saying yes out of obligation, neglecting my own needs.",
    },
  });

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
