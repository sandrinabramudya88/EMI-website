import { formatCompactCurrency } from "@/lib/utils";

type Series = {
  label: string;  // Label seri data (misal: "Pemasukan", "Pengeluaran")
  color: string;  // Kode warna hex untuk batang grafis
  values: number[]; // Array nominal data per bulan (12 bulan)
};

/**
 * Komponen BarChart (Grafik Batang) murni menggunakan CSS dan HTML Grid.
 * Sangat ringan, cepat dimuat, dan responsif.
 */
export function BarChart({ labels, series }: { labels: string[]; series: Series[] }) {
  // Mencari nilai nominal terbesar untuk skala tinggi batang
  const max = Math.max(...series.flatMap(item => item.values), 1);

  return (
    <div className="flex h-full min-h-[260px] flex-col">
      {/* Legenda Grafik */}
      <div className="mb-4 flex flex-wrap items-center justify-end gap-3 text-xs font-semibold text-slate-500">
        {series.map(item => (
          <span key={item.label} className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
            {item.label}
          </span>
        ))}
      </div>

      {/* Grid Grafik */}
      <div className="grid flex-1 grid-cols-[54px_minmax(0,1fr)] gap-3">
        {/* Label Skala Y (Sisi Kiri) */}
        <div className="flex flex-col justify-between text-right text-[11px] font-semibold text-slate-400">
          <span>{formatCompactCurrency(max)}</span>
          <span>{formatCompactCurrency(max * 0.66)}</span>
          <span>{formatCompactCurrency(max * 0.33)}</span>
          <span>Rp0</span>
        </div>

        {/* Area Batang Grafik */}
        <div className="relative grid grid-cols-6 gap-3 border-b border-l border-slate-200 px-2 pb-8">
          {/* Garis Horizontal Pembantu */}
          <div className="absolute inset-x-0 top-0 border-t border-slate-100/80" />
          <div className="absolute inset-x-0 top-1/3 border-t border-slate-100/80" />
          <div className="absolute inset-x-0 top-2/3 border-t border-slate-100/80" />

          {/* Rendering Batang Per Bulan */}
          {labels.map((label, index) => (
            <div key={label} className="relative flex items-end justify-center gap-1.5 h-full">
              {series.map(item => {
                const val = item.values[index] ?? 0;
                // Menghitung persentase tinggi relatif terhadap nilai max
                const heightPercent = Math.max(3, (val / max) * 100);

                return (
                  <div
                    key={item.label}
                    className="z-10 w-full max-w-[20px] rounded-t-md transition-all duration-300 hover:scale-x-110 hover:opacity-90 origin-bottom"
                    title={`${item.label} ${label}: ${formatCompactCurrency(val)}`}
                    style={{
                      height: `${heightPercent}%`,
                      background: item.color
                    }}
                  />
                );
              })}
              {/* Label Bulan (Sumbu X) */}
              <span className="absolute -bottom-7 text-xs font-bold text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
