// components/MobileNav.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, CheckSquare, Target, Star, Map } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/weekly", label: "Week", icon: Calendar },
  { href: "/habits", label: "Habits", icon: CheckSquare },
  { href: "/monthly", label: "Month", icon: Target },
  { href: "/yearly", label: "Yearly", icon: Star },
  { href: "/bucketlist", label: "Bucket", icon: Map },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav fixed bottom-0 left-0 right-0 z-50 bg-forest-900/95 backdrop-blur-xl border-t border-white/10"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-stretch h-[68px]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-200 relative",
                active ? "text-sage-400" : "text-white/40"
              )}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-sage-400 rounded-full" />
              )}
              <Icon
                className={cn(
                  "w-5 h-5 transition-all duration-200",
                  active && "scale-110"
                )}
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span className={cn(
                "text-[10px] font-medium tracking-wide",
                active ? "text-sage-400" : "text-white/40"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
