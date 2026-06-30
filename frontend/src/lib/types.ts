// Tipe transaksi keuangan: "income" untuk pemasukan, "expense" untuk pengeluaran.
export type TransactionType = "income" | "expense";

// Status publikasi artikel: "Draft" (belum tayang) atau "Terbit" (tampil di publik).
export type ArticleStatus = "Draft" | "Terbit";

// Status catatan report untuk tiap UMKM.
export type ReportStatus = "Draft" | "Perlu Follow Up" | "Selesai";

// Prioritas catatan report untuk membantu tindak lanjut.
export type ReportPriority = "Rendah" | "Sedang" | "Tinggi";

// Mode tema antarmuka: "dark" untuk tema gelap dan "light" untuk tema terang.
export type ThemeMode = "dark" | "light";

// Tipe data Pengguna (User) yang terdaftar di aplikasi.
export type User = {
  id: string;        // ID unik pengguna
  name: string;      // Nama lengkap pengguna
  email: string;     // Email pengguna untuk autentikasi login
  password: string;  // Dipakai hanya untuk mode demo lokal tanpa Supabase
};

// Tipe data Profil Bisnis/Usaha UMKM milik pengguna.
export type Profile = {
  owner: string;        // Nama pemilik usaha
  business: string;     // Nama bisnis / nama toko
  category: string;     // Kategori bisnis (misal: Kuliner, Fashion)
  city: string;         // Kota lokasi operasional bisnis
  address: string;      // Alamat fisik lengkap bisnis
  phone: string;        // Nomor telepon / WA aktif
  promo: string;        // Deskripsi kalimat promosi / iklan bisnis
  promoRadius: number;  // Radius jangkauan promosi dalam kilometer
  promoActive: boolean; // Menandakan apakah promosi aktif di peta/daftar terdekat
};

// Tipe data Transaksi Keuangan (Arus Kas).
export type Transaction = {
  id: string;             // ID unik transaksi
  date: string;           // Tanggal transaksi (format YYYY-MM-DD)
  type: TransactionType;  // Jenis transaksi (pemasukan atau pengeluaran)
  category: string;       // Kategori transaksi (misal: Bahan Baku, Penjualan)
  amount: number;         // Nominal uang dalam Rupiah
  note: string;           // Catatan atau keterangan tambahan
  ownerId?: string | null;
};

// Tipe data Stok Produk/Bahan Baku untuk visualisasi persediaan.
export type StockItem = {
  id: string;             // ID unik item stok
  name: string;           // Nama produk atau bahan baku
  category: string;       // Kelompok stok (misal: Produk Jadi, Bahan Baku)
  quantity: number;       // Jumlah stok tersedia
  unit: string;           // Satuan stok (pcs, kg, botol, pack)
  reorderPoint: number;   // Batas minimum stok untuk penanda restock
  updatedAt: string;      // Tanggal stok terakhir diperbarui (YYYY-MM-DD)
  ownerId?: string | null;
};

// Tipe data Artikel yang ditulis oleh pengguna untuk edukasi/promosi.
export type Article = {
  id: string;             // ID unik artikel
  slug: string;           // Slug URL artikel (URL-friendly dari judul)
  title: string;          // Judul utama artikel
  category: string;       // Kategori artikel (misal: Keuangan, Pengalaman)
  excerpt: string;        // Ringkasan singkat artikel (1-2 kalimat)
  body: string;           // Isi lengkap tulisan artikel
  author: string;         // Nama penulis artikel
  date: string;           // Tanggal penayangan artikel (YYYY-MM-DD)
  status: ArticleStatus;  // Status artikel (Draft atau Terbit)
  cover: string;          // URL gambar sampul artikel
  readMinutes: number;    // Estimasi lama membaca dalam menit
  ownerId?: string | null;
};

// Tipe data Usaha Lain (UMKM Terdekat) untuk simulasi kolaborasi.
export type Business = {
  id: string;        // ID unik usaha lain
  name: string;      // Nama usaha/toko lain
  category: string;  // Kategori usaha lain
  distance: number;  // Jarak usaha lain dari lokasi pengguna (dalam km)
  phone: string;     // Nomor kontak/telepon usaha tersebut
  promo: string;     // Kalimat iklan/promosi usaha tersebut
  image: string;     // URL foto profil usaha tersebut
  ownerId?: string | null;
};

// Tipe data catatan report yang dibuat untuk masing-masing UMKM.
export type ReportNote = {
  id: string;                 // ID unik catatan
  businessId: string;         // ID UMKM tujuan catatan
  title: string;              // Judul ringkas catatan
  body: string;               // Isi detail report atau notes
  status: ReportStatus;       // Status tindak lanjut catatan
  priority: ReportPriority;   // Prioritas catatan
  createdAt: string;          // Tanggal dibuat (YYYY-MM-DD)
  updatedAt: string;          // Tanggal terakhir diperbarui (YYYY-MM-DD)
  author: string;             // Nama pembuat catatan
  ownerId?: string | null;
};

// Tipe log ekspor/download laporan dari workspace UMKM.
export type ExportLog = {
  id: string;
  type: "finance_excel";
  fileName: string;
  createdAt: string;
  ownerId?: string | null;
};

// Tipe data Sesi Login Pengguna saat ini.
export type Session = {
  isLoggedIn: boolean;    // Status apakah pengguna sudah masuk aplikasi
  userId: string | null;  // ID pengguna yang sedang login (null jika belum login)
};

// State Global Aplikasi (EmiState) yang mencakup seluruh database workspace UMKM.
export type EmiState = {
  session: Session;             // Status sesi aktif
  theme: ThemeMode;             // Preferensi tema antarmuka
  users: User[];                // Daftar akun pada mode demo lokal / user aktif Supabase
  profile: Profile;             // Data profil bisnis pengguna yang sedang masuk
  transactions: Transaction[];   // Riwayat transaksi keuangan pengguna
  stocks: StockItem[];           // Daftar stok produk/bahan baku
  articles: Article[];          // Daftar artikel milik workspace aktif
  businesses: Business[];       // Daftar pelaku UMKM yang dicatat workspace aktif
  reportNotes: ReportNote[];    // Daftar catatan report per UMKM
  exportLogs: ExportLog[];      // Riwayat ekspor/download laporan
};