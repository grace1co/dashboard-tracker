// app/quarterly/page.tsx
"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { TrendingUp, DollarSign, Target } from "lucide-react";
import {
  Card, SectionHeader, ProgressBar, StatusBadge, EmptyState,
  Modal, FormInput, FormSelect, FormTextarea, StatCard, AddButton,
} from "@/components/ui";
import { cn, getCurrentQuarter } from "@/lib/utils";

type Goal = {
  id: string; title: string; progress: number; status: string;
  category: string | null; description: string | null;
  subtasks: { id: string; title: string; completed: boolean }[];
};
type Finance = {
  id: string; title: string; category: string; target: number; current: number;
};

const CURRENT_Q = getCurrentQuarter();
const YEAR = new Date().getFullYear();

export default function QuarterlyPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [finances, setFinances] = useState<Finance[]>([]);
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [addFinOpen, setAddFinOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", category: "Career", description: "" });
  const [newFin, setNewFin] = useState({ title: "", category: "SAVINGS", target: "", current: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [goalsRes, finRes] = await Promise.all([
        fetch(`/api/goals?type=QUARTERLY&quarter=${CURRENT_Q}&year=${YEAR}`),
        fetch(`/api/finance?quarter=${CURRENT_Q}&year=${YEAR}`),
      ]);
      const [goalsData, finData] = await Promise.all([goalsRes.json(), finRes.json()]);
      setGoals(goalsData);
      setFinances(finData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function addGoal() {
    if (!newGoal.title.trim()) return;
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newGoal, type: "QUARTERLY", year: YEAR, quarter: CURRENT_Q }),
      });
      const created = await res.json();
      setGoals((prev) => [...prev, { ...created, subtasks: [] }]);
      setNewGoal({ title: "", category: "Career", description: "" });
      setAddGoalOpen(false);
      toast.success("Goal added!");
    } catch (e) {
      toast.error("Failed to add goal");
    }
  }

  async function addFinance() {
    if (!newFin.title.trim() || !newFin.target) return;
    try {
      const res = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newFin,
          target: parseFloat(newFin.target),
          current: parseFloat(newFin.current || "0"),
          year: YEAR,
          quarter: CURRENT_Q,
        }),
      });
      const created = await res.json();
      setFinances((prev) => [...prev, created]);
      setNewFin({ title: "", category: "SAVINGS", target: "", current: "" });
      setAddFinOpen(false);
      toast.success("Finance goal added!");
    } catch (e) {
      toast.error("Failed to add");
    }
  }

  async function toggleSubtask(goalId: string, subtaskId: string, completed: boolean) {
    try {
      await fetch(`/api/goals/${goalId}/subtasks/${subtaskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId
            ? {
                ...g,
                subtasks: g.subtasks.map((s) =>
                  s.id === subtaskId ? { ...s, completed: !completed } : s
                ),
              }
            : g
        )
      );
    } catch (e) {
      toast.error("Failed to update");
    }
  }

  const totalSaved = finances.filter((f) => f.category === "SAVINGS").reduce((s, f) => s + f.current, 0);
  const totalTarget = finances.filter((f) => f.category === "SAVINGS").reduce((s, f) => s + f.target, 0);
  const avgGoalProgress = goals.length > 0
    ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length)
    : 0;

  return (
    <div className="space-y-5">
      <div className="pt-2 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-forest-800">Q{CURRENT_Q} {YEAR}</h1>
          <p className="text-sm text-sage-600/70">Quarterly overview</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard emoji="🎯" label="Avg progress" value={`${avgGoalProgress}%`} color="bg-sage-50" />
        <StatCard emoji="💰" label="Total saved" value={`$${totalSaved.toLocaleString()}`} color="bg-terracotta-50" />
        <StatCard emoji="📋" label="Goals" value={goals.length} color="bg-lavender-50" />
      </div>

      {/* Quarterly Goals */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="Q{CURRENT_Q} Goals" emoji="🎯" subtitle={`${goals.length} goals this quarter`} />
          <AddButton onClick={() => setAddGoalOpen(true)} label="Goal" />
        </div>

        {goals.length === 0 ? (
          <EmptyState emoji="🚀" title="No quarterly goals yet" description="What do you want to achieve this quarter?" />
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="border border-cream-200 rounded-xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-forest-700">{goal.title}</p>
                    {goal.category && <span className="text-xs text-sage-500/60">{goal.category}</span>}
                  </div>
                  <StatusBadge status={goal.status} />
                </div>
                <ProgressBar value={goal.progress} />

                {/* Subtasks */}
                {goal.subtasks && goal.subtasks.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-sage-500/60 uppercase tracking-wide">Steps</p>
                    {goal.subtasks.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => toggleSubtask(goal.id, sub.id, sub.completed)}
                      >
                        <div className={cn(
                          "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
                          sub.completed ? "bg-sage-500 border-sage-500" : "border-cream-300"
                        )}>
                          {sub.completed && <span className="text-[8px] text-white font-bold">✓</span>}
                        </div>
                        <span className={cn("text-xs text-forest-600", sub.completed && "line-through text-sage-400/60")}>
                          {sub.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Finance & Savings */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="Finance & Savings" emoji="💰" />
          <AddButton onClick={() => setAddFinOpen(true)} label="Goal" />
        </div>

        {totalTarget > 0 && (
          <div className="bg-sage-50 rounded-xl p-3 mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-sage-600/70">Total saved toward goals</p>
              <p className="font-display text-xl font-bold text-forest-800">
                ${totalSaved.toLocaleString()}
                <span className="text-sm font-normal text-sage-500/60"> / ${totalTarget.toLocaleString()}</span>
              </p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        )}

        {finances.length === 0 ? (
          <EmptyState emoji="🏦" title="No finance goals yet" description="Track savings, investments, and debt payoff" />
        ) : (
          <div className="space-y-4">
            {finances.map((fin) => {
              const pct = fin.target > 0 ? Math.round((fin.current / fin.target) * 100) : 0;
              return (
                <div key={fin.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-forest-700">{fin.title}</span>
                    <span className="text-sm font-semibold text-sage-600">
                      ${fin.current.toLocaleString()} / ${fin.target.toLocaleString()}
                    </span>
                  </div>
                  <ProgressBar value={pct} color="bg-terracotta-400" />
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add Goal Modal */}
      <Modal open={addGoalOpen} onClose={() => setAddGoalOpen(false)} title="Add Quarterly Goal">
        <div className="space-y-4">
          <FormInput label="Goal" value={newGoal.title} onChange={(v) => setNewGoal({ ...newGoal, title: v })} placeholder="e.g., Launch side project" required />
          <FormInput label="Category" value={newGoal.category} onChange={(v) => setNewGoal({ ...newGoal, category: v })} placeholder="Career, Health, Finance..." />
          <FormTextarea label="Description" value={newGoal.description} onChange={(v) => setNewGoal({ ...newGoal, description: v })} placeholder="What does success look like?" rows={2} />
          <button onClick={addGoal} className="w-full py-3.5 rounded-xl bg-sage-500 text-white font-medium hover:bg-sage-600 transition-all">Add Goal</button>
        </div>
      </Modal>

      {/* Add Finance Modal */}
      <Modal open={addFinOpen} onClose={() => setAddFinOpen(false)} title="Add Finance Goal">
        <div className="space-y-4">
          <FormInput label="Name" value={newFin.title} onChange={(v) => setNewFin({ ...newFin, title: v })} placeholder="e.g., Emergency Fund" required />
          <FormSelect
            label="Type"
            value={newFin.category}
            onChange={(v) => setNewFin({ ...newFin, category: v })}
            options={[
              { value: "SAVINGS", label: "💰 Savings" },
              { value: "INVESTMENT", label: "📈 Investment" },
              { value: "DEBT_PAYOFF", label: "💳 Debt Payoff" },
              { value: "BUDGET", label: "📊 Budget" },
              { value: "INCOME_GOAL", label: "💵 Income Goal" },
            ]}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="Target ($)" type="number" value={newFin.target} onChange={(v) => setNewFin({ ...newFin, target: v })} placeholder="10000" />
            <FormInput label="Current ($)" type="number" value={newFin.current} onChange={(v) => setNewFin({ ...newFin, current: v })} placeholder="0" />
          </div>
          <button onClick={addFinance} className="w-full py-3.5 rounded-xl bg-terracotta-500 text-white font-medium hover:bg-terracotta-600 transition-all">Add Finance Goal</button>
        </div>
      </Modal>
    </div>
  );
}
