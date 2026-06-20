import { formatCompactCurrency } from "@/lib/utils";

type Slice = {
  label: string;  // Label segmen (misal: "Bahan Baku", "Pemasaran")
  value: number;  // Nominal transaksi kategori tersebut
  color: string;  // Kode warna hex segmen
};

/**
 * Komponen DonutChart (Grafik Donat) menggunakan SVG murni.
 * Sangat presisi, ringan, dan responsif.
 */
export function DonutChart({ slices }: { slices: Slice[] }) {
  // Menghitung total nilai pengeluaran untuk pembagian segmen
  const total = slices.reduce((sum, item) => sum + item.value, 0) || 1;
  let offset = 25; // Offset inisial lingkaran (start dari jam 12)

  // Memetakan potongan (slices) menjadi segmen dasharray SVG
  const segments = slices.map(item => {
    const dash = (item.value / total) * 100;
    const segment = { ...item, dash, offset };
    offset -= dash; // Menggeser offset untuk segmen berikutnya
    return segment;
  });

  return (
    <div className="grid h-full min-h-[260px] place-items-center gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
      {/* Grafik Donat Lingkaran SVG */}
      <div className="relative h-48 w-48 transition-transform duration-300 hover:scale-105">
        <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90">
          {/* Lingkaran Dasar Abu-Abu */}
          <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
          
          {/* Segmen Data Kategori */}
          {segments.map(item => (
            <circle
              key={item.label}
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              stroke={item.color}
              strokeWidth="6"
              strokeDasharray={`${item.dash} ${100 - item.dash}`}
              strokeDashoffset={item.offset}
              className="transition-all duration-300 hover:stroke-[7.5]"
            >
              <title>{`${item.label}: ${formatCompactCurrency(item.value)}`}</title>
            </circle>
          ))}
        </svg>
        {/* Label Total di Tengah Donat */}
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-slate-400">Total</div>
            <div className="text-lg font-black text-slate-950">{formatCompactCurrency(total)}</div>
          </div>
        </div>
      </div>

      {/* Legenda Keterangan Kategori */}
      <div className="w-full space-y-2.5">
        {slices.map(item => (
          <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2 hover:bg-slate-100/50 transition-colors duration-200">
            <span className="inline-flex items-center gap-2.5 text-sm font-bold text-slate-700">
              <span className="h-3 w-3 rounded-full shrink-0" style={{ background: item.color }} />
              <span className="truncate max-w-[120px]">{item.label}</span>
            </span>
            <span className="text-sm font-black text-slate-950 shrink-0">{formatCompactCurrency(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
