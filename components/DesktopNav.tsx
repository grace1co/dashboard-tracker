// components/DesktopNav.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  CalendarDays,
  Target,
  CheckSquare,
  BookOpen,
  Star,
  Map,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/weekly", label: "This Week", icon: Calendar, description: "Tasks & events" },
  { href: "/monthly", label: "Monthly", icon: CalendarDays, description: "Month overview" },
  { href: "/quarterly", label: "Quarterly", icon: Target, description: "Quarter goals" },
  { href: "/habits", label: "Habits", icon: CheckSquare, description: "Daily rituals" },
  { href: "/yearly", label: "Yearly Reset", icon: Star, description: "Big picture" },
  { href: "/bucketlist", label: "Bucket List", icon: Map, description: "Life dreams" },
];

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-forest-900 flex flex-col z-30 shadow-2xl">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sage-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-white text-base leading-tight">
              My Dashboard
            </h1>
            <p className="text-white/40 text-xs">Life, organized.</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                active
                  ? "bg-sage-500/20 text-white"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-colors",
                  active ? "text-sage-400" : "text-white/40 group-hover:text-white/60"
                )}
              />
              <div className="flex-1 min-w-0">
                <div className={cn("text-sm font-medium", active && "text-white")}>
                  {item.label}
                </div>
                <div className="text-xs text-white/30 truncate">{item.description}</div>
              </div>
              {active && (
                <div className="w-1.5 h-1.5 rounded-full bg-sage-400 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-white/10">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-200"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm">Settings</span>
        </Link>
        <div className="mt-3 px-3">
          <p className="text-white/20 text-xs">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>
    </nav>
  );
}
