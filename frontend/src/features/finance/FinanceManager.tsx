"use client";

import { FormEvent, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, X, AlertTriangle, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { FieldLabel, Input, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { BarChart } from "@/components/charts/BarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { useEmi } from "@/lib/store";
import { Transaction, TransactionType } from "@/lib/types";
import { cn, formatCurrency, formatDate, moneySummary, monthKey, today, uid } from "@/lib/utils";

// Formulir kosong default untuk inisialisasi input transaksi baru
const emptyForm = {
  date: today(),
  type: "income" as TransactionType,
  category: "",
  amount: "",
  note: ""
};

/**
 * Komponen FinanceManager mengelola pencatatan keuangan (arus kas) UMKM.
 * Menyediakan form pencatatan (CRUD), grafik ringkasan keuangan bulanan dan kategori,
 * pencarian/filter interaktif, serta fitur ekspor laporan ke format Microsoft Excel (.xlsx) dengan SheetJS.
 */
export function FinanceManager() {
  const { state, update, notify } = useEmi();
  
  // State lokal untuk form dan kontrol UI
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null); // Menyimpan ID transaksi yang sedang diedit
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null); // Menyimpan ID transaksi untuk konfirmasi hapus
  const [month, setMonth] = useState("all"); // Filter periode bulan aktif
  const [selectedCategoryTag, setSelectedCategoryTag] = useState("Semua"); // Filter cepat kategori via tag klik
  const [query, setQuery] = useState(""); // Query pencarian kata kunci

  // Mengekstrak daftar bulan unik dari seluruh transaksi untuk opsi filter dropdown
  const months = useMemo(() => {
    return ["all", ...Array.from(new Set(state.transactions.map(item => monthKey(item.date)))).sort().reverse()];
  }, [state.transactions]);

  // Mengekstrak daftar kategori unik untuk tag filter cepat
  const categoryTags = useMemo(() => {
    const list = new Set(state.transactions.map(item => item.category));
    return ["Semua", ...Array.from(list).sort()];
  }, [state.transactions]);

  // Memfilter transaksi berdasarkan kriteria aktif (bulan, tag kategori, dan query pencarian)
  const filtered = useMemo(() => {
    return state.transactions
      .filter(item => month === "all" || monthKey(item.date) === month)
      .filter(item => selectedCategoryTag === "Semua" || item.category === selectedCategoryTag)
      .filter(item => {
        const needle = query.toLowerCase();
        return !needle || item.category.toLowerCase().includes(needle) || item.note.toLowerCase().includes(needle);
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [state.transactions, month, selectedCategoryTag, query]);

  // Kalkulasi total (pemasukan, pengeluaran, saldo bersih) untuk baris yang difilter
  const summary = moneySummary(filtered);

  /**
   * Mengisi form input dengan data transaksi lama untuk proses Edit (Update).
   */
  function fillEdit(item: Transaction) {
    setEditingId(item.id);
    setForm({
      date: item.date,
      type: item.type,
      category: item.category,
      amount: String(item.amount),
      note: item.note
    });
    // Scroll mulus ke bagian atas halaman agar formulir terlihat jelas
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /**
   * Mengosongkan form input dan membatalkan status edit.
   */
  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  /**
   * Menyimpan transaksi baru atau memperbarui transaksi lama ke global store (Create/Update).
   */
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload: Transaction = {
      id: editingId ?? uid("trx"),
      date: form.date,
      type: form.type,
      category: form.category.trim(),
      amount: Number(form.amount),
      note: form.note.trim()
    };
    
    if (!payload.category || !payload.amount) return;

    update(draft => ({
      ...draft,
      transactions: editingId 
        ? draft.transactions.map(item => (item.id === editingId ? payload : item)) 
        : [payload, ...draft.transactions]
    }));
    
    notify(editingId ? "Catatan transaksi diperbarui" : "Catatan transaksi berhasil disimpan");
    cancelEdit();
    setMonth(monthKey(payload.date));
  }

  /**
   * Melakukan aksi hapus transaksi dari database lokal (Delete).
   */
  function confirmRemove() {
    if (!deleteConfirmId) return;
    const targetId = deleteConfirmId;
    update(draft => ({
      ...draft,
      transactions: draft.transactions.filter(item => item.id !== targetId)
    }));
    notify("Transaksi berhasil dihapus");
    setDeleteConfirmId(null);
  }

  /**
   * Mengekspor data keuangan lengkap ke dalam format spreadsheet Excel asli (.xlsx) menggunakan SheetJS.
   * Format Excel didesain rapi dengan 2 sheet (Ringkasan Keuangan & Riwayat Pencatatan Kas).
   */
  function exportExcel() {
    // 1. Membuat file workbook Excel kosong
    const wb = XLSX.utils.book_new();

    // Kalkulasi ringkasan per kategori pengeluaran untuk sheet ringkasan
    const summaryCategoryMap = filtered
      .filter(item => item.type === "expense")
      .reduce<Record<string, number>>((map, item) => {
        map[item.category] = (map[item.category] ?? 0) + item.amount;
        return map;
      }, {});

    // 2. Mendefinisikan baris data untuk SHEET 1 (Ringkasan Bisnis)
    const summaryRows = [
      [{ v: "LAPORAN RINGKASAN KEUANGAN EMI UMKM", t: "s" }],
      [],
      [{ v: "Informasi Usaha", t: "s" }],
      [{ v: "Nama Toko / Usaha:", t: "s" }, { v: state.profile.business, t: "s" }],
      [{ v: "Nama Pemilik:", t: "s" }, { v: state.profile.owner, t: "s" }],
      [{ v: "Kategori Usaha:", t: "s" }, { v: state.profile.category, t: "s" }],
      [{ v: "Alamat Operasional:", t: "s" }, { v: state.profile.address, t: "s" }],
      [{ v: "Tanggal Cetak Laporan:", t: "s" }, { v: formatDate(today()), t: "s" }],
      [],
      [{ v: "METRIK KEUANGAN UTAMA (Rupiah)", t: "s" }, { v: "NOMINAL", t: "s" }],
      [{ v: "Total Pemasukan", t: "s" }, { v: summary.income, t: "n", z: '"Rp"#,##0' }],
      [{ v: "Total Pengeluaran", t: "s" }, { v: summary.expense, t: "n", z: '"Rp"#,##0' }],
      [{ v: "Saldo Kas Bersih", t: "s" }, { v: summary.balance, t: "n", z: '"Rp"#,##0' }],
      [],
      [{ v: "PENGELUARAN BERDASARKAN KATEGORI", t: "s" }, { v: "TOTAL NOMINAL", t: "s" }],
      ...Object.entries(summaryCategoryMap).map(([category, value]) => [
        { v: category, t: "s" },
        { v: value, t: "n", z: '"Rp"#,##0' }
      ])
    ];

    // 3. Mendefinisikan baris data untuk SHEET 2 (Daftar Transaksi Rinci)
    const detailHeaders = [
      { v: "No", t: "s" },
      { v: "Tanggal", t: "s" },
      { v: "Jenis Transaksi", t: "s" },
      { v: "Kategori Kas", t: "s" },
      { v: "Nominal Uang (Rp)", t: "n" },
      { v: "Catatan Keterangan", t: "s" }
    ];

    const detailRows = filtered.map((item, index) => [
      { v: index + 1, t: "n" },
      { v: item.date, t: "s" },
      { v: item.type === "income" ? "Pemasukan" : "Pengeluaran", t: "s" },
      { v: item.category, t: "s" },
      { v: item.amount, t: "n", z: '"Rp"#,##0' },
      { v: item.note || "-", t: "s" }
    ]);

    // Mengonversi Array of Arrays menjadi lembar kerja (Worksheet) SheetJS
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
    const wsDetails = XLSX.utils.aoa_to_sheet([detailHeaders, ...detailRows]);

    /**
     * Fungsi pembantu untuk mengukur panjang teks dan menyesuaikan lebar kolom Excel (Auto-fit)
     */
    const autoFitColumns = (ws: XLSX.WorkSheet) => {
      const ref = ws["!ref"];
      if (!ref) return;
      const range = XLSX.utils.decode_range(ref);
      const cols = [];
      for (let c = range.s.c; c <= range.e.c; c++) {
        let maxLen = 10;
        for (let r = range.s.r; r <= range.e.r; r++) {
          const cell = ws[XLSX.utils.encode_cell({ r, c })];
          if (cell && cell.v !== undefined) {
            let valStr = String(cell.v);
            // Tambahkan padding visual jika cell bertipe angka Rupiah terformat
            if (cell.t === "n" && cell.z) {
              valStr = "Rp " + valStr.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ",00";
            }
            maxLen = Math.max(maxLen, valStr.length);
          }
        }
        cols.push({ wch: maxLen + 3 }); // Tambahkan buffer pixel
      }
      ws["!cols"] = cols;
    };

    // Menerapkan auto-fit kolom ke kedua lembar kerja
    autoFitColumns(wsSummary);
    autoFitColumns(wsDetails);

    // Memasukkan lembar kerja ke dalam dokumen workbook
    XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Keuangan");
    XLSX.utils.book_append_sheet(wb, wsDetails, "Detail Catatan Kas");

    // Menghasilkan nama file ekspor profesional
    const cleanFileName = `Laporan_Keuangan_EMI_UMKM_${state.profile.business.replaceAll(" ", "_")}_${today()}.xlsx`;
    
    // Menulis berkas ke browser dan mengunduhnya
    XLSX.writeFile(wb, cleanFileName);
    notify("Laporan Excel (.xlsx) berhasil diunduh");
  }

  // Menyiapkan data grafik batang historis bulanan (12 bulan)
  const chartLabels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const monthlyIncome = Array(12).fill(0);
  const monthlyExpense = Array(12).fill(0);

  filtered.forEach(item => {
    const index = new Date(item.date).getMonth();
    if (item.type === "income") monthlyIncome[index] += item.amount;
    if (item.type === "expense") monthlyExpense[index] += item.amount;
  });

  // Menyiapkan data grafik donat untuk kategori pengeluaran kotor
  const categoryMap = filtered
    .filter(item => item.type === "expense")
    .reduce<Record<string, number>>((map, item) => {
      map[item.category] = (map[item.category] ?? 0) + item.amount;
      return map;
    }, {});

  const categoryColors = ["#087568", "#3b82f6", "#f59e0b", "#f43f5e", "#06b6d4", "#8b5cf6", "#10b981", "#ec4899"];

  return (
    <div className="space-y-6">
      {/* 1. Barisan Kartu Metrik Keuangan Atas dengan Ambient Glow */}
      <section className="grid gap-5 md:grid-cols-3">
        {[
          { label: "Pemasukan Kas", value: summary.income, tone: "blue" as const, note: "Penerimaan dari omzet penjualan" },
          { label: "Pengeluaran Kas", value: summary.expense, tone: "rose" as const, note: "Belanja modal & biaya operasional" },
          { label: "Saldo Kas Bersih", value: summary.balance, tone: "teal" as const, note: "Selisih bersih (Dana tersimpan)" }
        ].map(item => {
          const glowClass = {
            blue: "hover:shadow-glow-blue border-slate-200/40 text-blue-700",
            rose: "hover:shadow-glow-rose border-slate-200/40 text-rose-600",
            teal: "hover:shadow-glow-teal border-slate-200/40 text-teal-700"
          }[item.tone];

          return (
            <Card key={item.label} className={cn("hover-card bg-white/80 backdrop-blur-md", glowClass)}>
              <CardBody className="p-6 space-y-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{item.label}</span>
                <p className="text-2.5xl font-black tracking-tight leading-none">{formatCurrency(item.value)}</p>
                <p className="text-[10px] font-bold text-slate-400 border-t border-slate-50 pt-2">{item.note}</p>
              </CardBody>
            </Card>
          );
        })}
      </section>

      {/* 2. Grid Form Pencatatan (CRUD) & Grafik Visualisasi */}
      <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        {/* Panel Form Tambah/Edit Transaksi */}
        <Card className="border-slate-200/40 bg-white/95 backdrop-blur-md">
          <CardHeader className="flex items-center justify-between gap-3 p-6 border-b border-slate-100/60">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">{editingId ? "Edit Transaksi" : "Catat Transaksi Baru"}</h2>
              <p className="text-xs font-semibold text-slate-400 mt-1">Input pemasukan & pengeluaran kas toko.</p>
            </div>
            {editingId ? (
              <Button type="button" variant="secondary" className="min-h-[32px] px-3 text-xs font-bold rounded-lg border-slate-200 hover:bg-slate-50" onClick={cancelEdit}>
                <X size={13} /> Batal
              </Button>
            ) : (
              <Badge tone="teal" className="px-2.5 py-0.5 rounded-md font-bold"><Plus size={12} /> Baru</Badge>
            )}
          </CardHeader>
          <CardBody className="p-6">
            <form className="space-y-4" onSubmit={submit}>
              <div className="grid gap-4 grid-cols-2">
                <FieldLabel label="Tanggal">
                  <Input type="date" value={form.date} onChange={event => setForm({ ...form, date: event.target.value })} required className="rounded-xl border-slate-200/80 focus:border-teal-650" />
                </FieldLabel>
                <FieldLabel label="Jenis">
                  <Select value={form.type} onChange={event => setForm({ ...form, type: event.target.value as TransactionType })} className="rounded-xl border-slate-200/80 focus:border-teal-650">
                    <option value="income">Pemasukan (+)</option>
                    <option value="expense">Pengeluaran (-)</option>
                  </Select>
                </FieldLabel>
              </div>
              <FieldLabel label="Kategori Kas">
                <Input 
                  value={form.category} 
                  onChange={event => setForm({ ...form, category: event.target.value })} 
                  required 
                  placeholder="Misal: Penjualan, Bahan Baku, Operasional" 
                  className="rounded-xl border-slate-200/80 focus:border-teal-650"
                />
              </FieldLabel>
              <FieldLabel label="Nominal Uang (Rp)">
                <Input 
                  type="number" 
                  min="1" 
                  value={form.amount} 
                  onChange={event => setForm({ ...form, amount: event.target.value })} 
                  required 
                  placeholder="Contoh: 150000" 
                  className="rounded-xl border-slate-200/80 focus:border-teal-650"
                />
              </FieldLabel>
              <FieldLabel label="Catatan Tambahan">
                <Textarea 
                  rows={3} 
                  value={form.note} 
                  onChange={event => setForm({ ...form, note: event.target.value })} 
                  placeholder="Contoh: Pesanan nasi kotak ibu budi 20 porsi" 
                  className="rounded-xl border-slate-200/80 focus:border-teal-650"
                />
              </FieldLabel>
              <Button className="w-full min-h-[46px] rounded-xl text-xs font-black shadow-md shadow-teal-700/10 active:scale-95 transition-transform duration-100" type="submit">
                {editingId ? "Perbarui Catatan Kas" : "Simpan Catatan Kas"}
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Panel Grafik Visualisasi Keuangan */}
        <Card className="border-slate-200/40 bg-white/95 backdrop-blur-md">
          <CardHeader className="flex flex-wrap items-center justify-between gap-3 p-6 border-b border-slate-100/60">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Diagram Keuangan Dinamis</h2>
              <p className="text-xs font-semibold text-slate-400 mt-1">Visualisasi keuangan menyesuaikan filter periode.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Select className="w-40 min-h-[38px] rounded-xl border-slate-200 text-xs font-bold" value={month} onChange={event => setMonth(event.target.value)}>
                {months.map(item => (
                  <option key={item} value={item}>
                    {item === "all" ? "Semua Bulan" : `Periode ${item}`}
                  </option>
                ))}
              </Select>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              {/* Grafik Batang Bulanan */}
              <div>
                <span className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-wider">Perbandingan Arus Kas Bulanan</span>
                <BarChart
                  labels={chartLabels}
                  series={[
                    { label: "Pemasukan", color: "#087568", values: monthlyIncome },
                    { label: "Pengeluaran", color: "#f43f5e", values: monthlyExpense }
                  ]}
                />
              </div>
              {/* Grafik Donat Kategori Pengeluaran */}
              <div>
                <span className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-wider">Distribusi Kategori Pengeluaran</span>
                {Object.keys(categoryMap).length > 0 ? (
                  <DonutChart
                    slices={Object.entries(categoryMap).map(([label, value], index) => ({
                      label,
                      value,
                      color: categoryColors[index % categoryColors.length]
                    }))}
                  />
                ) : (
                  <div className="flex h-full min-h-[220px] items-center justify-center rounded-2xl bg-slate-50 text-center p-6 border border-dashed border-slate-200">
                    <p className="text-xs font-semibold text-slate-400">Tidak ada pengeluaran terdeteksi dalam filter ini.</p>
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* 3. Panel Tabel Riwayat Transaksi Lengkap */}
      <Card className="border-slate-200/40 bg-white/95 backdrop-blur-md">
        <CardHeader className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-slate-100/60">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">Riwayat Pembukuan Transaksi</h2>
            <p className="text-xs font-semibold text-slate-400 mt-1">{filtered.length} baris pencatatan kas terdaftar.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Input Pencarian Teks */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <Input 
                className="w-56 pl-9.5 min-h-[38px] rounded-xl text-xs font-bold border-slate-200/80 focus:border-teal-650" 
                value={query} 
                onChange={event => setQuery(event.target.value)} 
                placeholder="Cari kategori/catatan..." 
              />
            </div>
            {/* TOMBOL DOWNLOAD EXCEL - DESAIN PREMIUM SANGAT MENCOLOK */}
            <button 
              type="button" 
              onClick={exportExcel}
              className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-650 text-white hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/10 hover:shadow-lg hover:shadow-emerald-600/20 px-4 text-xs font-black transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 border border-emerald-600"
            >
              <FileSpreadsheet size={15} className="text-emerald-100" />
              <span>Ekspor Laporan Excel (.xlsx)</span>
            </button>
          </div>
        </CardHeader>

        {/* Filter Cepat Kategori via Tag Klik */}
        <div className="px-6 py-3.5 border-b border-slate-100/60 flex flex-wrap items-center gap-1.5 scrollbar-thin overflow-x-auto bg-slate-50/20">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-2 select-none">Filter Cepat:</span>
          {categoryTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedCategoryTag(tag)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-black transition-all duration-200 border select-none active:scale-95",
                selectedCategoryTag === tag 
                  ? "bg-teal-650 text-white border-teal-650 shadow-sm shadow-teal-650/15"
                  : "bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Tabel Data Keuangan */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[860px] border-collapse">
            <thead className="bg-slate-50/40 border-b border-slate-100/60 text-left text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Jenis Transaksi</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Nominal Uang</th>
                <th className="px-6 py-4">Catatan/Keterangan</th>
                <th className="px-6 py-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {filtered.map(item => (
                <tr key={item.id} className="bg-white hover:bg-slate-50/30 transition-colors duration-150">
                  <td className="px-6 py-4.5 text-xs font-bold text-slate-500">{formatDate(item.date)}</td>
                  <td className="px-6 py-4.5">
                    <Badge tone={item.type === "income" ? "teal" : "rose"} className="rounded-md px-2.5 py-0.5 font-bold">
                      {item.type === "income" ? "Pemasukan" : "Pengeluaran"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4.5 text-xs font-black text-slate-800">{item.category}</td>
                  <td className={cn("px-6 py-4.5 text-xs font-black tracking-tight", item.type === "income" ? "text-teal-700" : "text-rose-600")}>
                    {item.type === "income" ? "+" : "-"}{formatCurrency(item.amount)}
                  </td>
                  <td className="px-6 py-4.5 text-xs text-slate-500 font-semibold max-w-[280px] truncate" title={item.note}>
                    {item.note || "-"}
                  </td>
                  <td className="px-6 py-4.5 text-right">
                    <div className="inline-flex gap-1.5">
                      <Button variant="secondary" className="h-8.5 w-8.5 px-0 rounded-lg border-slate-200 hover:bg-slate-50" onClick={() => fillEdit(item)} title="Ubah data">
                        <Pencil size={13} className="text-slate-500" />
                      </Button>
                      <Button variant="danger" className="h-8.5 w-8.5 px-0 rounded-lg hover:shadow-md" onClick={() => setDeleteConfirmId(item.id)} title="Hapus data">
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-14 text-xs font-semibold text-slate-400 bg-slate-50/10">
                    Tidak ada catatan transaksi yang sesuai dengan filter pencarian Anda.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 4. MODAL KONFIRMASI HAPUS TRANSAKSI (Sleek UI Tanpa Browser Alert) */}
      {deleteConfirmId ? (
        <Modal title="Konfirmasi Hapus Transaksi" onClose={() => setDeleteConfirmId(null)}>
          <div className="space-y-5">
            <div className="flex items-start gap-4 rounded-2xl bg-rose-50 border border-rose-100 p-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-700">
                <AlertTriangle size={20} />
              </span>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-rose-950">Tindakan Tidak Dapat Dibatalkan</h4>
                <p className="text-xs font-semibold leading-relaxed text-rose-800">
                  Apakah Anda yakin ingin menghapus catatan kas ini? Nominal saldo kas bersih akan secara otomatis disesuaikan dan dikalkulasi ulang setelah penghapusan berhasil.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <Button variant="secondary" className="min-h-[38px] px-4 rounded-xl text-xs font-bold border-slate-200" onClick={() => setDeleteConfirmId(null)}>
                Batal
              </Button>
              <Button variant="danger" className="min-h-[38px] px-4 rounded-xl text-xs font-black bg-rose-600 text-white hover:bg-rose-700 active:scale-95 transition-transform duration-100" onClick={confirmRemove}>
                Ya, Hapus Catatan
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
