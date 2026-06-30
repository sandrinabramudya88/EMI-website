import { Article, Transaction } from "./types";

/**
 * Menggabungkan nama-nama class CSS secara dinamis berdasarkan kondisi tertentu.
 * Mengabaikan nilai boolean false, null, atau undefined.
 */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Menghasilkan ID acak UUID-valid.
 * Supabase memakai kolom uuid, jadi fallback juga harus berbentuk UUID.
 */
export function uid(prefix = "id") {
  void prefix;
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, char => {
    const random = Math.floor(Math.random() * 16);
    const value = Number(char) ^ (random & (15 >> (Number(char) / 4)));
    return value.toString(16);
  });
}

/**
 * Mengubah string teks menjadi format slug URL (ramah mesin pencari).
 * Mengubah huruf kecil, menghapus karakter non-alfanumerik, dan mengganti spasi menjadi tanda hubung.
 */
export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Menghasilkan inisial nama dari string (maksimal 2 huruf pertama dari nama kata).
 * Digunakan untuk avatar profil visual ketika tidak ada foto.
 */
export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join("")
    .toUpperCase();
}

export function normalizeSearchText(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function searchMatches(query: string, values: unknown[]) {
  const tokens = normalizeSearchText(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return true;

  const haystack = normalizeSearchText(values.join(" "));
  return tokens.every(token => haystack.includes(token));
}

/**
 * Mengembalikan tanggal hari ini dalam format standar ISO lokal YYYY-MM-DD.
 */
export function today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Memformat string tanggal (YYYY-MM-DD) menjadi format bahasa Indonesia yang mudah dibaca (misal: 12 Mei 2026).
 */
export function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

/**
 * Memformat nominal angka menjadi format mata uang Rupiah (IDR) secara penuh (misal: Rp1.500.000).
 */
export function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(value);
}

/**
 * Memformat nominal Rupiah menjadi format ringkas (misal: Rp1,5 jt atau Rp250 rb).
 * Sangat berguna untuk grafik atau tampilan antarmuka yang sempit.
 */
export function formatCompactCurrency(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(1).replace(".", ",")} jt`;
  if (abs >= 1_000) return `Rp${Math.round(value / 1_000)} rb`;
  return formatCurrency(value);
}

/**
 * Mengekstrak string bulan dan tahun dari tanggal (misal: "2026-05-18" menjadi "2026-05").
 * Digunakan untuk pengelompokan filter bulanan transaksi.
 */
export function monthKey(value: string) {
  return value.slice(0, 7);
}

/**
 * Menghitung ringkasan uang (Total Pemasukan, Pengeluaran, dan Saldo Bersih) dari baris transaksi.
 */
export function moneySummary(rows: Transaction[]) {
  const income = rows.filter(item => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expense = rows.filter(item => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  return { income, expense, balance: income - expense };
}

/**
 * Mengestimasi waktu baca sebuah artikel berdasarkan jumlah kata di dalamnya.
 * Menggunakan rata-rata standar kecepatan baca 180 kata per menit.
 */
export function estimateReadMinutes(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

/**
 * Mengurutkan daftar artikel berdasarkan tanggal penayangan terbaru ke terlama.
 */
export function sortNewestArticles(articles: Article[]) {
  return [...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
