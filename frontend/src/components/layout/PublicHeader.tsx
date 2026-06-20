import Link from "next/link";
import { ArrowRight, BookOpen, Sprout } from "lucide-react";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[rgba(99,179,237,0.08)] bg-bg/[0.88] backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-accent/25 bg-accent/10 transition-all duration-200 group-hover:border-accent/50 group-hover:bg-accent/15">
            <Sprout size={18} className="text-accent" />
          </div>
          <div className="leading-none">
            <span className="block text-sm font-black tracking-tight text-ink">EMI UMKM</span>
            <span className="mt-1 hidden text-[9px] font-bold uppercase tracking-widest text-muted sm:block">Platform Bisnis</span>
          </div>
        </Link>

        <nav className="flex items-center gap-2 rounded-2xl border border-[rgba(99,179,237,0.08)] bg-surface/45 p-1">
          <Link
            href="/#artikel"
            className="hidden h-9 items-center gap-2 rounded-xl px-3 text-xs font-bold text-muted transition-all duration-150 hover:bg-surface-2 hover:text-ink sm:flex"
          >
            <BookOpen size={14} /> Artikel
          </Link>
          <Link
            href="/login"
            className="flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-black text-ink transition-all duration-150 hover:bg-surface-2"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="btn-primary flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-black"
          >
            Daftar <ArrowRight size={13} />
          </Link>
        </nav>
      </div>
    </header>
  );
}