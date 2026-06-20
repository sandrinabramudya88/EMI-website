"use client";

import { KeyboardEvent, useMemo, useState } from "react";
import { AlertTriangle, BarChart3, PieChart, PackageCheck } from "lucide-react";
import { StockItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type ChartMode = "bar" | "pie";

const colors = ["#0f766e", "#2563eb", "#f59e0b", "#e11d48", "#06b6d4", "#7c3aed", "#16a34a", "#db2777"];

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function stockLevel(item: StockItem) {
  if (item.quantity <= item.reorderPoint) return "restock";
  if (item.quantity <= item.reorderPoint * 1.5) return "watch";
  return "safe";
}

export function StockChart({ stocks }: { stocks: StockItem[] }) {
  const [mode, setMode] = useState<ChartMode>("bar");
  const [category, setCategory] = useState("Semua");
  const [selectedId, setSelectedId] = useState<string | null>(stocks[0]?.id ?? null);

  const categories = useMemo(() => {
    return ["Semua", ...Array.from(new Set(stocks.map(item => item.category))).sort()];
  }, [stocks]);

  const rows = useMemo(() => {
    return stocks
      .filter(item => category === "Semua" || item.category === category)
      .sort((a, b) => b.quantity - a.quantity);
  }, [stocks, category]);

  const selected = rows.find(item => item.id === selectedId) ?? rows[0] ?? null;
  const max = Math.max(...rows.map(item => item.quantity), 1);
  const total = rows.reduce((sum, item) => sum + item.quantity, 0);
  const restockCount = rows.filter(item => stockLevel(item) === "restock").length;

  let offset = 25;
  const segments = rows.map((item, index) => {
    const dash = total > 0 ? (item.quantity / total) * 100 : 0;
    const segment = { item, dash, offset, color: colors[index % colors.length] };
    offset -= dash;
    return segment;
  });

  function choose(item: StockItem) {
    setSelectedId(item.id);
  }

  function chooseWithKeyboard(event: KeyboardEvent<SVGCircleElement>, item: StockItem) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choose(item);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1">
            {[
              { value: "bar" as const, label: "Batang", icon: BarChart3 },
              { value: "pie" as const, label: "Pie", icon: PieChart }
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setMode(item.value)}
                  className={cn(
                    "inline-flex min-h-[34px] items-center gap-2 rounded-lg px-3 text-xs font-black transition-all duration-150",
                    mode === item.value ? "bg-teal-650 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <Icon size={14} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <select
            value={category}
            onChange={event => {
              setCategory(event.target.value);
              setSelectedId(null);
            }}
            className="input-dark min-h-[38px] rounded-xl px-3 text-xs font-bold"
          >
            {categories.map(item => (
              <option key={item} value={item}>
                {item === "Semua" ? "Semua Kategori" : item}
              </option>
            ))}
          </select>
        </div>

        {mode === "bar" ? (
          <div className="flex min-h-[300px] items-end gap-3 rounded-2xl border border-slate-100 bg-slate-50/40 px-4 pb-14 pt-6">
            {rows.map((item, index) => {
              const height = Math.max(8, (item.quantity / max) * 100);
              const active = selected?.id === item.id;
              const level = stockLevel(item);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => choose(item)}
                  title={`${item.name}: ${formatNumber(item.quantity)} ${item.unit}`}
                  className="group relative flex h-56 min-w-[54px] flex-1 items-end justify-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60"
                >
                  <span
                    className={cn(
                      "w-full max-w-[64px] rounded-t-xl transition-all duration-300 group-hover:opacity-90",
                      active ? "ring-4 ring-teal-500/20" : "",
                      level === "restock" ? "shadow-lg shadow-rose-500/10" : "shadow-lg shadow-teal-700/10"
                    )}
                    style={{
                      height: `${height}%`,
                      background: colors[index % colors.length]
                    }}
                  />
                  <span className="absolute -top-6 rounded-md bg-white px-2 py-1 text-[10px] font-black text-slate-800 shadow-sm opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                    {formatNumber(item.quantity)} {item.unit}
                  </span>
                  <span className="absolute -bottom-10 line-clamp-2 w-full text-center text-[10px] font-black leading-tight text-slate-500">
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid min-h-[300px] gap-6 rounded-2xl border border-slate-100 bg-slate-50/40 p-5 lg:grid-cols-[240px_minmax(0,1fr)]">
            <div className="relative mx-auto h-56 w-56">
              <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="rgba(148,163,184,0.2)" strokeWidth="6" />
                {segments.map(segment => {
                  const active = selected?.id === segment.item.id;
                  return (
                    <circle
                      key={segment.item.id}
                      cx="21"
                      cy="21"
                      r="15.915"
                      fill="transparent"
                      stroke={segment.color}
                      strokeWidth={active ? "7.5" : "6"}
                      strokeDasharray={`${segment.dash} ${100 - segment.dash}`}
                      strokeDashoffset={segment.offset}
                      className="cursor-pointer transition-all duration-200 hover:opacity-85"
                      role="button"
                      tabIndex={0}
                      onClick={() => choose(segment.item)}
                      onKeyDown={event => chooseWithKeyboard(event, segment.item)}
                    >
                      <title>{`${segment.item.name}: ${formatNumber(segment.item.quantity)} ${segment.item.unit}`}</title>
                    </circle>
                  );
                })}
              </svg>
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Stok</div>
                  <div className="text-2xl font-black text-slate-950">{formatNumber(total)}</div>
                </div>
              </div>
            </div>

            <div className="grid content-center gap-2.5">
              {segments.map(segment => (
                <button
                  key={segment.item.id}
                  type="button"
                  onClick={() => choose(segment.item)}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all duration-150",
                    selected?.id === segment.item.id ? "border-teal-500/40 bg-teal-500/10" : "border-slate-100 bg-white hover:bg-slate-50"
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: segment.color }} />
                    <span className="truncate text-xs font-black text-slate-800">{segment.item.name}</span>
                  </span>
                  <span className="shrink-0 text-xs font-black text-slate-950">
                    {formatNumber(segment.item.quantity)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <aside className="grid gap-3 content-start">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-500/10 text-teal-700">
              <PackageCheck size={18} />
            </span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Item Aktif</p>
              <p className="text-sm font-black text-slate-950">{selected?.name ?? "Tidak ada stok"}</p>
            </div>
          </div>

          {selected ? (
            <dl className="mt-5 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="font-black uppercase tracking-wider text-slate-400">Jumlah</dt>
                <dd className="mt-1 text-lg font-black text-slate-950">{formatNumber(selected.quantity)} {selected.unit}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="font-black uppercase tracking-wider text-slate-400">Minimum</dt>
                <dd className="mt-1 text-lg font-black text-slate-950">{formatNumber(selected.reorderPoint)}</dd>
              </div>
              <div className="col-span-2 rounded-xl bg-slate-50 p-3">
                <dt className="font-black uppercase tracking-wider text-slate-400">Kategori</dt>
                <dd className="mt-1 font-black text-slate-800">{selected.category}</dd>
              </div>
            </dl>
          ) : null}
        </div>

        <div className={cn(
          "rounded-2xl border p-5",
          restockCount > 0 ? "border-rose-200 bg-rose-50/80" : "border-teal-200 bg-teal-50/70"
        )}>
          <div className="flex items-center gap-3">
            <span className={cn(
              "grid h-10 w-10 place-items-center rounded-xl",
              restockCount > 0 ? "bg-rose-500/10 text-rose-700" : "bg-teal-500/10 text-teal-700"
            )}>
              <AlertTriangle size={18} />
            </span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Perlu Restock</p>
              <p className="text-2xl font-black text-slate-950">{restockCount}</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
