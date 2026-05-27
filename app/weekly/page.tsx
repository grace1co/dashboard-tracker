// app/weekly/page.tsx
"use client";
import { useState, useEffect } from "react";
import { format, addDays, startOfWeek, isToday, isSameDay } from "date-fns";
import toast from "react-hot-toast";
import {
  Dumbbell, BookOpen, Trophy, Calendar, Sun, Target,
  Edit3, Plus, ChevronRight, Zap,
} from "lucide-react";
import {
  Card, SectionHeader, StatusBadge, ProgressBar,
  Checkbox, EmptyState, AddButton, StatCard,
  Modal, FormInput, FormSelect, FormTextarea,
} from "@/components/ui";
import { cn, formatDate, formatTime, getStreakEmoji, isOverdue } from "@/lib/utils";

type Task = {
  id: string; title: string; status: string; priority: string;
  dueDate: string | null; category: string | null; completedAt: string | null;
};
type Event = {
  id: string; title: string; startTime: string; endTime: string | null;
  location: string | null; color: string | null; isAllDay: boolean;
};
type Book = { id: string; title: string; author: string; currentPage: number | null; pageCount: number | null };
type Win = { id: string; title: string };
type Settings = { weeklyFocus: string | null; userName: string };

export default function WeeklyPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [wins, setWins] = useState<Win[]>([]);
  const [gymCount, setGymCount] = useState(0);
  const [settings, setSettings] = useState<Settings>({ weeklyFocus: null, userName: "Friend" });
  const [loading, setLoading] = useState(true);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [addWinOpen, setAddWinOpen] = useState(false);
  const [focusEdit, setFocusEdit] = useState(false);
  const [focusText, setFocusText] = useState("");

  // New task form
  const [newTask, setNewTask] = useState({ title: "", priority: "MEDIUM", dueDate: "", category: "Personal" });
  const [newWin, setNewWin] = useState("");

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const [tasksRes, eventsRes, booksRes, winsRes, settingsRes, habitsRes] = await Promise.all([
        fetch("/api/tasks?week=true"),
        fetch("/api/events?week=true"),
        fetch("/api/books?status=READING"),
        fetch("/api/wins?week=true"),
        fetch("/api/settings"),
        fetch("/api/habits/gym-count"),
      ]);
      const [tasksData, eventsData, booksData, winsData, settingsData, habitsData] = await Promise.all([
        tasksRes.json(), eventsRes.json(), booksRes.json(),
        winsRes.json(), settingsRes.json(), habitsRes.json(),
      ]);
      setTasks(tasksData);
      setEvents(eventsData);
      setBooks(booksData);
      setWins(winsData);
      setSettings(settingsData);
      setFocusText(settingsData.weeklyFocus || "");
      setGymCount(habitsData.count || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function toggleTask(task: Task) {
    const newStatus = task.status === "COMPLETED" ? "NOT_STARTED" : "COMPLETED";
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? { ...t, status: newStatus, completedAt: newStatus === "COMPLETED" ? new Date().toISOString() : null }
            : t
        )
      );
      if (newStatus === "COMPLETED") toast.success("Task completed! 🎉");
    } catch (e) {
      toast.error("Failed to update task");
    }
  }

  async function addTask() {
    if (!newTask.title.trim()) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newTask, weekOf: weekStart.toISOString() }),
      });
      const created = await res.json();
      setTasks((prev) => [created, ...prev]);
      setNewTask({ title: "", priority: "MEDIUM", dueDate: "", category: "Personal" });
      setAddTaskOpen(false);
      toast.success("Task added!");
    } catch (e) {
      toast.error("Failed to add task");
    }
  }

  async function addWin() {
    if (!newWin.trim()) return;
    try {
      const res = await fetch("/api/wins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newWin, weekOf: weekStart.toISOString() }),
      });
      const created = await res.json();
      setWins((prev) => [created, ...prev]);
      setNewWin("");
      setAddWinOpen(false);
      toast.success("Win recorded! 🏆");
    } catch (e) {
      toast.error("Failed to add win");
    }
  }

  async function saveFocus() {
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weeklyFocus: focusText }),
      });
      setSettings((s) => ({ ...s, weeklyFocus: focusText }));
      setFocusEdit(false);
      toast.success("Focus updated!");
    } catch (e) {
      toast.error("Failed to update");
    }
  }

  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const overdueTasks = tasks.filter((t) => isOverdue(t.dueDate) && t.status !== "COMPLETED").length;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="skeleton h-24 rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-4">
      {/* Header */}
      <div className="pt-2">
        <p className="text-sm text-sage-600/70 font-medium">
          {format(today, "EEEE, MMMM d")} · Week {format(weekStart, "w")}
        </p>
        <h1 className="font-display text-2xl font-semibold text-forest-800 mt-0.5">
          Good {getGreeting()}, {settings.userName} ✨
        </h1>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard emoji="✅" label="Done" value={completedTasks} color="bg-sage-50" />
        <StatCard emoji="🏋️" label="Gym" value={`${gymCount}x`} color="bg-terracotta-50" />
        <StatCard emoji="⚠️" label="Overdue" value={overdueTasks} color={overdueTasks > 0 ? "bg-red-50" : "bg-cream-100"} />
      </div>

      {/* Weekly Focus */}
      <Card className="border-sage-200/60 bg-gradient-to-br from-sage-50 to-cream-50">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-sage-500" />
            <span className="text-xs font-semibold text-sage-600 uppercase tracking-wider">Weekly Focus</span>
          </div>
          <button
            onClick={() => setFocusEdit(true)}
            className="p-1.5 rounded-lg hover:bg-sage-100 text-sage-500 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
        {settings.weeklyFocus ? (
          <p className="font-display text-base text-forest-700 leading-snug italic">
            "{settings.weeklyFocus}"
          </p>
        ) : (
          <p className="text-sm text-sage-500/70 italic">Tap to set your weekly focus...</p>
        )}
      </Card>

      {/* Week Calendar Strip */}
      <Card>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day, i) => {
            const dayEvents = events.filter((e) => isSameDay(new Date(e.startTime), day));
            const isCurrentDay = isToday(day);
            return (
              <div
                key={i}
                className={cn(
                  "flex flex-col items-center rounded-xl py-2 px-1 transition-all",
                  isCurrentDay ? "bg-sage-500 text-white" : "hover:bg-cream-50"
                )}
              >
                <span className={cn("text-[10px] font-medium mb-1", isCurrentDay ? "text-sage-100" : "text-sage-500/60")}>
                  {format(day, "EEE")}
                </span>
                <span className={cn("text-sm font-bold", isCurrentDay ? "text-white" : "text-forest-700")}>
                  {format(day, "d")}
                </span>
                {dayEvents.length > 0 && (
                  <div className={cn("w-1.5 h-1.5 rounded-full mt-1", isCurrentDay ? "bg-sage-200" : "bg-terracotta-400")} />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Today's Events */}
      {events.filter((e) => isToday(new Date(e.startTime))).length > 0 && (
        <Card>
          <SectionHeader title="Today" emoji="📅" />
          <div className="space-y-2">
            {events
              .filter((e) => isToday(new Date(e.startTime)))
              .map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-cream-50"
                >
                  <div
                    className="w-1 h-8 rounded-full flex-shrink-0"
                    style={{ backgroundColor: event.color || "#6B9080" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-forest-700 truncate">{event.title}</p>
                    <p className="text-xs text-sage-500/70">
                      {event.isAllDay ? "All day" : formatTime(event.startTime)}
                      {event.location && ` · ${event.location}`}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Tasks */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <SectionHeader
            title="This Week"
            emoji="📋"
            subtitle={`${completedTasks} of ${tasks.length} done`}
          />
          <AddButton onClick={() => setAddTaskOpen(true)} label="Task" />
        </div>

        {tasks.length === 0 ? (
          <EmptyState
            emoji="🎯"
            title="No tasks this week"
            description="Add something to get started"
          />
        ) : (
          <div className="space-y-2">
            {tasks
              .sort((a, b) => {
                const order: Record<string, number> = { OVERDUE: 0, IN_PROGRESS: 1, NOT_STARTED: 2, COMPLETED: 3 };
                return (order[a.status] || 2) - (order[b.status] || 2);
              })
              .map((task, i) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={() => toggleTask(task)}
                  index={i}
                />
              ))}
          </div>
        )}
      </Card>

      {/* Currently Reading */}
      {books.length > 0 && (
        <Card>
          <SectionHeader title="Reading Now" emoji="📚" />
          <div className="space-y-3">
            {books.map((book) => {
              const pct = book.pageCount ? Math.round((book.currentPage || 0) / book.pageCount * 100) : 0;
              return (
                <div key={book.id} className="flex items-center gap-3">
                  <div className="w-10 h-14 rounded-lg bg-gradient-to-br from-sage-100 to-sage-200 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-sage-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-forest-700 truncate">{book.title}</p>
                    <p className="text-xs text-sage-500/70">{book.author}</p>
                    {book.pageCount && (
                      <div className="mt-1.5">
                        <ProgressBar value={pct} showPercent={false} />
                        <p className="text-[10px] text-sage-500/60 mt-0.5">
                          {book.currentPage} / {book.pageCount} pages
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Wins */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="Weekly Wins" emoji="🏆" />
          <AddButton onClick={() => setAddWinOpen(true)} label="Win" />
        </div>
        {wins.length === 0 ? (
          <EmptyState emoji="🌟" title="Add your first win!" description="What went well this week?" />
        ) : (
          <div className="space-y-2">
            {wins.map((win) => (
              <div key={win.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-50">
                <span className="text-base">⭐</span>
                <p className="text-sm text-forest-700">{win.title}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Task Modal */}
      <Modal open={addTaskOpen} onClose={() => setAddTaskOpen(false)} title="Add Task">
        <div className="space-y-4">
          <FormInput
            label="Task"
            value={newTask.title}
            onChange={(v) => setNewTask({ ...newTask, title: v })}
            placeholder="What needs to get done?"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <FormSelect
              label="Priority"
              value={newTask.priority}
              onChange={(v) => setNewTask({ ...newTask, priority: v })}
              options={[
                { value: "LOW", label: "Low" },
                { value: "MEDIUM", label: "Medium" },
                { value: "HIGH", label: "High" },
                { value: "URGENT", label: "Urgent" },
              ]}
            />
            <FormInput
              label="Category"
              value={newTask.category}
              onChange={(v) => setNewTask({ ...newTask, category: v })}
              placeholder="Personal"
            />
          </div>
          <FormInput
            label="Due Date"
            type="date"
            value={newTask.dueDate}
            onChange={(v) => setNewTask({ ...newTask, dueDate: v })}
          />
          <button
            onClick={addTask}
            className="w-full py-3.5 rounded-xl bg-sage-500 text-white font-medium hover:bg-sage-600 active:scale-98 transition-all"
          >
            Add Task
          </button>
        </div>
      </Modal>

      {/* Edit Focus Modal */}
      <Modal open={focusEdit} onClose={() => setFocusEdit(false)} title="Set Weekly Focus">
        <div className="space-y-4">
          <FormTextarea
            label="What is your main focus this week?"
            value={focusText}
            onChange={setFocusText}
            placeholder="e.g., Ship the MVP and establish my morning routine..."
            rows={3}
          />
          <button
            onClick={saveFocus}
            className="w-full py-3.5 rounded-xl bg-sage-500 text-white font-medium hover:bg-sage-600 transition-all"
          >
            Save Focus
          </button>
        </div>
      </Modal>

      {/* Add Win Modal */}
      <Modal open={addWinOpen} onClose={() => setAddWinOpen(false)} title="Record a Win 🏆">
        <div className="space-y-4">
          <FormInput
            label="What did you accomplish?"
            value={newWin}
            onChange={setNewWin}
            placeholder="e.g., Completed 5-day workout streak!"
          />
          <button
            onClick={addWin}
            className="w-full py-3.5 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-all"
          >
            Record Win ⭐
          </button>
        </div>
      </Modal>
    </div>
  );
}

function TaskRow({ task, onToggle, index }: { task: Task; onToggle: () => void; index: number }) {
  const done = task.status === "COMPLETED";
  const overdue = isOverdue(task.dueDate) && !done;
  const priorityDots: Record<string, string> = {
    URGENT: "bg-red-500",
    HIGH: "bg-terracotta-400",
    MEDIUM: "bg-amber-400",
    LOW: "bg-sage-400",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 animate-slide-up",
        done ? "bg-sage-50/50 opacity-60" : overdue ? "bg-red-50" : "bg-white border border-cream-200 hover:border-cream-300"
      )}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <Checkbox checked={done} onChange={onToggle} size="md" />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium text-forest-700 truncate", done && "line-through text-sage-400/70")}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {task.category && (
            <span className="text-[10px] text-sage-500/60">{task.category}</span>
          )}
          {task.dueDate && !done && (
            <span className={cn("text-[10px]", overdue ? "text-red-500 font-medium" : "text-sage-500/60")}>
              {overdue ? "Overdue · " : "Due "}{formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>
      <div className={cn("w-2 h-2 rounded-full flex-shrink-0", priorityDots[task.priority] || "bg-sage-300")} />
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
