// Tipe transaksi keuangan: "income" untuk pemasukan, "expense" untuk pengeluaran.
export type TransactionType = "income" | "expense";

// Status publikasi artikel: "Draft" (belum tayang) atau "Terbit" (tampil di publik).
export type ArticleStatus = "Draft" | "Terbit";

// Tipe obrolan di komunitas: "private" untuk chat japri, "group" untuk chat grup.
export type ChatType = "private" | "group";

// Mode tema antarmuka: "dark" untuk tema gelap dan "light" untuk tema terang.
export type ThemeMode = "dark" | "light";

// Tipe data Pengguna (User) yang terdaftar di aplikasi.
export type User = {
  id: string;        // ID unik pengguna (diawali "user-")
  name: string;      // Nama lengkap pengguna
  email: string;     // Email pengguna untuk autentikasi login
  password: string;  // Kata sandi terenkripsi sederhana / teks biasa untuk demo
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
  id: string;             // ID unik transaksi (diawali "trx-")
  date: string;           // Tanggal transaksi (format YYYY-MM-DD)
  type: TransactionType;  // Jenis transaksi (pemasukan atau pengeluaran)
  category: string;       // Kategori transaksi (misal: Bahan Baku, Penjualan)
  amount: number;         // Nominal uang dalam Rupiah
  note: string;           // Catatan atau keterangan tambahan
};

// Tipe data Stok Produk/Bahan Baku untuk visualisasi persediaan.
export type StockItem = {
  id: string;             // ID unik item stok (diawali "stock-")
  name: string;           // Nama produk atau bahan baku
  category: string;       // Kelompok stok (misal: Produk Jadi, Bahan Baku)
  quantity: number;       // Jumlah stok tersedia
  unit: string;           // Satuan stok (pcs, kg, botol, pack)
  reorderPoint: number;   // Batas minimum stok untuk penanda restock
  updatedAt: string;      // Tanggal stok terakhir diperbarui (YYYY-MM-DD)
};

// Tipe data Artikel yang ditulis oleh pengguna untuk edukasi/promosi.
export type Article = {
  id: string;             // ID unik artikel (diawali "art-")
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
  id: string;        // ID unik usaha lain (diawali "biz-")
  name: string;      // Nama usaha/toko lain
  category: string;  // Kategori usaha lain
  distance: number;  // Jarak usaha lain dari lokasi pengguna (dalam km)
  phone: string;     // Nomor kontak/telepon usaha tersebut
  promo: string;     // Kalimat iklan/promosi usaha tersebut
  image: string;     // URL foto profil usaha tersebut
  ownerId?: string | null;
};

// Tipe data Target Obrolan (Kontak atau Grup) di halaman Komunitas.
export type ChatTarget = {
  id: string;        // ID unik ruang chat (diawali "chat-")
  type: ChatType;    // Tipe chat (pribadi atau group)
  name: string;      // Nama kontak atau nama grup obrolan
  meta: string;      // Keterangan tambahan (misal: "Supplier kemasan", "128 anggota")
  initials: string;  // Inisial 1-2 huruf untuk avatar visual
  color: string;     // Kode warna hex latar belakang avatar
  ownerId?: string | null;
  joinCode?: string | null;
};

// Tipe data Pesan Obrolan di halaman Komunitas.
export type ChatMessage = {
  id: string;        // ID unik pesan (diawali "msg-")
  targetId: string;  // ID chatTarget tujuan pesan dikirim
  from: "me" | "them"; // Menandakan pengirim pesan (saya atau orang lain)
  sender: string;    // Nama lengkap pengirim pesan
  text: string;      // Isi teks pesan
  time: string;      // Waktu kirim pesan (format HH:MM)
  senderId?: string | null;
  createdAt?: string | null;
};

// Tipe data Sesi Login Pengguna saat ini.
export type Session = {
  isLoggedIn: boolean;    // Status apakah pengguna sudah masuk aplikasi
  userId: string | null;  // ID pengguna yang sedang login (null jika belum login)
};

// State Global Aplikasi (EmiState) yang mencakup seluruh database simulasi.
export type EmiState = {
  session: Session;             // Status sesi aktif
  theme: ThemeMode;             // Preferensi tema antarmuka
  users: User[];                // Daftar seluruh akun pengguna terdaftar
  profile: Profile;             // Data profil bisnis pengguna yang sedang masuk
  transactions: Transaction[];   // Riwayat transaksi keuangan pengguna
  stocks: StockItem[];           // Daftar stok produk/bahan baku
  articles: Article[];          // Daftar artikel di platform
  businesses: Business[];       // Daftar pelaku UMKM terdekat
  chatTargets: ChatTarget[];    // Daftar ruang chat di komunitas
  chatMessages: ChatMessage[];  // Riwayat seluruh pesan obrolan
};
