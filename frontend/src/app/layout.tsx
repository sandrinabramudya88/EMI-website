import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { EmiProvider } from "@/lib/store";
import "./globals.css";

// Mengonfigurasi font Plus Jakarta Sans agar terintegrasi dengan Next.js
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

// Definisi metadata untuk optimasi SEO aplikasi
export const metadata: Metadata = {
  title: "EMI UMKM - Solusi Pintar Manajemen Usaha",
  description: "Aplikasi pencatatan keuangan, obrolan komunitas, artikel bisnis, dan promosi usaha terdekat untuk pelaku UMKM Indonesia."
};

/**
 * RootLayout merupakan komponen tata letak utama (layout dasar) aplikasi Next.js.
 * Komponen ini membungkus seluruh halaman aplikasi dengan penyedia state global (EmiProvider)
 * serta mengaplikasikan font global Plus Jakarta Sans.
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} scroll-smooth`}>
      <body className="antialiased font-sans">
        {/* Menyediakan akses state global aplikasi menggunakan EmiProvider */}
        <EmiProvider>{children}</EmiProvider>
      </body>
    </html>
  );
}

