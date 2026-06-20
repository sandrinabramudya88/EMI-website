"use client";

import { FormEvent, useState } from "react";
import { MapPin, Pencil, Plus, Search, Trash2, X, Phone, Tag } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { FieldLabel, Input, Textarea } from "@/components/ui/Field";
import { useEmi } from "@/lib/store";
import { Business } from "@/lib/types";
import { uid } from "@/lib/utils";

// Nilai awal formulir promosi usaha baru
const emptyForm = {
  name: "",
  category: "",
  distance: "1",
  phone: "",
  promo: "",
  image: "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=900&q=80"
};

/**
 * Komponen BusinessManager mengelola promosi UMKM di sekitar lokasi pengguna.
 * Menampilkan data peta usaha lokal, radius jarak, kontak WA, serta detail tawaran produk.
 */
export function BusinessManager() {
  const { state, update, notify } = useEmi();
  
  // State lokal formulir input dan query pencarian
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Memfilter & mengurutkan daftar UMKM berdasarkan query dan jarak terdekat
  const rows = state.businesses
    .filter(item => {
      const needle = query.toLowerCase();
      return !needle || item.name.toLowerCase().includes(needle) || item.category.toLowerCase().includes(needle) || item.promo.toLowerCase().includes(needle);
    })
    .sort((a, b) => a.distance - b.distance);

  /**
   * Mengisi form input dengan data UMKM terpilih untuk proses Edit.
   */
  function edit(item: Business) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      category: item.category,
      distance: String(item.distance),
      phone: item.phone,
      promo: item.promo,
      image: item.image
    });
    // Scroll mulus ke atas agar terlihat jelas
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /**
   * Mengosongkan form input promosi
   */
  function cancel() {
    setEditingId(null);
    setForm(emptyForm);
  }

  /**
   * Menyimpan data promosi UMKM (Create / Update) ke global store.
   */
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload: Business = {
      id: editingId ?? uid("biz"),
      name: form.name.trim(),
      category: form.category.trim(),
      distance: Number(form.distance),
      phone: form.phone.trim(),
      promo: form.promo.trim(),
      image: form.image.trim()
    };
    
    update(draft => ({
      ...draft,
      businesses: editingId 
        ? draft.businesses.map(item => (item.id === editingId ? payload : item)) 
        : [payload, ...draft.businesses]
    }));
    
    notify(editingId ? "Promosi UMKM berhasil diperbarui" : "Promosi UMKM berhasil ditambahkan");
    cancel();
  }

  /**
   * Menghapus promosi UMKM dari daftar
   */
  function remove(id: string) {
    update(draft => ({ ...draft, businesses: draft.businesses.filter(item => item.id !== id) }));
    notify("Promosi UMKM berhasil dihapus");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      {/* Panel Form Tambah/Edit Promosi UMKM */}
      <Card className="border-slate-200/40 bg-white/95 backdrop-blur-md self-start">
        <CardHeader className="flex items-center justify-between gap-3 p-6 border-b border-slate-100/60">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">{editingId ? "Ubah Detail Promosi" : "Daftarkan Usaha Baru"}</h2>
            <p className="text-xs font-semibold text-slate-400 mt-1">Buat pamflet digital usaha di peta sekitar.</p>
          </div>
          {editingId ? (
            <Button type="button" variant="secondary" className="min-h-[32px] px-3 text-xs font-bold rounded-lg border-slate-200" onClick={cancel}>
              <X size={13} /> Batal
            </Button>
          ) : (
            <Badge tone="teal" className="px-2.5 py-0.5 rounded-md font-bold"><Plus size={12} /> Promosi</Badge>
          )}
        </CardHeader>
        <CardBody className="p-6">
          <form className="space-y-4" onSubmit={submit}>
            <FieldLabel label="Nama Toko / Usaha">
              <Input value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} required placeholder="Misal: Warung Nasi Padang Sederhana" className="rounded-xl border-slate-200/80 focus:border-teal-650" />
            </FieldLabel>
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldLabel label="Kategori Usaha">
                <Input value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} required placeholder="Kuliner, Jasa, Fashion" className="rounded-xl border-slate-200/80 focus:border-teal-650" />
              </FieldLabel>
              <FieldLabel label="Jarak Operasional (km)">
                <Input type="number" min="0" step="0.1" value={form.distance} onChange={event => setForm({ ...form, distance: event.target.value })} required placeholder="1.5" className="rounded-xl border-slate-200/80 focus:border-teal-650" />
              </FieldLabel>
            </div>
            <FieldLabel label="Nomor Kontak WhatsApp / Telp">
              <Input value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} required placeholder="Contoh: 08123456789" className="rounded-xl border-slate-200/80 focus:border-teal-650" />
            </FieldLabel>
            <FieldLabel label="Kalimat Promosi Produk">
              <Textarea rows={3} value={form.promo} onChange={event => setForm({ ...form, promo: event.target.value })} required placeholder="Sajikan nasi padang rendang sapi murni diskon 20% bagi warga sekitar khusus hari ini!" className="rounded-xl border-slate-200/80 focus:border-teal-650" />
            </FieldLabel>
            <FieldLabel label="URL Foto Banner Usaha">
              <Input value={form.image} onChange={event => setForm({ ...form, image: event.target.value })} required className="rounded-xl border-slate-200/80 focus:border-teal-650" />
            </FieldLabel>
            <Button className="w-full min-h-[46px] rounded-xl text-xs font-black shadow-md shadow-teal-700/10 active:scale-95 transition-transform duration-100" type="submit">
              {editingId ? "Perbarui Detail Promosi" : "Terbitkan Promosi Sekarang"}
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Bagian Galeri Daftar Promosi UMKM Terdekat */}
      <section className="space-y-5">
        {/* Panel Pencarian */}
        <Card className="border-slate-200/40 bg-white/95 backdrop-blur-md">
          <CardHeader className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Mitra Bisnis Sekitar Anda</h2>
              <p className="text-xs font-semibold text-slate-400 mt-1">{rows.length} pelaku usaha lokal aktif radius dekat.</p>
            </div>
            <div className="relative shrink-0">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <Input className="w-60 pl-9.5 min-h-[38px] rounded-xl text-xs font-bold border-slate-200/80 focus:border-teal-650" value={query} onChange={event => setQuery(event.target.value)} placeholder="Cari nama toko/promosi..." />
            </div>
          </CardHeader>
        </Card>

        {/* Grid List Kartu */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* TAMPILAN PROMOSI USAHA SAYA (Jika Aktif) */}
          {state.profile.promoActive ? (
            <Card className="border-teal-200/60 bg-teal-50/40 backdrop-blur-md border-l-4 border-l-teal-650 relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-teal-500/10 to-transparent rounded-bl-full pointer-events-none" />
              <CardBody className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <Badge tone="teal" className="bg-teal-100/60 font-black">Promosi Aktif Toko Anda</Badge>
                    <h3 className="text-base font-black text-slate-900 tracking-tight mt-2.5">{state.profile.business}</h3>
                    <p className="text-[10px] font-bold text-teal-850 uppercase tracking-wider">{state.profile.category} &bull; Radius {state.profile.promoRadius} km</p>
                  </div>
                  <MapPin className="text-teal-700 shrink-0" size={20} />
                </div>
                <p className="text-xs font-semibold leading-relaxed text-slate-650 mt-2">{state.profile.promo}</p>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-teal-850 border-t border-teal-100/30 pt-3">
                  <Phone size={12} /> {state.profile.phone || "Kontak belum diatur"}
                </div>
              </CardBody>
            </Card>
          ) : null}

          {/* DAFTAR PROMOSI EKSTERNAL MITRA UMKM */}
          {rows.map(item => (
            <Card key={item.id} className="overflow-hidden hover-card bg-white/95 border-slate-200/40 relative flex flex-col justify-between">
              <div className="flex gap-4 p-5">
                <img src={item.image} alt={item.name} className="h-28 w-28 shrink-0 rounded-2xl object-cover border border-slate-100 shadow-sm" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-black text-slate-900 tracking-tight">{item.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Tag size={10} className="text-slate-400" />
                        <span className="truncate text-[10px] font-bold text-slate-400 uppercase tracking-wide">{item.category}</span>
                      </div>
                    </div>
                    <Badge tone="blue" className="bg-blue-50/80 font-black text-[10px]">{item.distance} km</Badge>
                  </div>
                  <p className="line-clamp-2 text-xs font-semibold leading-relaxed text-slate-500 mt-1" title={item.promo}>{item.promo}</p>
                  
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mt-2">
                    <Phone size={12} />
                    <span>{item.phone}</span>
                  </div>
                </div>
              </div>

              {/* Tombol Tindakan Panel Bawah */}
              <div className="px-5 py-3.5 bg-slate-50/50 border-t border-slate-100/50 flex justify-end gap-2">
                <Button variant="secondary" className="h-8.5 text-xs font-bold rounded-lg px-3 hover:bg-slate-100" onClick={() => edit(item)}>
                  <Pencil size={13} /> Edit
                </Button>
                <Button variant="danger" className="h-8.5 text-xs font-black rounded-lg px-3" onClick={() => remove(item.id)}>
                  <Trash2 size={13} /> Hapus
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
