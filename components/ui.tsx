"use client";

import { cn, getProgressColor } from "@/lib/utils";
import { Check } from "lucide-react";

// ── Progress Bar ──────────────────────────────────────────
export function ProgressBar({
  value,
  label,
  showPercent = true,
  color,
  className,
}: {
  value: number;
  label?: string;
  showPercent?: boolean;
  color?: string;
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-xs text-muted-foreground font-medium text-sage-700/70">
              {label}
            </span>
          )}
          {showPercent && (
            <span className="text-xs font-semibold text-sage-700">{pct}%</span>
          )}
        </div>
      )}

      <div className="progress-track">
        <div
          className={cn("progress-fill", color || getProgressColor(pct))}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────
const statusMap: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  NOT_STARTED: {
    label: "Not started",
    className: "bg-gray-100 text-gray-600 border border-gray-200",
    dot: "bg-gray-400",
  },
  IN_PROGRESS: {
    label: "In progress",
    className: "bg-blue-50 text-blue-700 border border-blue-200",
    dot: "bg-blue-500",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-sage-50 text-sage-700 border border-sage-200",
    dot: "bg-sage-500",
  },
  OVERDUE: {
    label: "Overdue",
    className: "bg-red-50 text-red-700 border border-red-200",
    dot: "bg-red-500",
  },
  PLANNED: {
    label: "Planned",
    className: "bg-terracotta-50 text-terracotta-700 border border-terracotta-200",
    dot: "bg-terracotta-400",
  },
  PAUSED: {
    label: "Paused",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-400",
  },
  READING: {
    label: "Reading",
    className: "bg-lavender-50 text-lavender-700 border border-lavender-200",
    dot: "bg-lavender-500",
  },
  WANT_TO_READ: {
    label: "Want to read",
    className: "bg-cream-100 text-sage-700 border border-cream-300",
    dot: "bg-cream-400",
  },
  DNF: {
    label: "DNF",
    className: "bg-gray-100 text-gray-500 border border-gray-200",
    dot: "bg-gray-400",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusMap[status] || statusMap.NOT_STARTED;

  return (
    <span className={cn("badge text-[11px]", config.className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", config.dot)} />
      {config.label}
    </span>
  );
}

// ── Checkbox ──────────────────────────────────────────────
export function Checkbox({
  checked,
  onChange,
  color = "#6B9080",
  size = "md",
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  color?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "w-5 h-5 rounded-lg",
    md: "w-7 h-7 rounded-xl",
    lg: "w-8 h-8 rounded-xl",
  };

  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "habit-check transition-all duration-200 focus-visible:ring-2 focus-visible:ring-sage-400",
        sizes[size],
        checked
          ? "border-transparent text-white"
          : "border-cream-300 bg-white hover:border-sage-400"
      )}
      style={checked ? { backgroundColor: color } : {}}
      aria-checked={checked}
      role="checkbox"
    >
      {checked && (
        <Check
          className={cn(size === "sm" ? "w-3 h-3" : "w-4 h-4")}
          strokeWidth={3}
        />
      )}
    </button>
  );
}

// ── Section Header ────────────────────────────────────────
export function SectionHeader({
  title,
  subtitle,
  action,
  emoji,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  emoji?: string;
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="font-display text-xl font-semibold text-forest-800 flex items-center gap-2">
          {emoji && <span>{emoji}</span>}
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-sage-600/70 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────
export function EmptyState({
  emoji,
  title,
  description,
  action,
}: {
  emoji: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="text-4xl mb-3">{emoji}</div>
      <h3 className="font-display font-medium text-forest-700 text-base">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-sage-600/60 mt-1 max-w-[200px]">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── Add Button ────────────────────────────────────────────
export function AddButton({
  onClick,
  label = "Add",
  className,
}: {
  onClick: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "touch-target inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sage-500 text-white text-sm font-medium",
        "active:scale-95 transition-all duration-150 shadow-soft hover:bg-sage-600",
        className
      )}
    >
      <span className="text-lg leading-none">+</span>
      {label}
    </button>
  );
}

// ── Card ──────────────────────────────────────────────────
export function Card({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn("card animate-slide-up", onClick && "card-hover cursor-pointer", className)}
    >
      {children}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────
export function StatCard({
  emoji,
  label,
  value,
  sub,
  color = "bg-sage-50",
}: {
  emoji: string;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className={cn("rounded-2xl p-4 flex flex-col gap-1", color)}>
      <span className="text-2xl">{emoji}</span>
      <div className="text-2xl font-display font-bold text-forest-800 mt-1">
        {value}
      </div>
      <div className="text-xs font-medium text-sage-700">{label}</div>
      {sub && <div className="text-xs text-sage-600/60">{sub}</div>}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full md:max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl animate-slide-up max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-cream-200 sticky top-0 bg-white rounded-t-3xl md:rounded-t-3xl z-10 flex-shrink-0">
          <h3 className="font-display font-semibold text-forest-800 text-lg">
            {title}
          </h3>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-cream-100 flex items-center justify-center text-sage-600 hover:bg-cream-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-5 overflow-y-auto pb-32 md:pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Form Input ────────────────────────────────────────────
export function FormInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  className,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-sm font-medium text-forest-700">
        {label}
        {required && <span className="text-terracotta-500 ml-0.5">*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3.5 py-3 rounded-xl border border-cream-300 bg-white text-forest-800 text-sm
          focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent
          placeholder:text-sage-400/60 transition-all"
      />
    </div>
  );
}

export function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-sm font-medium text-forest-700">{label}</label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3.5 py-3 rounded-xl border border-cream-300 bg-white text-forest-800 text-sm
          focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent
          placeholder:text-sage-400/60 resize-none transition-all"
      />
    </div>
  );
}

export function FormSelect({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-sm font-medium text-forest-700">{label}</label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-3 rounded-xl border border-cream-300 bg-white text-forest-800 text-sm
          focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition-all appearance-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}