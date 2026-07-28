"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  NotebookPen,
  LineChart,
  BookOpen,
  Brain,
  Bell,
  MessageSquare,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

/** Full nav (desktop sidebar) */
const navDesktop = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/log", label: "Log", icon: NotebookPen },
  { href: "/history", label: "History", icon: LineChart },
  { href: "/mind", label: "Mind", icon: Brain },
  { href: "/guides", label: "Guides", icon: BookOpen },
  { href: "/learn", label: "Substances", icon: GraduationCap },
  { href: "/reminders", label: "Reminders", icon: Bell },
  { href: "/chat", label: "AI", icon: MessageSquare },
];

/** Primary mobile bottom nav — Mind as equal pillar */
const navMobile = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/log", label: "Log", icon: NotebookPen },
  { href: "/history", label: "History", icon: LineChart },
  { href: "/mind", label: "Mind", icon: Brain },
  { href: "/guides", label: "Guides", icon: BookOpen },
  { href: "/chat", label: "AI", icon: MessageSquare },
];

export function AppShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName?: string | null;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-[#0b0b0d] text-zinc-100">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r border-white/[0.06] bg-[#0e0e11] md:flex">
        <div className="flex h-14 items-center gap-2.5 border-b border-white/[0.06] px-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-sm font-black text-white">
            F
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold tracking-tight">
              Forge Protocol
            </p>
            <p className="truncate text-[11px] text-zinc-500">
              {userName || "Athlete"}
            </p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
          {navDesktop.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-orange-500/15 text-orange-300"
                    : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/[0.06] p-3">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-200"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0b0b0d]/90 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-sm font-black text-white">
              F
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">
                Forge Protocol
              </p>
              <p className="text-[11px] text-zinc-500">
                {userName || "Athlete"}
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-full p-2 text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="md:pl-56">
        <main className="mx-auto max-w-3xl px-4 pb-28 pt-5 md:px-8 md:pb-10 md:pt-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06] bg-[#0f0f12]/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-6 gap-0.5 px-1 py-2">
          {navMobile.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[10px] font-medium transition",
                  active
                    ? "text-orange-400"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <Icon
                  className={cn("h-5 w-5", active && "stroke-[2.25px]")}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
