"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { AlertCircle, ArrowRight, BookOpenText, ImagePlus, Save, Sparkles, Store, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { FieldLabel, Input, Textarea } from "@/components/ui/Field";
import { ArticleManager } from "@/features/articles/ArticleManager";
import { useEmi } from "@/lib/store";
import { cn, formatDate, initials, sortNewestArticles } from "@/lib/utils";


/**
 * Komponen ProfileManager mengelola pengaturan privat data pemilik,
 * nama usaha, kontak, serta penayangan promo digital di radar sekitar.
 */
export function ProfileManager() {
  const { state, update, currentUser, notify, resetDemo } = useEmi();
  const [profile, setProfile] = useState(state.profile);
  const profileArticles = useMemo(() => {
    const currentUserId = state.session.userId;
    return sortNewestArticles(
      state.articles.filter(article => !currentUserId || article.ownerId === currentUserId || typeof article.ownerId === "undefined")
    ).slice(0, 3);
  }, [state.articles, state.session.userId]);

  /**
   * Menyimpan pembaruan profil ke database lokal
   */
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    update(draft => ({
      ...draft,
      profile,
      users: draft.users.map(user => (user.id === draft.session.userId ? { ...user, name: profile.owner } : user))
    }));
    notify("Profil usaha berhasil disimpan");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      {/* Kolom Kiri: Kartu Profil Bisnis Saat Ini */}
      <section className="space-y-4">
        <Card className="border-slate-200/40 bg-white/95 backdrop-blur-md overflow-hidden relative">
          {/* Header Cover Gradien Halus */}
          <div className="h-20 bg-gradient-to-r from-teal-650 via-teal-700 to-indigo-650 opacity-90 relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:10px_10px]" />
          </div>

          <CardBody className="p-6 pt-0 relative space-y-6">
            {/* Foto Avatar Timbul ke Atas */}
            <div className="flex items-end gap-4 -mt-10 relative z-10">
              <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-tr from-teal-400 to-indigo-500 text-xl font-black text-slate-950 shadow-md border-4 border-white select-none">
                {initials(profile.owner)}
              </div>
              <div className="min-w-0 pb-1.5">
                <h2 className="truncate text-lg font-black text-slate-900 tracking-tight leading-none">{profile.owner}</h2>
                <p className="truncate text-xs font-semibold text-slate-400 mt-1.5">{currentUser?.email}</p>
              </div>
            </div>

            {/* List Detail Info Status */}
            <div className="grid gap-3 pt-2">
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400"><Store size={14} /> Usaha Terdaftar</div>
                <p className="font-black text-slate-800 text-sm mt-2">{profile.business}</p>
                <p className="text-[10px] font-bold text-teal-750 uppercase tracking-wide">{profile.category}</p>
              </div>
              
              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400"><UserRound size={14} /> Status Promosi Sekitar</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={cn("h-2 w-2 rounded-full", profile.promoActive ? "bg-emerald-500 animate-ping" : "bg-slate-400")} />
                  <p className="font-black text-slate-800 text-sm">{profile.promoActive ? "Aktif di radar dekat" : "Tidak Ditayangkan"}</p>
                </div>
              </div>
            </div>

            {/* Tombol Reset Workspace */}
            <div className="pt-4 border-t border-slate-100/80">
              <Button 
                variant="secondary" 
                className="w-full text-xs font-bold hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors min-h-[40px] rounded-xl" 
                onClick={() => {
                  if (confirm("Apakah Anda yakin ingin mengosongkan workspace ini? Seluruh data kas, report notes, artikel, dan promosi baru akan terhapus.")) {
                    resetDemo();
                    notify("Workspace berhasil dikosongkan!");
                    window.location.reload();
                  }
                }}
              >
                <AlertCircle size={15} /> Kosongkan Workspace
              </Button>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Kolom Kanan: Formulir Pengaturan Akun & Usaha */}
      <Card className="border-slate-200/40 bg-white/95 backdrop-blur-md">
        <CardHeader className="flex items-center justify-between gap-3 p-6 border-b border-slate-100/60">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">Profil Akun & Kemitraan</h2>
            <p className="text-xs font-semibold text-slate-400 mt-1">Data dipakai untuk penulisan artikel, report mitra, dan peta sekitar.</p>
          </div>
          <Badge tone="teal" className="px-2.5 py-0.5 rounded-md font-bold select-none"><Sparkles size={12} /> Editable</Badge>
        </CardHeader>
        
        <CardBody className="p-6">
          <form className="space-y-4.5" onSubmit={submit}>
            <div className="grid gap-4.5 md:grid-cols-2">
              <FieldLabel label="Nama Lengkap Pemilik">
                <Input value={profile.owner} onChange={event => setProfile({ ...profile, owner: event.target.value })} required placeholder="Contoh: Rina Dwi" className="rounded-xl border-slate-200/80 focus:border-teal-650" />
              </FieldLabel>
              <FieldLabel label="Nama Brand / Toko">
                <Input value={profile.business} onChange={event => setProfile({ ...profile, business: event.target.value })} required placeholder="Misal: Roti Bakar Premium" className="rounded-xl border-slate-200/80 focus:border-teal-650" />
              </FieldLabel>
              <FieldLabel label="Kategori Usaha">
                <Input value={profile.category} onChange={event => setProfile({ ...profile, category: event.target.value })} required placeholder="Kuliner, Jasa, Kerajinan" className="rounded-xl border-slate-200/80 focus:border-teal-650" />
              </FieldLabel>
              <FieldLabel label="Kota / Wilayah">
                <Input value={profile.city} onChange={event => setProfile({ ...profile, city: event.target.value })} required placeholder="Surabaya, Jakarta, Bandung" className="rounded-xl border-slate-200/80 focus:border-teal-650" />
              </FieldLabel>
              <FieldLabel label="Kontak WhatsApp Usaha">
                <Input value={profile.phone} onChange={event => setProfile({ ...profile, phone: event.target.value })} required placeholder="Contoh: 08123456789" className="rounded-xl border-slate-200/80 focus:border-teal-650" />
              </FieldLabel>
              <FieldLabel label="Jangkauan Promosi (Radius km)">
                <Input type="number" min="1" max="25" value={profile.promoRadius} onChange={event => setProfile({ ...profile, promoRadius: Number(event.target.value) })} required placeholder="5" className="rounded-xl border-slate-200/80 focus:border-teal-650" />
              </FieldLabel>
            </div>
            
            <FieldLabel label="Alamat Fisik Lengkap">
              <Input value={profile.address} onChange={event => setProfile({ ...profile, address: event.target.value })} required placeholder="Jalan Menur Pumpungan No. 32, Gubeng, Surabaya" className="rounded-xl border-slate-200/80 focus:border-teal-650" />
            </FieldLabel>
            
            <FieldLabel label="Kalimat Pamflet Promosi Digital">
              <Textarea rows={3} value={profile.promo} onChange={event => setProfile({ ...profile, promo: event.target.value })} required placeholder="Sajikan roti bakar aneka rasa premium dengan selai buah murni buatan lokal..." className="rounded-xl border-slate-200/80 focus:border-teal-650" />
            </FieldLabel>
            
            {/* Toggle checkbox digital promosi */}
            <label className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4.5 cursor-pointer hover:bg-slate-50 transition-colors duration-200 select-none">
              <input
                type="checkbox"
                className="h-5 w-5 accent-teal-650 cursor-pointer rounded border-slate-300"
                checked={profile.promoActive}
                onChange={event => setProfile({ ...profile, promoActive: event.target.checked })}
              />
              <div className="space-y-0.5">
                <span className="block text-xs font-black text-slate-800">Tampilkan Pamflet di Peta Sekitar</span>
                <span className="block text-[10px] font-bold text-slate-450 leading-none">Aktifkan agar pelaku UMKM lokal terdekat bisa melihat tawaran promosi Anda.</span>
              </div>
            </label>
            
            <div className="flex justify-end pt-2 border-t border-slate-100/60">
              <Button type="submit" className="min-h-[46px] px-6 rounded-xl text-xs font-black shadow-md shadow-teal-700/10 active:scale-95 transition-transform duration-100">
                <Save size={15} /> Simpan Pengaturan Profil
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
      </div>

      <section className="space-y-4">
        <Card className="border-slate-200/40 bg-white/95 backdrop-blur-md">
          <CardHeader className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-slate-100/60">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Artikel di Profil Usaha</h2>
              <p className="text-xs font-semibold text-slate-400 mt-1">Artikel terbaru langsung muncul di profil usaha untuk akses cepat.</p>
            </div>
            <Link href="/dashboard/artikel" className="inline-flex min-h-[36px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 transition-colors hover:bg-slate-50">
              <BookOpenText size={14} /> Buka Menu Artikel
            </Link>
          </CardHeader>

          <CardBody className="p-6">
            {profileArticles.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                {profileArticles.map(article => (
                  <div key={article.id} className="overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-50/40">
                    <img src={article.cover} alt={article.title} className="h-36 w-full object-cover" />
                    <div className="space-y-3 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={article.status === "Terbit" ? "teal" : "amber"} className="font-black text-[10px]">{article.status}</Badge>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{formatDate(article.date)}</span>
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="line-clamp-2 text-sm font-black leading-snug text-slate-900">{article.title}</h3>
                        <p className="line-clamp-2 text-xs font-semibold leading-relaxed text-slate-500">{article.excerpt}</p>
                      </div>
                      <Link href={article.status === "Terbit" ? `/artikel/${article.slug}` : "/dashboard/artikel"} className="inline-flex items-center gap-1.5 text-xs font-black text-teal-700 hover:underline">
                        {article.status === "Terbit" ? "Lihat Artikel Publik" : "Lanjutkan Draft"} <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[190px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/40 p-6 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-teal-100 bg-teal-50 text-teal-700">
                  <ImagePlus size={20} />
                </div>
                <h3 className="mt-4 text-sm font-black text-slate-900">Belum ada artikel profil</h3>
                <p className="mt-1 max-w-md text-xs font-semibold leading-relaxed text-slate-500">Tulis artikel pertama dengan foto sampul. Setelah disimpan, artikel langsung tampil di area profil ini.</p>
              </div>
            )}
          </CardBody>
        </Card>

        <ArticleManager />
      </section>
    </div>
  );
}
