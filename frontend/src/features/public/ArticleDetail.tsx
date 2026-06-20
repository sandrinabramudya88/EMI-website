"use client";

import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { useEmi } from "@/lib/store";
import { formatDate } from "@/lib/utils";

/**
 * Komponen ArticleDetail menampilkan artikel secara utuh bagi pengunjung publik.
 * Menyediakan tombol navigasi kembali ke galeri serta banner ajakan mendaftar (CTA).
 */
export function ArticleDetail({ slug }: { slug: string }) {
  const { state } = useEmi();
  // Mencari artikel yang memiliki slug URL yang sesuai dan berstatus "Terbit"
  const article = state.articles.find(item => item.slug === slug && item.status === "Terbit");

  // Penanganan jika artikel tidak ditemukan
  if (!article) {
    return (
      <div className="min-h-screen bg-canvas">
        <PublicHeader />
        <main className="mx-auto grid min-h-[60vh] w-full max-w-3xl place-items-center px-4">
          <Card className="hover-card">
            <CardBody className="space-y-4.5 text-center p-8">
              <h1 className="text-xl font-black text-slate-900">Artikel Tidak Ditemukan</h1>
              <p className="text-xs font-semibold text-slate-500">Maaf, tulisan yang Anda cari mungkin sedang dalam proses peninjauan, diubah statusnya menjadi draft, atau telah dihapus.</p>
              <LinkButton href="/" variant="secondary" className="min-h-[38px] rounded-xl"><ArrowLeft size={16} /> Kembali ke Beranda</LinkButton>
            </CardBody>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas font-sans text-slate-900">
      {/* Header Publik Sticky */}
      <PublicHeader />
      
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        {/* Tombol Kembali dengan Efek Transisi Hover */}
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-xs font-black text-slate-500 hover:text-teal-700 transition-colors">
          <ArrowLeft size={16} /> Kembali ke Galeri
        </Link>
        
        {/* Kontainer Utama Artikel */}
        <Card className="overflow-hidden shadow-lift">
          {/* Gambar Sampul Artikel */}
          <div className="relative h-[280px] w-full sm:h-[400px] overflow-hidden">
            <img src={article.cover} alt={article.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent" />
          </div>
          
          {/* Isi Tulisan Artikel */}
          <CardBody className="mx-auto max-w-3xl space-y-7 py-8 sm:py-10">
            {/* Metadata Artikel */}
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 pb-5">
              <Badge tone="blue">{article.category}</Badge>
              <span className="text-xs font-semibold text-slate-500">
                {formatDate(article.date)} &bull; Ditulis oleh <strong className="text-slate-800 font-bold">{article.author}</strong>
              </span>
              <Badge tone="slate" className="bg-slate-100/60">{article.readMinutes} menit baca</Badge>
            </div>
            
            {/* Judul & Ringkasan */}
            <div className="space-y-4">
              <h1 className="text-2xl font-black leading-snug text-slate-900 sm:text-4xl">{article.title}</h1>
              <p className="text-sm font-bold leading-7 text-teal-800 border-l-4 border-teal-650 pl-4 bg-teal-50/50 py-2.5 pr-2.5 rounded-r-xl">
                {article.excerpt}
              </p>
            </div>
            
            {/* Isi Konten Utama */}
            <div className="whitespace-pre-line text-sm leading-8 text-slate-700 font-medium">
              {article.body}
            </div>
            
            {/* Banner CTA Bawah untuk Mendorong Login */}
            <div className="flex flex-col gap-4 rounded-2xl bg-slate-950 p-6 text-white shadow-soft sm:flex-row sm:items-center sm:justify-between border border-slate-900 mt-10">
              <div className="space-y-1">
                <div className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-emerald-400">Siap Mengelola Usaha Anda?</div>
                <div className="text-xs font-semibold text-slate-400">Catat keuangan harian secara privat dan rapi hari ini juga.</div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <LinkButton href="/login" className="min-h-[38px] px-4 rounded-xl text-xs font-black">
                  <Lock size={14} /> Daftar / Masuk Sekarang
                </LinkButton>
                <LinkButton href="/" variant="secondary" className="min-h-[38px] px-4 rounded-xl bg-white/10 text-white hover:bg-white/15 border-white/10 text-xs font-black">
                  Artikel Lain
                </LinkButton>
              </div>
            </div>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}
