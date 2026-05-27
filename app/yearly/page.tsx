// app/yearly/page.tsx
"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Sparkles, Star, Target } from "lucide-react";
import {
  Card, SectionHeader, ProgressBar, StatusBadge,
  EmptyState, Modal, FormTextarea, FormInput, FormSelect, AddButton,
} from "@/components/ui";
import { cn } from "@/lib/utils";

type YearlyReflection = {
  id?: string; wantToBecome: string; focusOn: string;
  supportHabits: string; noLongerAvailable: string;
};
type Goal = {
  id: string; title: string; progress: number; status: string;
  category: string | null; description: string | null;
};

const LIFE_BUCKETS = [
  { key: "Health & Fitness", emoji: "💪", color: "bg-sage-50 border-sage-200", description: "Body, mind, wellness" },
  { key: "Career & Finance", emoji: "💼", color: "bg-terracotta-50 border-terracotta-200", description: "Work, money, growth" },
  { key: "Relationships", emoji: "❤️", color: "bg-rose-50 border-rose-200", description: "Love, family, friends" },
  { key: "Personal Growth", emoji: "🌱", color: "bg-lavender-50 border-lavender-200", description: "Learning, creativity, joy" },
];

const YEAR = new Date().getFullYear();

export default function YearlyPage() {
  const [reflection, setReflection] = useState<YearlyReflection>({
    wantToBecome: "", focusOn: "", supportHabits: "", noLongerAvailable: "",
  });
  const [goals, setGoals] = useState<Goal[]>([]);
  const [editingReflection, setEditingReflection] = useState(false);
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", category: "Health & Fitness", description: "" });
  const [loading, setLoading] = useState(true);
  const [reflId, setReflId] = useState<string | undefined>();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [refRes, goalsRes] = await Promise.all([
        fetch(`/api/reflections?type=YEARLY&year=${YEAR}`),
        fetch(`/api/goals?type=YEARLY&year=${YEAR}`),
      ]);
      const [refData, goalsData] = await Promise.all([refRes.json(), goalsRes.json()]);
      if (refData?.[0]) {
        setReflId(refData[0].id);
        setReflection({
          wantToBecome: refData[0].wantToBecome || "",
          focusOn: refData[0].focusOn || "",
          supportHabits: refData[0].supportHabits || "",
          noLongerAvailable: refData[0].noLongerAvailable || "",
        });
      }
      setGoals(goalsData);
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
          id: reflId,
          type: "YEARLY",
          period: String(YEAR),
          year: YEAR,
          ...reflection,
        }),
      });
      const saved = await res.json();
      setReflId(saved.id);
      setEditingReflection(false);
      toast.success("Vision saved ✨");
    } catch (e) {
      toast.error("Failed to save");
    }
  }

  async function addGoal() {
    if (!newGoal.title.trim()) return;
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newGoal, type: "YEARLY", year: YEAR }),
      });
      const created = await res.json();
      setGoals((prev) => [...prev, created]);
      setNewGoal({ title: "", category: "Health & Fitness", description: "" });
      setAddGoalOpen(false);
      toast.success("Goal added 🎯");
    } catch (e) {
      toast.error("Failed to add goal");
    }
  }

  const hasReflection = reflection.wantToBecome || reflection.focusOn || reflection.supportHabits || reflection.noLongerAvailable;

  const questions = [
    { key: "wantToBecome", icon: "🌟", q: "Who do I want to become this year?", hint: "Paint a picture of who you're becoming..." },
    { key: "focusOn", icon: "🎯", q: "What do I need to focus on?", hint: "The areas that will move the needle most..." },
    { key: "supportHabits", icon: "🌱", q: "What habits support that version of me?", hint: "Daily rituals that build who you're becoming..." },
    { key: "noLongerAvailable", icon: "🚫", q: "What am I no longer available for?", hint: "What you're releasing or saying no to..." },
  ];

  if (loading) {
    return <div className="space-y-4 animate-pulse"><div className="skeleton h-96 rounded-2xl" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-terracotta-400" />
          <span className="text-sm font-semibold text-terracotta-500 uppercase tracking-wider">{YEAR} Yearly Reset</span>
        </div>
        <h1 className="font-display text-3xl font-bold text-forest-800 leading-tight">
          Design Your Year
        </h1>
        <p className="text-sm text-sage-600/70 mt-1">
          Your vision, your goals, your life — on purpose.
        </p>
      </div>

      {/* Vision Questions */}
      <div className={cn(
        "rounded-2xl overflow-hidden",
        hasReflection
          ? "bg-gradient-to-br from-forest-900 to-forest-800"
          : "bg-forest-900 border-2 border-dashed border-forest-700"
      )}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-semibold text-white">My {YEAR} Vision</h2>
            <button
              onClick={() => setEditingReflection(true)}
              className="px-3 py-1.5 rounded-xl bg-white/10 text-white/80 text-sm hover:bg-white/20 transition-colors border border-white/10"
            >
              {hasReflection ? "Edit" : "Set Vision"}
            </button>
          </div>

          {hasReflection ? (
            <div className="space-y-4">
              {questions.map(({ key, icon, q }) => {
                const val = reflection[key as keyof YearlyReflection];
                if (!val) return null;
                return (
                  <div key={key}>
                    <p className="text-white/40 text-xs mb-1">{icon} {q}</p>
                    <p className="text-white/90 text-sm leading-relaxed font-light italic">
                      "{val}"
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-5xl mb-3">🌟</div>
              <p className="text-white/60 text-sm">
                Set your yearly vision to make this year intentional
              </p>
              <button
                onClick={() => setEditingReflection(true)}
                className="mt-4 px-5 py-2.5 rounded-xl bg-sage-500 text-white text-sm font-medium hover:bg-sage-600 transition-colors"
              >
                Start Your Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Life Buckets */}
      <Card>
        <SectionHeader title="Life Buckets" emoji="🪣" subtitle="Four areas that matter most" />
        <div className="grid grid-cols-2 gap-3">
          {LIFE_BUCKETS.map((bucket) => {
            const bucketGoals = goals.filter((g) => g.category === bucket.key);
            const avgProgress = bucketGoals.length > 0
              ? Math.round(bucketGoals.reduce((s, g) => s + g.progress, 0) / bucketGoals.length)
              : 0;
            return (
              <div key={bucket.key} className={cn("rounded-xl p-3.5 border", bucket.color)}>
                <div className="text-2xl mb-2">{bucket.emoji}</div>
                <p className="text-sm font-semibold text-forest-700">{bucket.key}</p>
                <p className="text-xs text-sage-500/60 mt-0.5">{bucket.description}</p>
                {bucketGoals.length > 0 ? (
                  <div className="mt-2">
                    <ProgressBar value={avgProgress} showPercent color="bg-forest-700" />
                    <p className="text-[10px] text-sage-500/60 mt-1">{bucketGoals.length} goals</p>
                  </div>
                ) : (
                  <p className="text-[10px] text-sage-400/50 mt-2">No goals yet</p>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Yearly Goals */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="Yearly Goals" emoji="🎯" subtitle={`${YEAR}`} />
          <AddButton onClick={() => setAddGoalOpen(true)} label="Goal" />
        </div>

        {goals.length === 0 ? (
          <EmptyState emoji="🌄" title="No yearly goals yet" description="What do you want to achieve this year?" />
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="border border-cream-200 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-forest-700">{goal.title}</p>
                    {goal.category && (
                      <span className="text-xs text-sage-500/60">{goal.category}</span>
                    )}
                  </div>
                  <StatusBadge status={goal.status} />
                </div>
                <ProgressBar value={goal.progress} />
                {goal.description && (
                  <p className="text-xs text-sage-500/60 mt-2">{goal.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Vision Modal */}
      <Modal open={editingReflection} onClose={() => setEditingReflection(false)} title={`${YEAR} Yearly Vision ✨`}>
        <div className="space-y-4">
          {questions.map(({ key, icon, q, hint }) => (
            <FormTextarea
              key={key}
              label={`${icon} ${q}`}
              value={reflection[key as keyof YearlyReflection] ?? ""}
              onChange={(v) => setReflection({ ...reflection, [key]: v })}
              placeholder={hint}
              rows={3}
            />
          ))}
          <button
            onClick={saveReflection}
            className="w-full py-3.5 rounded-xl bg-forest-800 text-white font-medium hover:bg-forest-900 transition-all"
          >
            Save My Vision ✨
          </button>
        </div>
      </Modal>

      {/* Add Goal Modal */}
      <Modal open={addGoalOpen} onClose={() => setAddGoalOpen(false)} title="Add Yearly Goal">
        <div className="space-y-4">
          <FormInput
            label="Goal"
            value={newGoal.title}
            onChange={(v) => setNewGoal({ ...newGoal, title: v })}
            placeholder="e.g., Run a half marathon"
            required
          />
          <FormSelect
            label="Life Bucket"
            value={newGoal.category}
            onChange={(v) => setNewGoal({ ...newGoal, category: v })}
            options={LIFE_BUCKETS.map((b) => ({ value: b.key, label: `${b.emoji} ${b.key}` }))}
          />
          <FormTextarea
            label="Description (optional)"
            value={newGoal.description}
            onChange={(v) => setNewGoal({ ...newGoal, description: v })}
            placeholder="Why does this matter to you?"
            rows={2}
          />
          <button
            onClick={addGoal}
            className="w-full py-3.5 rounded-xl bg-sage-500 text-white font-medium hover:bg-sage-600 transition-all"
          >
            Add Goal 🎯
          </button>
        </div>
      </Modal>
    </div>
  );
}
