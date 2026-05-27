// app/bucketlist/page.tsx
"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Search, MapPin, Filter } from "lucide-react";
import {
  Card, SectionHeader, StatusBadge, EmptyState, AddButton,
  Modal, FormInput, FormSelect, FormTextarea,
} from "@/components/ui";
import { cn, getBucketCategoryConfig } from "@/lib/utils";

type BucketItem = {
  id: string; title: string; category: string; status: string;
  description: string | null; notes: string | null; targetDate: string | null;
};

const CATEGORIES = [
  "ALL", "TRAVEL", "CAREER", "RELATIONSHIPS", "HEALTH",
  "EXPERIENCES", "FUN", "PERSONAL_GROWTH", "CREATIVITY",
];

const STATUS_OPTIONS = [
  { value: "NOT_STARTED", label: "Not Started" },
  { value: "PLANNED", label: "Planned" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
];

export default function BucketListPage() {
  const [items, setItems] = useState<BucketItem[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({
    title: "", category: "EXPERIENCES", status: "NOT_STARTED",
    description: "", notes: "", targetDate: "",
  });

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const res = await fetch("/api/bucketlist");
      const data = await res.json();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function addItem() {
    if (!newItem.title.trim()) return;
    try {
      const res = await fetch("/api/bucketlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      const created = await res.json();
      setItems((prev) => [created, ...prev]);
      setNewItem({ title: "", category: "EXPERIENCES", status: "NOT_STARTED", description: "", notes: "", targetDate: "" });
      setAddOpen(false);
      toast.success("Added to bucket list! 🌟");
    } catch (e) {
      toast.error("Failed to add item");
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await fetch(`/api/bucketlist/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, status } : item));
      if (status === "COMPLETED") toast.success("Bucket list item completed! 🎉🎊");
    } catch (e) {
      toast.error("Failed to update");
    }
  }

  const filtered = items.filter((item) => {
    const matchesCat = filter === "ALL" || item.category === filter;
    const matchesSearch = !search || item.title.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const stats = {
    total: items.length,
    completed: items.filter((i) => i.status === "COMPLETED").length,
    inProgress: items.filter((i) => i.status === "IN_PROGRESS" || i.status === "PLANNED").length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="pt-2 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-forest-800">Bucket List</h1>
          <p className="text-sm text-sage-600/70">
            {stats.completed} of {stats.total} completed
          </p>
        </div>
        <AddButton onClick={() => setAddOpen(true)} label="Add" />
      </div>

      {/* Progress */}
      <div className="bg-gradient-to-br from-terracotta-50 to-amber-50 rounded-2xl p-4 border border-terracotta-200/60">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-terracotta-700">Life Progress</p>
          <span className="text-sm font-bold text-terracotta-600">
            {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
          </span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill bg-terracotta-400"
            style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
          />
        </div>
        <div className="flex gap-4 mt-3 text-xs text-terracotta-600/70">
          <span>✅ {stats.completed} done</span>
          <span>🔄 {stats.inProgress} in progress</span>
          <span>⭐ {stats.total - stats.completed - stats.inProgress} dreaming</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your dreams..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-cream-300 bg-white text-forest-800 text-sm
            focus:outline-none focus:ring-2 focus:ring-sage-400 placeholder:text-sage-400/60"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {CATEGORIES.map((cat) => {
          const config = cat === "ALL" ? null : getBucketCategoryConfig(cat);
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                filter === cat
                  ? "bg-forest-800 text-white"
                  : "bg-white border border-cream-300 text-sage-600 hover:bg-cream-50"
              )}
            >
              {config ? `${config.emoji} ${cat.charAt(0) + cat.slice(1).toLowerCase().replace("_", " ")}` : "All"}
            </button>
          );
        })}
      </div>

      {/* Items List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          emoji="🌍"
          title={search || filter !== "ALL" ? "No matches found" : "Start your bucket list"}
          description={search || filter !== "ALL" ? "Try a different search or filter" : "What do you want to do before you die?"}
          action={!search && filter === "ALL" ? (
            <button onClick={() => setAddOpen(true)} className="px-4 py-2.5 rounded-xl bg-terracotta-500 text-white text-sm font-medium">
              Add your first dream ✨
            </button>
          ) : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item, i) => {
            const config = getBucketCategoryConfig(item.category);
            const done = item.status === "COMPLETED";
            return (
              <div
                key={item.id}
                className={cn(
                  "card animate-slide-up",
                  done && "opacity-70"
                )}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0", config.bg)}>
                    {config.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm font-semibold text-forest-700", done && "line-through text-sage-400/70")}>
                        {item.title}
                      </p>
                      <StatusBadge status={item.status} />
                    </div>
                    {item.description && (
                      <p className="text-xs text-sage-500/70 mt-1 leading-relaxed">{item.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", config.bg, config.color)}>
                        {item.category.charAt(0) + item.category.slice(1).toLowerCase().replace("_", " ")}
                      </span>
                      {item.targetDate && (
                        <span className="text-[10px] text-sage-500/60">
                          🎯 {new Date(item.targetDate).getFullYear()}
                        </span>
                      )}
                    </div>

                    {/* Quick Status Change */}
                    {!done && (
                      <div className="flex gap-2 mt-3">
                        {STATUS_OPTIONS.filter((s) => s.value !== item.status && s.value !== "NOT_STARTED").map((s) => (
                          <button
                            key={s.value}
                            onClick={() => updateStatus(item.id, s.value)}
                            className="text-[10px] px-2.5 py-1.5 rounded-lg border border-cream-300 text-sage-600 hover:bg-cream-50 transition-colors"
                          >
                            Mark {s.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add to Bucket List 🌟">
        <div className="space-y-4">
          <FormInput
            label="Dream / Goal"
            value={newItem.title}
            onChange={(v) => setNewItem({ ...newItem, title: v })}
            placeholder="e.g., Visit Japan during cherry blossom season"
            required
          />
          <FormSelect
            label="Category"
            value={newItem.category}
            onChange={(v) => setNewItem({ ...newItem, category: v })}
            options={CATEGORIES.filter((c) => c !== "ALL").map((c) => {
              const conf = getBucketCategoryConfig(c);
              return { value: c, label: `${conf.emoji} ${c.charAt(0) + c.slice(1).toLowerCase().replace("_", " ")}` };
            })}
          />
          <FormSelect
            label="Status"
            value={newItem.status}
            onChange={(v) => setNewItem({ ...newItem, status: v })}
            options={STATUS_OPTIONS}
          />
          <FormTextarea
            label="Description (optional)"
            value={newItem.description}
            onChange={(v) => setNewItem({ ...newItem, description: v })}
            placeholder="Why does this matter to you? Any details..."
            rows={2}
          />
          <FormInput
            label="Target Date (optional)"
            type="date"
            value={newItem.targetDate}
            onChange={(v) => setNewItem({ ...newItem, targetDate: v })}
          />
          <button
            onClick={addItem}
            className="w-full py-3.5 rounded-xl bg-terracotta-500 text-white font-medium hover:bg-terracotta-600 transition-all"
          >
            Add to List 🌟
          </button>
        </div>
      </Modal>
    </div>
  );
}
