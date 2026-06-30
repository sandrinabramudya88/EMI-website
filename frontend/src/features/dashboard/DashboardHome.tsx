"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpenText, Store, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { BarChart } from "@/components/charts/BarChart";
import { StockChart } from "@/components/charts/StockChart";
import { useEmi } from "@/lib/store";
import { cn, formatCompactCurrency, formatCurrency, formatDate, moneySummary, monthKey, sortNewestArticles } from "@/lib/utils";

function MetricCard({ label, value, note, icon: Icon, tone }: {
  label: string;
  value: string;
  note: string;
  icon: typeof Wallet;
  tone: "teal" | "blue" | "amber" | "rose";
}) {
  const toneClass = {
    teal: "bg-teal-500/10 text-teal-700 border-teal-500/20",
    blue: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    amber: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-700 border-rose-500/20"
  }[tone];

  return (
    <Card className="hover-card">
      <CardBody className="flex min-h-[150px] flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</span>
            <p className="truncate text-2xl font-black leading-none tracking-tight text-slate-900">{value}</p>
          </div>
          <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl border", toneClass)}>
            <Icon size={19} />
          </span>
        </div>
        <p className="mt-4 border-t border-slate-200/50 pt-3 text-[11px] font-semibold text-slate-500">{note}</p>
      </CardBody>
    </Card>
  );
}

