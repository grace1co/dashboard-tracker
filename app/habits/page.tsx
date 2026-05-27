// app/habits/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isToday, isSameDay, subDays,
} from "date-fns";
import toast from "react-hot-toast";
import { Flame, Plus, Trash2, Edit3 } from "lucide-react";
import {
  Card, SectionHeader, EmptyState, Checkbox, Modal,
  FormInput, FormTextarea, StatCard,
} from "@/components/ui";
import { cn, getStreakEmoji } from "@/lib/utils";

type Habit = {
  id: string; name: string; emoji: string; color: string;
  streak: number; bestStreak: number; isActive: boolean;
  completions: { completedAt: string }[];
};

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: "", emoji: "✅", color: "#6B9080", description: "" });
  const [todayCompletions, setTodayCompletions] = useState<Set<string>>(new Set());

  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  useEffect(() => {
    fetchHabits();
  }, []);

  async function fetchHabits() {
    try {
      const res = await fetch("/api/habits");
      const data = await res.json();
      setHabits(data);
      const completedToday = new Set<string>(
        data
          .filter((h: Habit) =>
            h.completions.some((c) => isToday(new Date(c.completedAt)))
          )
          .map((h: Habit) => h.id)
      );
      setTodayCompletions(completedToday);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function toggleHabit(habit: Habit) {
    const wasCompleted = todayCompletions.has(habit.id);
    try {
      if (wasCompleted) {
        await fetch(`/api/habits/${habit.id}/complete`, { method: "DELETE" });
        setTodayCompletions((prev) => { const n = new Set(prev); n.delete(habit.id); return n; });
        setHabits((prev) =>
          prev.map((h) => h.id === habit.id ? { ...h, streak: Math.max(0, h.streak - 1) } : h)
        );
      } else {
        await fetch(`/api/habits/${habit.id}/complete`, { method: "POST" });
        setTodayCompletions((prev) => new Set([...prev, habit.id]));
        setHabits((prev) =>
          prev.map((h) =>
            h.id === habit.id
              ? { ...h, streak: h.streak + 1, bestStreak: Math.max(h.bestStreak, h.streak + 1) }
              : h
          )
        );
        if (!wasCompleted) toast.success(`${habit.emoji} ${habit.name} logged!`);
      }
    } catch (e) {
      toast.error("Failed to update habit");
    }
  }

  async function addHabit() {
    if (!newHabit.name.trim()) return;
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHabit),
      });
      const created = await res.json();
      setHabits((prev) => [...prev, { ...created, completions: [] }]);
      setNewHabit({ name: "", emoji: "✅", color: "#6B9080", description: "" });
      setAddOpen(false);
      toast.success("Habit created! 🌱");
    } catch (e) {
      toast.error("Failed to add habit");
    }
  }

  async function deleteHabit(id: string) {
    if (!confirm("Delete this habit?")) return;
    try {
      await fetch(`/api/habits/${id}`, { method: "DELETE" });
      setHabits((prev) => prev.filter((h) => h.id !== id));
      toast.success("Habit deleted");
    } catch (e) {
      toast.error("Failed to delete habit");
    }
  }

  const completedToday = todayCompletions.size;
  const totalHabits = habits.length;
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const longestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

  const emojiOptions = ["✅", "💪", "📚", "🧘", "💧", "🏃", "🍎", "✍️", "🎯", "💊", "🛏️", "🧹", "🎨", "🎵", "🌱"];

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="skeleton h-20 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-forest-800">Habits</h1>
          <p className="text-sm text-sage-600/70">{format(today, "MMMM yyyy")}</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="touch-target w-11 h-11 rounded-xl bg-sage-500 text-white flex items-center justify-center shadow-soft hover:bg-sage-600 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard emoji="🎯" label="Today" value={`${completedToday}/${totalHabits}`} color="bg-sage-50" />
        <StatCard emoji="🔥" label="Best streak" value={longestStreak} color="bg-terracotta-50" />
        <StatCard emoji="📊" label="Today %" value={`${completionRate}%`} color="bg-lavender-50" />
      </div>

      {/* Today's Habits */}
      <Card>
        <SectionHeader title="Today's Habits" emoji="☀️" subtitle={format(today, "EEEE, MMMM d")} />

        {habits.length === 0 ? (
          <EmptyState
            emoji="🌱"
            title="No habits yet"
            description="Build rituals that support the version of you you're becoming"
            action={
              <button
                onClick={() => setAddOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-sage-500 text-white text-sm font-medium"
              >
                Add your first habit
              </button>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {habits.map((habit, i) => {
              const done = todayCompletions.has(habit.id);
              return (
                <div
                  key={habit.id}
                  className={cn(
                    "flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 animate-slide-up",
                    done ? "opacity-70" : "bg-white border border-cream-200"
                  )}
                  style={{
                    animationDelay: `${i * 50}ms`,
                    backgroundColor: done ? `${habit.color}15` : undefined,
                    borderColor: done ? `${habit.color}30` : undefined,
                    borderWidth: done ? "1px" : undefined,
                    borderStyle: done ? "solid" : undefined,
                  }}
                >
                  <Checkbox
                    checked={done}
                    onChange={() => toggleHabit(habit)}
                    color={habit.color}
                    size="lg"
                  />
                  <span className="text-xl flex-shrink-0">{habit.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-semibold text-forest-700",
                      done && "line-through text-sage-400/70"
                    )}>
                      {habit.name}
                    </p>
                    <p className="text-xs text-sage-500/60 mt-0.5 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-400" />
                      {habit.streak} day streak {getStreakEmoji(habit.streak)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-sage-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Monthly Calendar Tracker */}
      {habits.length > 0 && (
        <Card>
          <SectionHeader title="Monthly Overview" emoji="📅" subtitle={format(today, "MMMM yyyy")} />
          <div className="space-y-4">
            {habits.slice(0, 4).map((habit) => (
              <HabitCalendar key={habit.id} habit={habit} days={monthDays} />
            ))}
            {habits.length > 4 && (
              <p className="text-xs text-sage-500/60 text-center">+{habits.length - 4} more habits</p>
            )}
          </div>
        </Card>
      )}

      {/* Streaks Board */}
      {habits.length > 0 && (
        <Card>
          <SectionHeader title="Streaks" emoji="🔥" />
          <div className="space-y-2">
            {[...habits]
              .sort((a, b) => b.streak - a.streak)
              .map((habit) => (
                <div key={habit.id} className="flex items-center gap-3 py-1">
                  <span className="text-lg w-8 text-center">{habit.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-forest-700">{habit.name}</span>
                      <span className="text-xs font-bold text-terracotta-500">
                        {habit.streak}d {getStreakEmoji(habit.streak)}
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${habit.bestStreak > 0 ? (habit.streak / habit.bestStreak) * 100 : 0}%`,
                          backgroundColor: habit.color,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-sage-500/60 mt-0.5">Best: {habit.bestStreak} days</p>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Add Habit Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New Habit 🌱">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-forest-700">Pick an emoji</label>
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setNewHabit({ ...newHabit, emoji })}
                  className={cn(
                    "w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all",
                    newHabit.emoji === emoji
                      ? "bg-sage-100 ring-2 ring-sage-500 scale-110"
                      : "bg-cream-50 hover:bg-cream-100"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <FormInput
            label="Habit Name"
            value={newHabit.name}
            onChange={(v) => setNewHabit({ ...newHabit, name: v })}
            placeholder="e.g., Morning workout"
            required
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-forest-700">Color</label>
            <div className="flex gap-2 flex-wrap">
              {["#6B9080", "#D4856A", "#8B7EC8", "#5BA4CF", "#E8A87C", "#B5A4CF", "#E8747C", "#7EC8A4"].map((color) => (
                <button
                  key={color}
                  onClick={() => setNewHabit({ ...newHabit, color })}
                  className={cn(
                    "w-8 h-8 rounded-lg transition-all",
                    newHabit.color === color && "ring-2 ring-offset-2 ring-forest-800 scale-110"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <button
            onClick={addHabit}
            className="w-full py-3.5 rounded-xl bg-sage-500 text-white font-medium hover:bg-sage-600 active:scale-98 transition-all"
          >
            Create Habit
          </button>
        </div>
      </Modal>
    </div>
  );
}

function HabitCalendar({ habit, days }: { habit: Habit; days: Date[] }) {
  const completedDays = new Set(
    habit.completions.map((c) => format(new Date(c.completedAt), "yyyy-MM-dd"))
  );
  const today = new Date();

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">{habit.emoji}</span>
        <span className="text-sm font-medium text-forest-700">{habit.name}</span>
        <span className="ml-auto text-xs text-sage-500/60">
          {completedDays.size}/{days.filter((d) => d <= today).length}
        </span>
      </div>
      <div className="flex gap-1 flex-wrap">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const done = completedDays.has(key);
          const isFuture = day > today;
          const isCurrentDay = isToday(day);
          return (
            <div
              key={key}
              title={format(day, "MMM d")}
              className={cn(
                "w-6 h-6 rounded-md transition-all",
                isFuture ? "bg-cream-100" :
                done ? "scale-100" :
                "bg-cream-200/60",
                isCurrentDay && !done && "ring-1 ring-sage-400"
              )}
              style={done ? { backgroundColor: `${habit.color}90` } : {}}
            />
          );
        })}
      </div>
    </div>
  );
}
