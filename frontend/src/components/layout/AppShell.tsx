"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3, BookOpenText, Home, LogOut, Menu,
  MessageSquareText, Moon, Plus, Sprout, Store, Sun, UserRound, X
} from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { useEmi } from "@/lib/store";

const navItems = [
  { href: "/dashboard",            label: "Dashboard",    icon: Home },
  { href: "/dashboard/keuangan",   label: "Keuangan",     icon: BarChart3 },
  { href: "/dashboard/komunitas",  label: "Komunitas",    icon: MessageSquareText },
  { href: "/dashboard/artikel",    label: "Artikel",      icon: BookOpenText },
  { href: "/dashboard/umkm",       label: "UMKM Radar",   icon: Store },
  { href: "/dashboard/profile",    label: "Profil",       icon: UserRound },
];

const titles: Record<string, string> = {
  "/dashboard":           "Dashboard",
  "/dashboard/keuangan":  "Laporan Keuangan",
  "/dashboard/komunitas": "Komunitas Chat",
  "/dashboard/artikel":   "Manajemen Artikel",
  "/dashboard/umkm":      "UMKM Terdekat",
  "/dashboard/profile":   "Profil & Pengaturan",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, ready, currentUser, logout, setTheme } = useEmi();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (ready && !state.session.isLoggedIn) router.replace("/login");
  }, [ready, state.session.isLoggedIn, router]);

  if (!ready || !state.session.isLoggedIn) {
    return (
      <div className="min-h-screen theme-app-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 rounded-2xl bg-accent/20 animate-ping" />
            <div className="relative h-16 w-16 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center">
              <Sprout size={28} className="text-accent animate-float" />
            </div>
          </div>
          <p className="text-muted text-sm font-semibold">Memuat workspace...</p>
        </div>
      </div>
    );
  }

  const pageTitle = titles[pathname] ?? "Workspace";
  const isDark = state.theme !== "light";

  return (
    <div className="min-h-screen theme-app-bg flex bg-[radial-gradient(circle_at_top_right,rgba(0,212,170,0.08),transparent_34rem)]">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col transition-transform duration-300 ease-out lg:translate-x-0",
        "theme-sidebar border-r",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar glow */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />

        {/* Logo */}
        <div className="relative flex h-[72px] items-center gap-3 border-b border-[rgba(99,179,237,0.06)] px-5 theme-soft-border">
          <div className="h-9 w-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
            <Sprout size={18} className="text-accent" />
          </div>
          <div>
            <div className="text-sm font-black text-ink tracking-tight">EMI UMKM</div>
            <div className="text-[10px] font-bold text-accent/60 uppercase tracking-widest">Workspace</div>
          </div>
          <button
            className="ml-auto lg:hidden h-7 w-7 rounded-lg flex items-center justify-center text-muted hover:text-ink transition-colors"
            onClick={() => setOpen(false)}
          >
            <X size={15} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 text-sm font-bold transition-all duration-150",
                  active
                    ? "nav-active text-accent"
                    : "text-muted hover:text-ink hover:bg-surface-2"
                )}
              >
                <Icon size={16} className={active ? "text-accent" : ""} />
                {item.label}
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User card */}
        <div className="border-t border-[rgba(99,179,237,0.06)] p-4 theme-soft-border">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl theme-user-card border">
            <div className="h-8 w-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-xs font-black text-accent flex-shrink-0">
              {initials(state.profile.owner)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black text-ink truncate">{currentUser?.name ?? state.profile.owner}</div>
              <div className="text-[10px] text-muted truncate">{state.profile.business}</div>
            </div>
            <button
              onClick={() => { logout(); router.push("/"); }}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-muted hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 flex-shrink-0"
              title="Keluar"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-[280px]">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b px-4 py-3 theme-header backdrop-blur-xl sm:gap-4 sm:px-6">
          <button
            className="lg:hidden h-9 w-9 rounded-xl border border-[rgba(99,179,237,0.12)] flex items-center justify-center text-muted hover:text-ink transition-colors"
            onClick={() => setOpen(true)}
          >
            <Menu size={16} />
          </button>

          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black uppercase tracking-widest text-accent/70">Workspace EMI UMKM</div>
            <h1 className="truncate text-lg font-black tracking-tight text-ink sm:text-xl">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="grid h-9 w-9 place-items-center rounded-xl border theme-icon-button transition-all duration-150 active:scale-95"
              aria-label={isDark ? "Aktifkan tema terang" : "Aktifkan tema gelap"}
              aria-pressed={isDark}
              title={isDark ? "Tema terang" : "Tema gelap"}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => router.push("/dashboard/keuangan")}
              className="hidden sm:flex btn-primary min-h-[36px] px-4 text-xs gap-2 rounded-xl items-center font-black"
            >
              <Plus size={14} /> Catat Keuangan
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <div className="mx-auto w-full max-w-[1440px] animate-fade-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
