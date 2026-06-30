"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, ClipboardList, MessageCircle, Store, TrendingUp, Wallet, Zap } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { useEmi } from "@/lib/store";
import { cn, formatDate, sortNewestArticles } from "@/lib/utils";

export function PublicHome() {
  const { state } = useEmi();
  const published = sortNewestArticles(state.articles.filter(a => a.status === "Terbit"));
  const complaintWhatsappUrl = "https://wa.me/6282335198661?text=Halo%20EMI%20UMKM%2C%20saya%20ingin%20menyampaikan%20pengaduan.";

  const features = [
    { icon: BarChart3, color: "text-accent", bg: "bg-accent/10 border-accent/20", title: "Laporan Keuangan", desc: "Pantau kas harian, ekspor Excel, dan lihat visual omzet usaha." },
    { icon: ClipboardList, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", title: "Report UMKM", desc: "Buat catatan follow up, evaluasi, dan laporan singkat untuk tiap UMKM." },
    { icon: Store, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", title: "Radar UMKM", desc: "Promosikan usaha lokal dan temukan peluang kolaborasi terdekat." },
  ];

  return (
    <div className="min-h-screen bg-bg text-ink">
      <PublicHeader />

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-accent/[0.08] blur-[130px]" />
          <div className="absolute right-[-120px] top-28 h-72 w-72 rounded-full bg-blue-500/[0.08] blur-[90px]" />

          <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_0.86fr] lg:py-24">
            <div className="max-w-3xl space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-accent">
                <Zap size={12} className="animate-pulse" /> Platform UMKM #1 Indonesia
              </div>

              <div className="space-y-5">
                <h1 className="max-w-4xl text-4xl font-black leading-[1.06] tracking-tight text-ink sm:text-5xl lg:text-7xl">
                  Kelola bisnis Anda <span className="text-shimmer">lebih cerdas.</span>
                </h1>
                <p className="max-w-2xl text-sm font-medium leading-7 text-muted sm:text-lg">
                  Satu workspace privat untuk pencatatan keuangan, report UMKM, promosi toko, dan edukasi bisnis. Gratis dan langsung siap dipakai.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className="btn-primary inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl px-7 text-sm font-black">
                  Mulai Gratis <ArrowRight size={16} />
                </Link>
                <Link href="/login" className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl border border-[rgba(99,179,237,0.15)] px-7 text-sm font-bold text-ink transition-all duration-150 hover:border-[rgba(99,179,237,0.3)] hover:bg-surface-2">
                  Masuk ke Workspace
                </Link>
                <a href={complaintWhatsappUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-7 text-sm font-black text-emerald-300 transition-all duration-150 hover:border-emerald-400/40 hover:bg-emerald-500/15">
                  <MessageCircle size={16} /> Layanan Pengaduan
                </a>
              </div>

              <div className="grid max-w-xl grid-cols-3 gap-3 pt-2">
                {[
                  { value: "100%", label: "Gratis" },
                  { value: "Privat", label: "Data usaha" },
                  { value: "Instan", label: "Tanpa setup" },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl border border-[rgba(99,179,237,0.08)] bg-surface/[0.55] p-4">
                    <div className="text-lg font-black text-accent">{s.value}</div>
                    <div className="mt-1 text-[11px] font-bold text-muted">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-5 rounded-[2rem] bg-accent/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-[1.75rem] border border-[rgba(99,179,237,0.14)] bg-card-gradient p-5 shadow-float">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-accent/70">Preview Workspace</p>
                    <h2 className="mt-1 text-lg font-black text-ink">{state.profile.business}</h2>
                  </div>
                  <div className="grid h-11 w-11 place-items-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
                    <Wallet size={20} />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[rgba(99,179,237,0.1)] bg-bg/[0.55] p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted">Saldo bulan ini</p>
                    <p className="mt-3 text-2xl font-black text-ink">Rp 4,4 jt</p>
                    <p className="mt-2 text-xs font-semibold text-accent">+18% dari pekan lalu</p>
                  </div>
                  <div className="rounded-2xl border border-[rgba(99,179,237,0.1)] bg-bg/[0.55] p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted">Status promosi</p>
                    <p className="mt-3 text-2xl font-black text-ink">Aktif</p>
                    <p className="mt-2 text-xs font-semibold text-muted">Radius {state.profile.promoRadius} km</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-[rgba(99,179,237,0.1)] bg-bg/[0.45] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-xs font-black text-ink">Arus kas ringkas</p>
                    <TrendingUp size={16} className="text-accent" />
                  </div>
                  <div className="flex h-28 items-end gap-2">
                    {[38, 62, 45, 78, 55, 88, 70].map((height, index) => (
                      <div key={index} className="flex flex-1 flex-col justify-end gap-2">
                        <div className="rounded-t-xl bg-accent-gradient" style={{ height: `${height}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:pb-20">
          <div className="grid gap-4 md:grid-cols-3">
            {features.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="card-premium group rounded-2xl p-5 sm:p-6">
                  <div className={cn("mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-200 group-hover:scale-105", f.bg)}>
                    <Icon size={21} className={f.color} />
                  </div>
                  <h3 className="text-base font-black text-ink">{f.title}</h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-muted">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {published.length > 0 && (
          <section id="artikel" className="mx-auto max-w-7xl space-y-7 px-4 pb-24 sm:px-6">
            <div className="section-heading">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[rgba(99,179,237,0.15)] bg-surface-2/50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted">
                  <BookOpen size={11} /> Edukasi Bisnis
                </div>
                <h2 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">Insight terbaru</h2>
              </div>
              <Link href="/login" className="text-xs font-black text-accent hover:underline">
                Tulis cerita Anda -&gt;
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {published.map(a => (
                <Link key={a.id} href={`/artikel/${a.slug}`} className="card-premium group block overflow-hidden rounded-2xl">
                  <div className="relative h-48 overflow-hidden">
                    <img src={a.cover} alt={a.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
                    <span className="absolute left-3 top-3 rounded-lg border border-accent/20 bg-bg/80 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-accent backdrop-blur-sm">
                      {a.category}
                    </span>
                  </div>
                  <div className="space-y-3 p-5">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-dim">{a.readMinutes} menit baca - {formatDate(a.date)}</div>
                    <h3 className="line-clamp-2 text-sm font-black leading-snug text-ink transition-colors duration-150 group-hover:text-accent">{a.title}</h3>
                    <p className="line-clamp-2 text-xs font-medium leading-relaxed text-muted">{a.excerpt}</p>
                    <div className="flex items-center gap-1.5 pt-1 text-xs font-black text-accent">
                      Baca selengkapnya <ArrowRight size={12} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:pb-20">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-emerald-400/15 bg-emerald-500/[0.06] p-6 sm:p-8">
            <div className="absolute right-[-80px] top-[-120px] h-64 w-64 rounded-full bg-emerald-400/[0.12] blur-[80px]" />
            <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-300">
                  <MessageCircle size={11} /> Layanan Pengaduan
                </div>
                <h2 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">Butuh bantuan atau ingin menyampaikan keluhan?</h2>
                <p className="mt-3 text-sm font-medium leading-7 text-muted">
                  Tim EMI UMKM siap menerima masukan dan pengaduan Anda melalui WhatsApp di nomor +62 823-3519-8661.
                </p>
              </div>
              <a href={complaintWhatsappUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-emerald-400 px-7 text-sm font-black text-slate-950 transition-all duration-150 hover:bg-emerald-300">
                Hubungi via WhatsApp <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[rgba(99,179,237,0.06)] py-8 text-center text-xs font-medium text-dim">
        (c) {new Date().getFullYear()} EMI UMKM - Platform bisnis untuk UMKM Indonesia.
      </footer>
    </div>
  );
}