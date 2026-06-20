"use client";

import { FormEvent, useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2, X, BookOpenText } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { FieldLabel, Input, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { articleCovers } from "@/lib/mock-data";
import { useEmi } from "@/lib/store";
import { Article, ArticleStatus } from "@/lib/types";
import { estimateReadMinutes, formatDate, slugify, sortNewestArticles, today, uid } from "@/lib/utils";

// Nilai awal default untuk formulir pembuatan artikel baru
const emptyForm = {
  title: "",
  category: "Pengalaman",
  status: "Draft" as ArticleStatus,
  excerpt: "",
  body: ""
};

/**
 * Komponen ArticleManager memfasilitasi penulisan cerita, tips finansial,
 * dan materi edukasi bisnis oleh pelaku UMKM.
 */
export function ArticleManager() {
  const { state, update, notify } = useEmi();
  
  // State lokal editor, pratinjau, filter pencarian
  const [openEditor, setOpenEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [preview, setPreview] = useState<Article | null>(null);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(emptyForm);

  // Memfilter dan mengurutkan daftar artikel dari yang terbaru
  const articles = useMemo(() => {
    const needle = query.toLowerCase();
    return sortNewestArticles(state.articles).filter(item => !needle || item.title.toLowerCase().includes(needle) || item.category.toLowerCase().includes(needle));
  }, [state.articles, query]);

  /**
   * Menampilkan dialog modal Editor untuk membuat artikel baru
   */
  function newArticle() {
    setEditingId(null);
    setForm(emptyForm);
    setOpenEditor(true);
  }

  /**
   * Menampilkan dialog modal Editor dengan data artikel lama untuk diubah
   */
  function editArticle(article: Article) {
    setEditingId(article.id);
    setForm({
      title: article.title,
      category: article.category,
      status: article.status,
      excerpt: article.excerpt,
      body: article.body
    });
    setOpenEditor(true);
  }

  /**
   * Menyimpan perubahan atau membuat artikel baru (Create / Update) ke global store
   */
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      title: form.title.trim(),
      category: form.category,
      excerpt: form.excerpt.trim(),
      body: form.body.trim(),
      status: form.status,
      slug: slugify(form.title),
      readMinutes: estimateReadMinutes(form.body)
    };
    
    if (!payload.title || !payload.excerpt || !payload.body) return;

    update(draft => {
      if (editingId) {
        return {
          ...draft,
          articles: draft.articles.map(item => (item.id === editingId ? { ...item, ...payload } : item))
        };
      }
      const article: Article = {
        id: uid("art"),
        ...payload,
        author: draft.profile.owner,
        date: today(),
        cover: articleCovers[draft.articles.length % articleCovers.length]
      };
      return { ...draft, articles: [article, ...draft.articles] };
    });
    
    notify(editingId ? "Artikel berhasil diperbarui" : "Artikel berhasil diterbitkan");
    setOpenEditor(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  /**
   * Menghapus artikel
   */
  function remove(id: string) {
    update(draft => ({ ...draft, articles: draft.articles.filter(item => item.id !== id) }));
    notify("Artikel berhasil dihapus");
  }

  return (
    <div className="space-y-6">
      {/* Panel Atas Navigasi dan Pencarian */}
      <Card className="border-slate-200/40 bg-white/95 backdrop-blur-md">
        <CardHeader className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">Edukasi & Insight Bisnis</h2>
            <p className="text-xs font-semibold text-slate-400 mt-1">Bagikan pengalaman sukses dan edukasi bagi komunitas.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Pencarian Teks */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <Input className="w-56 pl-9.5 min-h-[38px] rounded-xl text-xs font-bold border-slate-200/80 focus:border-teal-650" value={query} onChange={event => setQuery(event.target.value)} placeholder="Cari artikel edukasi..." />
            </div>
            {/* Tombol Tulis Artikel */}
            <Button onClick={newArticle} className="min-h-[38px] rounded-xl text-xs font-black shadow-md shadow-teal-700/10 active:scale-95 transition-transform duration-100">
              <Plus size={16} /> Tulis Artikel Baru
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Grid Galeri Artikel */}
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {articles.map(article => (
          <Card key={article.id} className="overflow-hidden hover-card bg-white/95 border-slate-200/40 flex flex-col justify-between group">
            {/* Foto Cover dengan overlay gradien */}
            <div className="relative overflow-hidden h-48 shrink-0">
              <img src={article.cover} alt={article.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 z-10">
                <Badge tone="blue" className="bg-white/95 backdrop-blur-md text-blue-800 border-blue-100 shadow-sm font-bold">{article.category}</Badge>
                <Badge tone={article.status === "Terbit" ? "teal" : "amber"} className="bg-white/95 backdrop-blur-md border-slate-100 shadow-sm font-bold">{article.status}</Badge>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent" />
            </div>

            {/* Konten Utama */}
            <CardBody className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{formatDate(article.date)}</span>
                <h3 className="line-clamp-2 text-base font-black leading-snug text-slate-900 group-hover:text-teal-700 transition-colors">{article.title}</h3>
                <p className="line-clamp-3 text-xs font-semibold leading-relaxed text-slate-500">{article.excerpt}</p>
              </div>

              {/* Tombol Tindakan */}
              <div className="flex items-center gap-1.5 border-t border-slate-100/60 pt-4 flex-wrap">
                <Button variant="secondary" className="h-8.5 text-xs font-bold rounded-lg px-3 hover:bg-slate-100" onClick={() => setPreview(article)}>
                  <Eye size={13} /> Baca
                </Button>
                <Button variant="secondary" className="h-8.5 text-xs font-bold rounded-lg px-3 hover:bg-slate-100" onClick={() => editArticle(article)}>
                  <Pencil size={13} /> Edit
                </Button>
                <Button variant="danger" className="h-8.5 text-xs font-black rounded-lg px-3" onClick={() => remove(article.id)}>
                  <Trash2 size={13} /> Hapus
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </section>

      {/* Editor Modal (Tulis / Edit Artikel) */}
      {openEditor ? (
        <Modal title={editingId ? "Ubah Detail Artikel" : "Tulis Artikel Edukasi Baru"} onClose={() => setOpenEditor(false)}>
          <form className="space-y-4" onSubmit={submit}>
            <FieldLabel label="Judul Artikel">
              <Input value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} required placeholder="Misal: Strategi Mengatur Kas Bagi UMKM Kuliner Pemula" className="rounded-xl border-slate-200/80 focus:border-teal-650 font-bold" />
            </FieldLabel>
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldLabel label="Kategori Pembahasan">
                <Select value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} className="rounded-xl border-slate-200/80 focus:border-teal-650 font-semibold">
                  {["Keuangan", "Pengalaman", "Promosi", "Operasional"].map(item => <option key={item}>{item}</option>)}
                </Select>
              </FieldLabel>
              <FieldLabel label="Status Tayang Publik">
                <Select value={form.status} onChange={event => setForm({ ...form, status: event.target.value as ArticleStatus })} className="rounded-xl border-slate-200/80 focus:border-teal-650 font-semibold">
                  <option value="Draft">Draft (Simpan Privat)</option>
                  <option value="Terbit">Terbit (Tampilkan ke Publik)</option>
                </Select>
              </FieldLabel>
            </div>
            <FieldLabel label="Ringkasan Singkat (Excerpt)">
              <Textarea rows={2} value={form.excerpt} onChange={event => setForm({ ...form, excerpt: event.target.value })} required placeholder="Tuliskan rangkuman 1-2 kalimat untuk memancing minat pembaca di beranda utama..." className="rounded-xl border-slate-200/80 focus:border-teal-650 font-semibold" />
            </FieldLabel>
            <FieldLabel label="Konten / Isi Lengkap Artikel">
              <Textarea rows={8} value={form.body} onChange={event => setForm({ ...form, body: event.target.value })} required placeholder="Tuliskan isi cerita, trik bisnis, kisah sukses, atau taktik menaikkan penjualan usaha Anda di sini..." className="rounded-xl border-slate-200/80 focus:border-teal-650 text-xs sm:text-sm font-semibold leading-relaxed" />
            </FieldLabel>
            
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <Button type="button" variant="secondary" className="min-h-[38px] px-4 rounded-xl text-xs font-bold border-slate-200" onClick={() => setOpenEditor(false)}><X size={15} /> Batal</Button>
              <Button type="submit" className="min-h-[38px] px-5 rounded-xl text-xs font-black shadow-md active:scale-95 transition-transform duration-100">
                <BookOpenText size={15} /> Terbitkan Artikel
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}

      {/* Preview Modal (Membaca Artikel Penuh) */}
      {preview ? (
        <Modal title="Pratinjau Artikel Publik" onClose={() => setPreview(null)}>
          <article className="space-y-5 animate-fade-in-up">
            <img src={preview.cover} alt={preview.title} className="h-72 w-full rounded-2xl object-cover border border-slate-100 shadow-sm" />
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="blue" className="font-bold">{preview.category}</Badge>
              <Badge tone={preview.status === "Terbit" ? "teal" : "amber"} className="font-bold">{preview.status}</Badge>
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">&bull; {formatDate(preview.date)} &bull; {preview.readMinutes} menit baca</span>
            </div>
            
            <h2 className="text-2.5xl font-black leading-tight text-slate-900 tracking-tight">{preview.title}</h2>
            
            <div className="rounded-2xl border border-slate-150 bg-slate-50/50 p-4.5 text-xs font-bold leading-relaxed text-slate-600 border-l-4 border-l-indigo-650">
              {preview.excerpt}
            </div>
            
            <div className="whitespace-pre-line text-xs sm:text-sm font-semibold leading-relaxed text-slate-700 pt-2 border-t border-slate-100/80">
              {preview.body}
            </div>
          </article>
        </Modal>
      ) : null}
    </div>
  );
}
