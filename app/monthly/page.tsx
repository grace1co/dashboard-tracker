// app/monthly/page.tsx
"use client";
import { useState, useEffect } from "react";
import { format, startOfMonth, subMonths, addMonths } from "date-fns";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight, BookOpen, Dumbbell } from "lucide-react";
import {
  Card, SectionHeader, ProgressBar, StatusBadge, StatCard,
  EmptyState, Modal, FormTextarea, AddButton,
} from "@/components/ui";
import { cn } from "@/lib/utils";

type Goal = { id: string; title: string; progress: number; status: string; category: string | null };
type Book = { id: string; title: string; author: string; rating: number | null; status: string };
type Reflection = {
  id: string; wentRight: string | null; wentWrong: string | null;
  toChange: string | null; freeform: string | null;
};

export default function MonthlyPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [goals, setGoals] = useState<Goal[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [gymDays, setGymDays] = useState(0);
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const [refForm, setRefForm] = useState({ wentRight: "", wentWrong: "", toChange: "", freeform: "" });
  const [loading, setLoading] = useState(true);

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  async function fetchData() {
    setLoading(true);
    try {
      const [goalsRes, booksRes, refRes, gymRes] = await Promise.all([
        fetch(`/api/goals?type=MONTHLY&month=${month}&year=${year}`),
        fetch(`/api/books?month=${month}&year=${year}&status=COMPLETED`),
        fetch(`/api/reflections?type=MONTHLY&month=${month}&year=${year}`),
        fetch(`/api/habits/gym-count?month=${month}&year=${year}`),
      ]);
      const [goalsData, booksData, refData, gymData] = await Promise.all([
        goalsRes.json(), booksRes.json(), refRes.json(), gymRes.json(),
      ]);
      setGoals(goalsData);
      setBooks(booksData);
      setReflection(refData?.[0] || null);
      setGymDays(gymData.count || 0);
      if (refData?.[0]) {
        setRefForm({
          wentRight: refData[0].wentRight || "",
          wentWrong: refData[0].wentWrong || "",
          toChange: refData[0].toChange || "",
          freeform: refData[0].freeform || "",
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function saveReflection() {
    try {
      const res = await fetch("/api/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "MONTHLY",
          period: `${year}-${String(month).padStart(2, "0")}`,
          year, month, ...refForm,
          id: reflection?.id,
        }),
      });
      const saved = await res.json();
      setReflection(saved);
      setReflectionOpen(false);
      toast.success("Reflection saved ✨");
    } catch (e) {
      toast.error("Failed to save");
    }
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const gymPercent = Math.round((gymDays / daysInMonth) * 100);

  return (
    <div className="space-y-5">
      {/* Header + Month Nav */}
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-forest-800">Monthly</h1>
          <p className="text-sm text-sage-600/70">{format(currentDate, "MMMM yyyy")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="w-9 h-9 rounded-xl border border-cream-300 flex items-center justify-center hover:bg-cream-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-sage-600" />
          </button>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="w-9 h-9 rounded-xl border border-cream-300 flex items-center justify-center hover:bg-cream-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-sage-600" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard emoji="🏋️" label="Gym days" value={gymDays} color="bg-sage-50" />
        <StatCard emoji="📚" label="Books read" value={books.length} color="bg-lavender-50" />
        <StatCard emoji="🎯" label="Goals" value={goals.length} color="bg-terracotta-50" />
      </div>

      {/* Gym Consistency */}
      <Card>
        <SectionHeader title="Gym Consistency" emoji="💪" />
        <div className="space-y-2">
          <ProgressBar value={gymPercent} label={`${gymDays} of ${daysInMonth} days`} color="bg-sage-500" />
          <div className="flex gap-1 flex-wrap mt-3">
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const isGymDay = day <= gymDays;
              return (
                <div
                  key={day}
                  className={cn(
                    "w-6 h-6 rounded-md text-[9px] flex items-center justify-center font-medium",
                    isGymDay ? "bg-sage-400 text-white" : "bg-cream-100 text-sage-400/50"
                  )}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Books Read This Month */}
      <Card>
        <SectionHeader title="Books Finished" emoji="📚" subtitle={`${books.length} this month`} />
        {books.length === 0 ? (
          <EmptyState emoji="📖" title="No books finished yet" description="Keep reading!" />
        ) : (
          <div className="space-y-3">
            {books.map((book) => (
              <div key={book.id} className="flex items-center gap-3 p-3 rounded-xl bg-lavender-50">
                <div className="w-9 h-12 rounded-lg bg-lavender-200 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-lavender-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-forest-700">{book.title}</p>
                  <p className="text-xs text-sage-500/70">{book.author}</p>
                  {book.rating && (
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={i < book.rating! ? "text-amber-400" : "text-cream-300"}>★</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Monthly Goals */}
      {goals.length > 0 && (
        <Card>
          <SectionHeader title="Monthly Goals" emoji="🎯" />
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-forest-700">{goal.title}</p>
                  <StatusBadge status={goal.status} />
                </div>
                <ProgressBar value={goal.progress} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Monthly Reflection */}
      <Card className={cn(reflection ? "border-sage-200/60" : "border-dashed border-cream-300")}>
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="Reflection" emoji="✍️" subtitle={reflection ? "Updated" : "Not yet written"} />
          <button
            onClick={() => setReflectionOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-sage-50 text-sage-600 text-sm font-medium hover:bg-sage-100 transition-colors border border-sage-200"
          >
            {reflection ? "Edit" : "Write"}
          </button>
        </div>

        {reflection ? (
          <div className="space-y-3">
            {[
              { icon: "✅", label: "What went right", value: reflection.wentRight },
              { icon: "🤔", label: "What didn't go well", value: reflection.wentWrong },
              { icon: "🔄", label: "What to change", value: reflection.toChange },
            ].map(({ icon, label, value }) => value && (
              <div key={label} className="p-3 rounded-xl bg-cream-50">
                <p className="text-xs text-sage-500/60 font-medium mb-1">{icon} {label}</p>
                <p className="text-sm text-forest-700 leading-relaxed">{value}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            emoji="🌸"
            title="No reflection yet"
            description="Take a moment to reflect on this month"
          />
        )}
      </Card>

      {/* Reflection Modal */}
      <Modal open={reflectionOpen} onClose={() => setReflectionOpen(false)} title={`${format(currentDate, "MMMM")} Reflection ✍️`}>
        <div className="space-y-4">
          <FormTextarea
            label="✅ What went right this month?"
            value={refForm.wentRight}
            onChange={(v) => setRefForm({ ...refForm, wentRight: v })}
            placeholder="Wins, successes, things you're proud of..."
            rows={3}
          />
          <FormTextarea
            label="🤔 What didn't go well?"
            value={refForm.wentWrong}
            onChange={(v) => setRefForm({ ...refForm, wentWrong: v })}
            placeholder="Challenges, missed goals, struggles..."
            rows={3}
          />
          <FormTextarea
            label="🔄 What do you want to change next month?"
            value={refForm.toChange}
            onChange={(v) => setRefForm({ ...refForm, toChange: v })}
            placeholder="Adjustments, new approaches, intentions..."
            rows={3}
          />
          <button
            onClick={saveReflection}
            className="w-full py-3.5 rounded-xl bg-sage-500 text-white font-medium hover:bg-sage-600 transition-all"
          >
            Save Reflection
          </button>
        </div>
      </Modal>
    </div>
  );
}