export function DashboardHome() {
  const { state } = useEmi();
  const summary = moneySummary(state.transactions);
  const latestTransactions = [...state.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  const latestArticles = sortNewestArticles(state.articles.filter(article => article.status === "Terbit")).slice(0, 2);

  const transactionMonths = Array.from(new Set(state.transactions.map(item => monthKey(item.date)))).sort();
  const fallbackMonths = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  });
  const chartMonths = (transactionMonths.length ? transactionMonths : fallbackMonths).slice(-6);
  const labels = chartMonths.map(key => new Intl.DateTimeFormat("id-ID", { month: "short" }).format(new Date(`${key}-01T00:00:00`)));
  const data = chartMonths.map(key => moneySummary(state.transactions.filter(item => monthKey(item.date) === key)));

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-hidden">
          <CardBody className="relative p-6 sm:p-7">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
            <div className="relative max-w-3xl space-y-3">
              <Badge tone="teal" className="w-fit font-black">Workspace aktif</Badge>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Selamat datang, {state.profile.owner}</h2>
              <p className="max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                Pantau kondisi kas, stok, promosi, dan artikel edukasi usaha {state.profile.business} dari satu dashboard yang lebih ringkas.
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Promo aktif</p>
                <h3 className="mt-1 text-base font-black text-slate-900">{state.profile.business}</h3>
              </div>
              <Store size={20} className="text-teal-700" />
            </div>
            <p className="line-clamp-3 text-xs font-semibold leading-6 text-slate-500">{state.profile.promo}</p>
            <LinkButton href="/dashboard/profile" variant="secondary" size="sm" className="w-full rounded-xl font-black">
              Atur Profil <ArrowUpRight size={13} />
            </LinkButton>
          </CardBody>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Saldo Kas Bersih" value={formatCurrency(summary.balance)} note="Akumulasi kas tersimpan" icon={Wallet} tone="teal" />
        <MetricCard label="Total Pemasukan" value={formatCurrency(summary.income)} note={`${state.transactions.filter(item => item.type === "income").length} kali penjualan`} icon={TrendingUp} tone="blue" />
        <MetricCard label="Total Pengeluaran" value={formatCurrency(summary.expense)} note={`${state.transactions.filter(item => item.type === "expense").length} kali operasional`} icon={TrendingDown} tone="rose" />
        <MetricCard label="Artikel Terbit" value={String(state.articles.filter(item => item.status === "Terbit").length)} note="Terbuka sebagai bacaan publik" icon={BookOpenText} tone="amber" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardBody className="flex h-full flex-col">
            <div className="section-heading mb-6">
              <div>
                <h2 className="text-base font-black tracking-tight text-slate-900">Arus Kas Bulanan</h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">Perbandingan pemasukan dan pengeluaran operasional.</p>
              </div>
              <LinkButton href="/dashboard/keuangan" variant="secondary" size="sm" className="rounded-xl font-black">
                Detail <ArrowUpRight size={14} />
              </LinkButton>
            </div>
            <div className="min-h-[260px] flex-1 pt-2">
              <BarChart
                labels={labels}
                series={[
                  { label: "Pemasukan", color: "#0f766e", values: data.map(item => item.income) },
                  { label: "Pengeluaran", color: "#f43f5e", values: data.map(item => item.expense) }
                ]}
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex h-full flex-col">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-black tracking-tight text-slate-900">Aktivitas Terakhir</h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">Catatan kas terbaru.</p>
              </div>
              <Link href="/dashboard/keuangan" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50" title="Laporan Keuangan Lengkap">
                <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {latestTransactions.map(item => (
                <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-slate-50/50 p-3.5 transition-colors hover:bg-slate-50/80">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black text-slate-800">{item.note || item.category}</p>
                    <p className="mt-1 text-[10px] font-bold text-slate-400">{formatDate(item.date)} - {item.category}</p>
                  </div>
                  <span className={cn("shrink-0 rounded-lg border bg-white px-2 py-1 text-xs font-black", item.type === "income" ? "border-teal-100 text-teal-700" : "border-rose-100 text-rose-600")}>
                    {item.type === "income" ? "+" : "-"}{formatCompactCurrency(item.amount)}
                  </span>
                </div>
              ))}
              {latestTransactions.length === 0 ? <div className="py-12 text-center text-xs font-semibold text-slate-400">Belum ada transaksi dicatat.</div> : null}
            </div>
          </CardBody>
        </Card>
      </section>

      <Card>
        <CardBody className="space-y-6">
          <div className="section-heading">
            <div>
              <h2 className="text-base font-black tracking-tight text-slate-900">Diagram Stok Persediaan</h2>
              <p className="mt-1 text-xs font-semibold text-slate-500">Jumlah stok produk, bahan baku, dan kemasan.</p>
            </div>
            <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-600">{state.stocks.length} item stok</span>
          </div>
          <StockChart stocks={state.stocks} />
        </CardBody>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardBody className="space-y-5">
            <div className="section-heading">
              <div>
                <h2 className="text-base font-black tracking-tight text-slate-900">Mitra UMKM Terdekat</h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">Kolaborasi dan bahan baku lokal sekitar.</p>
              </div>
              <LinkButton href="/dashboard/umkm" variant="secondary" size="sm" className="rounded-xl font-black">
                <Store size={14} /> Peta
              </LinkButton>
            </div>

            <div className="space-y-3">
              {state.profile.promoActive ? (
                <div className="rounded-2xl border border-l-4 border-teal-100 border-l-teal-650 bg-teal-50/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black text-slate-900">{state.profile.business}</p>
                      <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-teal-850">{state.profile.category} - Toko Anda</p>
                    </div>
                    <Badge tone="teal" className="font-black">Aktif</Badge>
                  </div>
                  <p className="mt-3 text-xs font-semibold leading-relaxed text-slate-600">{state.profile.promo}</p>
                </div>
              ) : null}

              {state.businesses.slice(0, 3).map(item => (
                <div key={item.id} className="flex gap-4 rounded-2xl border border-slate-200/60 bg-slate-50/50 p-3.5 transition-colors hover:bg-slate-50/80">
                  <img src={item.image} alt={item.name} className="h-16 w-16 shrink-0 rounded-xl border border-slate-100 object-cover" />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs font-black text-slate-900">{item.name}</p>
                      <span className="shrink-0 rounded-lg border border-slate-100 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-400">{item.distance} km</span>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-wider text-teal-700">{item.category}</p>
                    <p className="line-clamp-2 text-xs font-semibold leading-relaxed text-slate-500">{item.promo}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-5">
            <div className="section-heading">
              <div>
                <h2 className="text-base font-black tracking-tight text-slate-900">Edukasi & Insight Bisnis</h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">Artikel edukasi yang tayang ke publik.</p>
              </div>
              <LinkButton href="/dashboard/artikel" variant="indigo" size="sm" className="rounded-xl font-black">Tulis Artikel</LinkButton>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {latestArticles.map(article => (
                <article key={article.id} className="group overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-50/50 transition-colors hover:bg-slate-50/80">
                  <div className="relative h-36 overflow-hidden">
                    <img src={article.cover} alt={article.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute left-3 top-3"><Badge tone="blue" className="bg-white/95 font-bold">{article.category}</Badge></div>
                  </div>
                  <div className="space-y-3 p-4">
                    <h3 className="line-clamp-2 text-xs font-black leading-snug text-slate-900 transition-colors group-hover:text-teal-700">{article.title}</h3>
                    <p className="line-clamp-2 text-[10px] font-semibold leading-relaxed text-slate-500">{article.excerpt}</p>
                  </div>
                </article>
              ))}
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}