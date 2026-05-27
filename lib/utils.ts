// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, startOfWeek, endOfWeek, isAfter, isBefore, isToday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getWeekRange(date = new Date()) {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return { start, end };
}

export function formatDate(date: Date | string, fmt = "MMM d") {
  return format(new Date(date), fmt);
}

export function getStatusColor(status: string) {
  switch (status) {
    case "COMPLETED": return "text-sage-600 bg-sage-50 border-sage-200";
    case "IN_PROGRESS": return "text-blue-600 bg-blue-50 border-blue-200";
    case "NOT_STARTED": return "text-gray-500 bg-gray-50 border-gray-200";
    case "OVERDUE": return "text-red-600 bg-red-50 border-red-200";
    case "PLANNED": return "text-terracotta-600 bg-terracotta-50 border-terracotta-200";
    default: return "text-gray-500 bg-gray-50 border-gray-200";
  }
}

export function getPriorityColor(priority: string) {
  switch (priority) {
    case "URGENT": return "text-red-600 bg-red-50";
    case "HIGH": return "text-terracotta-600 bg-terracotta-50";
    case "MEDIUM": return "text-amber-600 bg-amber-50";
    case "LOW": return "text-sage-600 bg-sage-50";
    default: return "text-gray-500 bg-gray-50";
  }
}

export function isOverdue(dueDate: Date | string | null | undefined): boolean {
  if (!dueDate) return false;
  return isBefore(new Date(dueDate), new Date()) && !isToday(new Date(dueDate));
}

export function getCurrentQuarter(): number {
  return Math.ceil((new Date().getMonth() + 1) / 3);
}

export function getProgressColor(progress: number): string {
  if (progress >= 80) return "bg-sage-500";
  if (progress >= 50) return "bg-terracotta-400";
  if (progress >= 25) return "bg-amber-400";
  return "bg-cream-400";
}

export function getBucketCategoryConfig(category: string) {
  const configs: Record<string, { emoji: string; color: string; bg: string }> = {
    TRAVEL: { emoji: "✈️", color: "text-blue-600", bg: "bg-blue-50" },
    CAREER: { emoji: "💼", color: "text-purple-600", bg: "bg-purple-50" },
    RELATIONSHIPS: { emoji: "❤️", color: "text-rose-600", bg: "bg-rose-50" },
    HEALTH: { emoji: "💪", color: "text-sage-600", bg: "bg-sage-50" },
    EXPERIENCES: { emoji: "🌟", color: "text-amber-600", bg: "bg-amber-50" },
    FUN: { emoji: "🎉", color: "text-terracotta-600", bg: "bg-terracotta-50" },
    PERSONAL_GROWTH: { emoji: "🌱", color: "text-green-600", bg: "bg-green-50" },
    CREATIVITY: { emoji: "🎨", color: "text-lavender-600", bg: "bg-lavender-50" },
  };
  return configs[category] || { emoji: "⭐", color: "text-gray-600", bg: "bg-gray-50" };
}

export function getDayName(date: Date): string {
  return format(date, "EEE");
}

export function formatTime(date: Date | string): string {
  return format(new Date(date), "h:mm a");
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 30) return "🔥🔥🔥";
  if (streak >= 14) return "🔥🔥";
  if (streak >= 7) return "🔥";
  if (streak >= 3) return "⚡";
  return "";
}
