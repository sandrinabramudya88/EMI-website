import { EmiState } from "./types";

// URL gambar sampul placeholder berkualitas tinggi dari Unsplash untuk artikel UMKM
export const articleCovers = [
  "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"
];

// Data inisial default untuk preview aplikasi EMI UMKM
export const defaultState: EmiState = {
  // Status sesi default (belum login)
  session: {
    isLoggedIn: false,
    userId: null
  },
  // Preferensi tema antarmuka default
  theme: "dark",
  // Akun dibuat melalui register/login, bukan kredensial demo bawaan.
  users: [],
  // Data profil usaha default untuk preview publik saat database belum aktif
  profile: {
    owner: "Rina Dwi",
    business: "Dapur Rempah Rina",
    category: "Kuliner Rumahan",
    city: "Bandung",
    address: "Jl. Suka Rasa No. 18, Bandung",
    phone: "0812-7788-4567",
    promo: "Paket nasi bakar dan sambal botol khas Dapur Rina diskon 15% khusus hari ini!",
    promoRadius: 5,
    promoActive: true
  },
  // Data riwayat transaksi keuangan (Arus Kas) inisial
  transactions: [
    { id: "trx-1", date: "2026-05-03", type: "income", category: "Penjualan", amount: 1850000, note: "Pesanan katering makan siang kantor" },
    { id: "trx-2", date: "2026-05-04", type: "expense", category: "Bahan Baku", amount: 620000, note: "Beli ayam potong, cabai rawit, dan beras pandan wangi" },
    { id: "trx-3", date: "2026-05-07", type: "income", category: "Penjualan", amount: 960000, note: "Setoran sambal botol dari reseller Braga" },
    { id: "trx-4", date: "2026-05-09", type: "expense", category: "Operasional", amount: 280000, note: "Refill gas melon 3kg dan beli paper box kemasan" },
    { id: "trx-5", date: "2026-05-13", type: "income", category: "Promosi", amount: 1250000, note: "Pesanan nasi bakar dari promosi UMKM terdekat" },
    { id: "trx-6", date: "2026-05-18", type: "expense", category: "Pemasaran", amount: 350000, note: "Bayar jasa foto produk untuk katalog WA Business" },
    { id: "trx-7", date: "2026-04-22", type: "income", category: "Penjualan", amount: 2450000, note: "Pesanan paket Hampers Lebaran" },
    { id: "trx-8", date: "2026-04-25", type: "expense", category: "Bahan Baku", amount: 810000, note: "Kulakan toples mika dan pita hias hampers" }
  ],
  // Data stok produk dan bahan baku untuk pemantauan persediaan
  stocks: [
    { id: "stock-1", name: "Nasi Bakar Ayam Rempah", category: "Produk Jadi", quantity: 42, unit: "pack", reorderPoint: 20, updatedAt: "2026-05-22" },
    { id: "stock-2", name: "Sambal Botol Original", category: "Produk Jadi", quantity: 76, unit: "botol", reorderPoint: 35, updatedAt: "2026-05-22" },
    { id: "stock-3", name: "Beras Pandan Wangi", category: "Bahan Baku", quantity: 18, unit: "kg", reorderPoint: 25, updatedAt: "2026-05-21" },
    { id: "stock-4", name: "Ayam Potong", category: "Bahan Baku", quantity: 14, unit: "kg", reorderPoint: 12, updatedAt: "2026-05-21" },
    { id: "stock-5", name: "Cabai Rawit", category: "Bahan Baku", quantity: 9, unit: "kg", reorderPoint: 10, updatedAt: "2026-05-20" },
    { id: "stock-6", name: "Paper Box Kemasan", category: "Kemasan", quantity: 128, unit: "pcs", reorderPoint: 50, updatedAt: "2026-05-19" },
    { id: "stock-7", name: "Toples Mika Hampers", category: "Kemasan", quantity: 34, unit: "pcs", reorderPoint: 40, updatedAt: "2026-05-18" }
  ],
  // Daftar artikel inisial yang dapat dibaca di halaman landing publik
  articles: [
    {
      id: "art-1",
      slug: "cara-umkm-menjaga-arus-kas",
      title: "Artikel Terbaru Hari Ini: Cara UMKM Menjaga Arus Kas Tetap Sehat",
      category: "Keuangan",
      excerpt: "Panduan ringkas untuk memisahkan uang usaha, membaca saldo kas riil, dan menghindari pengeluaran yang tidak terkontrol.",
      body: "Bagi pelaku UMKM, menjaga stabilitas arus kas jauh lebih krusial daripada sekadar memikirkan omzet besar yang tampak di kertas. Langkah awal yang paling penting adalah disiplin memisahkan uang pribadi dan uang usaha, meskipun bisnis dijalankan dari rumah. Selalu catat setiap uang masuk dan keluar pada hari yang sama menggunakan sistem pencatatan digital teratur.\n\nEvaluasi pengeluaran bulanan secara periodik. Jika biaya pembelian bahan baku mulai membengkak akibat inflasi, Anda dapat melakukan penyesuaian porsi produk, merundingkan ulang kontrak dengan supplier, atau menaikkan harga jual secara berkala disertai dengan edukasi yang baik ke pelanggan. Dengan pemisahan kas yang disiplin, modal operasional bisnis Anda akan tetap terjaga dan terhindar dari krisis likuiditas harian.",
      author: "Admin EMI",
      date: "2026-05-22",
      status: "Terbit",
      cover: articleCovers[0],
      readMinutes: 3
    },
    {
      id: "art-2",
      slug: "mengatur-stok-saat-pesanan-naik",
      title: "Tips Mengatur Stok Bahan Baku Saat Pesanan Mendadak Naik",
      category: "Pengalaman",
      excerpt: "Catatan praktis mengelola rantai produksi tetap stabil dan rapi saat permintaan dari pelanggan meningkat tajam.",
      body: "Salah satu tantangan terbesar UMKM kuliner adalah mengantisipasi lonjakan pesanan mendadak tanpa menyebabkan bahan baku busuk atau kekurangan stok di tengah produksi. Kunci sukses menghadapinya adalah menerapkan sistem batas stok minimum (safety stock) untuk bahan-bahan kering atau tahan lama.\n\nJalinlah hubungan erat dengan beberapa supplier cadangan di pasar lokal sehingga Anda memiliki opsi alternatif jika supplier utama kehabisan barang. Selain itu, pastikan untuk selalu mencatat histori pemesanan harian agar Anda dapat memprediksi siklus permintaan mingguan dengan lebih akurat dan terencana.",
      author: "Rina Dwi",
      date: "2026-05-10",
      status: "Terbit",
      cover: articleCovers[1],
      readMinutes: 2
    },
    {
      id: "art-3",
      slug: "foto-produk-sederhana-untuk-menu-rumahan",
      title: "Panduan Foto Produk Sederhana Agar Jualan Rumahan Laris Manis",
      category: "Promosi",
      excerpt: "Manfaatkan pencahayaan natural di dekat jendela, latar belakang minimalis, dan tata letak estetik untuk menarik pembeli.",
      body: "Tampilan visual menu makanan memegang peranan 80% dalam keputusan pembelian pelanggan secara online. Anda tidak memerlukan kamera DSLR mahal untuk memulainya; kamera smartphone saat ini sudah lebih dari cukup.\n\nCarilah area di dekat jendela rumah untuk mendapatkan cahaya alami matahari pagi (soft light) yang tidak membuat bayangan terlalu keras. Gunakan latar belakang sederhana berwarna netral seperti putih polos atau motif kayu agar fokus mata calon pembeli sepenuhnya tertuju pada detail kelezatan makanan Anda. Lakukan pengambilan foto dari beberapa sudut (angle) menarik seperti 45 derajat (eye-level) atau dari atas (flat lay) untuk variasi menu.",
      author: "Admin Komunitas",
      date: "2026-05-15",
      status: "Terbit",
      cover: articleCovers[2],
      readMinutes: 2
    }
  ],
  // Daftar pelaku UMKM sekitar (simulasi geolokasi terdekat)
  businesses: [
    {
      id: "biz-1",
      name: "Kopi Sudut Braga",
      category: "Minuman",
      distance: 1.2,
      phone: "0812-1000-2233",
      promo: "Paket kopi susu literan untuk reseller UMKM diskon 20%",
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80"
    },
    {
      id: "biz-2",
      name: "Batik Lestari Bandung",
      category: "Fashion",
      distance: 2.4,
      phone: "0813-7788-2010",
      promo: "Batik cap tulis katun prima diskon Rp15.000 untuk seragam usaha",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80"
    },
    {
      id: "biz-3",
      name: "Kebun Sayur Mang Asep",
      category: "Bahan Baku",
      distance: 3.1,
      phone: "0821-5530-8890",
      promo: "Sayur mayur organik segar antar gratis ongkir untuk usaha katering Bandung",
      image: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=900&q=80"
    }
  ],
  // Daftar catatan report awal untuk masing-masing UMKM terdekat
  reportNotes: [
    {
      id: "note-1",
      businessId: "biz-1",
      title: "Follow up paket reseller kopi literan",
      body: "Kopi Sudut Braga membuka peluang paket reseller untuk menu minuman bundling. Perlu cek harga grosir, minimum order, dan jadwal pengiriman untuk area Bandung.",
      status: "Perlu Follow Up",
      priority: "Tinggi",
      createdAt: "2026-05-20",
      updatedAt: "2026-05-22",
      author: "Rina Dwi"
    },
    {
      id: "note-2",
      businessId: "biz-1",
      title: "Kualitas foto katalog sudah bagus",
      body: "Foto produk mereka terang dan konsisten. Bisa jadi referensi format foto promo Dapur Rina untuk katalog WhatsApp Business bulan depan.",
      status: "Selesai",
      priority: "Rendah",
      createdAt: "2026-05-18",
      updatedAt: "2026-05-18",
      author: "Rina Dwi"
    },
    {
      id: "note-3",
      businessId: "biz-2",
      title: "Potensi seragam usaha untuk event bazar",
      body: "Batik Lestari menawarkan diskon seragam usaha. Simpan untuk kebutuhan event bazar atau hampers korporat, terutama jika ada pesanan tim besar.",
      status: "Draft",
      priority: "Sedang",
      createdAt: "2026-05-21",
      updatedAt: "2026-05-21",
      author: "Rina Dwi"
    },
    {
      id: "note-4",
      businessId: "biz-3",
      title: "Cek pasokan sayur organik mingguan",
      body: "Perlu tanyakan ketersediaan cabai rawit dan daun pisang untuk menu nasi bakar. Jika stabil, bisa dipakai sebagai supplier cadangan bahan segar.",
      status: "Perlu Follow Up",
      priority: "Sedang",
      createdAt: "2026-05-19",
      updatedAt: "2026-05-22",
      author: "Rina Dwi"
    }
  ],
  // Riwayat download/ekspor laporan workspace
  exportLogs: []
};
