"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ClipboardList, ImagePlus, Loader2, MapPin, Pencil, Plus, Search, Trash2, X, Phone, Tag } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { FieldLabel, Input, Textarea } from "@/components/ui/Field";
import { useEmi } from "@/lib/store";
import { Business } from "@/lib/types";
import { searchMatches, uid } from "@/lib/utils";

const emptyForm = {
  name: "",
  category: "",
  distance: "1",
  phone: "",
  promo: "",
  image: "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=900&q=80"
};

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function whatsappUrl(phone: string, businessName: string) {
  const number = phone.replace(/\D/g, "").replace(/^0/, "62");
  const text = encodeURIComponent(`Halo ${businessName}, saya melihat promosi UMKM Anda di EMI.`);
  return number ? `https://wa.me/${number}?text=${text}` : `tel:${phone}`;
}

export function BusinessManager() {
  const { state, update, notify, uploadImage, usingDatabase } = useEmi();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const searchTerm = query.trim();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const rows = state.businesses
    .filter(item =>
      searchMatches(query, [
        item.name,
        item.category,
        item.promo,
        item.phone,
        `${item.distance} km`,
        item.ownerId === state.session.userId ? "milik anda usaha sendiri" : "publik usaha umum"
      ])
    )
    .sort((a, b) => {
      const currentUserId = state.session.userId;
      const aMine = a.ownerId === currentUserId ? 0 : 1;
      const bMine = b.ownerId === currentUserId ? 0 : 1;
      return aMine - bMine || a.distance - b.distance;
    });

  function canManage(item: Business) {
    return !usingDatabase || item.ownerId === state.session.userId || typeof item.ownerId === "undefined";
  }

  function selectImageFile(file: File | null) {
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.split(",").includes(file.type)) {
      notify("Format gambar harus JPG, JPEG, atau PNG.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      notify("Ukuran foto maksimal 5 MB.");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result));
    reader.readAsDataURL(file);
  }

  function edit(item: Business) {
    if (!canManage(item)) {
      notify("Dokumentasi publik hanya bisa dilihat, bukan diedit oleh akun lain.");
      return;
    }

    setEditingId(item.id);
    setForm({
      name: item.name,
      category: item.category,
      distance: String(item.distance),
      phone: item.phone,
      promo: item.promo,
      image: item.image
    });
    setImageFile(null);
    setImagePreview(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancel() {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      const existing = editingId ? state.businesses.find(item => item.id === editingId) : null;
      let image = form.image.trim();
      if (imageFile) image = await uploadImage(imageFile, "businesses");

      const payload: Business = {
        id: editingId ?? uid("biz"),
        name: form.name.trim(),
        category: form.category.trim(),
        distance: Number(form.distance),
        phone: form.phone.trim(),
        promo: form.promo.trim(),
        image,
        ownerId: existing?.ownerId ?? state.session.userId
      };

      if (!payload.name || !payload.category || !payload.phone || !payload.promo || !payload.image) return;

      update(draft => ({
        ...draft,
        businesses: editingId
          ? draft.businesses.map(item => (item.id === editingId ? payload : item))
          : [payload, ...draft.businesses]
      }));

      notify(editingId ? "Dokumentasi usaha berhasil diperbarui" : "Dokumentasi usaha berhasil dibagikan");
      cancel();
    } catch (error) {
      notify(error instanceof Error ? error.message : "Gagal menyimpan data UMKM.");
    } finally {
      setSaving(false);
    }
  }

  function remove(item: Business) {
    if (!canManage(item)) {
      notify("Dokumentasi publik hanya bisa dihapus oleh pemiliknya.");
      return;
    }

    update(draft => ({
      ...draft,
      businesses: draft.businesses.filter(row => row.id !== item.id),
      reportNotes: draft.reportNotes.filter(note => note.businessId !== item.id)
    }));
    notify("Dokumentasi usaha berhasil dihapus");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <Card className="border-slate-200/40 bg-white/95 backdrop-blur-md self-start">
        <CardHeader className="flex items-center justify-between gap-3 p-6 border-b border-slate-100/60">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">{editingId ? "Ubah Dokumentasi Usaha" : "Bagikan Dokumentasi Usaha"}</h2>
            <p className="text-xs font-semibold text-slate-400 mt-1">Tambahkan cerita singkat, kontak, dan foto usaha agar mudah ditemukan.</p>
          </div>
          {editingId ? (
            <Button type="button" variant="secondary" className="min-h-[32px] px-3 text-xs font-bold rounded-lg border-slate-200" onClick={cancel}>
              <X size={13} /> Batal
            </Button>
          ) : (
            <Badge tone="teal" className="px-2.5 py-0.5 rounded-md font-bold"><Plus size={12} /> Dokumentasi</Badge>
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
            <FieldLabel label="Cerita / Dokumentasi Promosi">
              <Textarea rows={3} value={form.promo} onChange={event => setForm({ ...form, promo: event.target.value })} required placeholder="Ceritakan produk, promo, suasana toko, atau dokumentasi kegiatan usaha terbaru." className="rounded-xl border-slate-200/80 focus:border-teal-650" />
            </FieldLabel>
            <FieldLabel label="Tambah Gambar Dokumentasi Usaha">
              <div className="grid gap-3 sm:grid-cols-[128px_minmax(0,1fr)]">
                <img src={imagePreview || form.image} alt="Pratinjau foto UMKM" className="h-24 w-full rounded-xl border border-slate-200/80 object-cover sm:h-full" />
                <div className="space-y-3">
                  <Input value={form.image} onChange={event => setForm({ ...form, image: event.target.value })} required placeholder="https://..." className="rounded-xl border-slate-200/80 focus:border-teal-650" />
                  <label className="flex min-h-[42px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 text-xs font-black text-slate-600 transition-colors hover:border-teal-300 hover:bg-teal-50">
                    <ImagePlus size={15} /> Unggah Foto
                    <input type="file" accept={ACCEPTED_IMAGE_TYPES} className="sr-only" onChange={event => selectImageFile(event.target.files?.[0] ?? null)} />
                  </label>
                </div>
              </div>
            </FieldLabel>
            <Button className="w-full min-h-[46px] rounded-xl text-xs font-black shadow-md shadow-teal-700/10 active:scale-95 transition-transform duration-100" type="submit" disabled={saving}>
              {saving ? <Loader2 size={15} className="animate-spin" /> : null}
              {saving ? "Menyimpan..." : editingId ? "Perbarui Dokumentasi" : "Bagikan Dokumentasi"}
            </Button>
          </form>
        </CardBody>
      </Card>

      <section className="space-y-5">
        <Card className="border-slate-200/40 bg-white/95 backdrop-blur-md">
          <CardHeader className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Dokumentasi Usaha Terbagikan</h2>
              <p className="text-xs font-semibold text-slate-400 mt-1">{searchTerm ? `${rows.length} hasil untuk "${searchTerm}".` : `${rows.length} dokumentasi usaha aktif untuk promosi, kontak, dan report.`}</p>
            </div>
            <div className="relative shrink-0">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <Input className="w-64 pl-9.5 pr-9 min-h-[38px] rounded-xl text-xs font-bold border-slate-200/80 focus:border-teal-650" value={query} onChange={event => setQuery(event.target.value)} placeholder="Cari nama, promo, kontak..." />
              {searchTerm ? (
                <button type="button" aria-label="Bersihkan pencarian" onClick={() => setQuery("")} className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
                  <X size={13} />
                </button>
              ) : null}
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-5 lg:grid-cols-2">
          {state.profile.promoActive ? (
            <Card className="border-teal-200/60 bg-teal-50/40 backdrop-blur-md border-l-4 border-l-teal-650 relative overflow-hidden group">
              <CardBody className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <Badge tone="teal" className="bg-teal-100/60 font-black">Profil Usaha Anda Siap Dibagikan</Badge>
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

          {rows.map(item => {
            const manageable = canManage(item);
            return (
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
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <Badge tone="blue" className="bg-blue-50/80 font-black text-[10px]">{item.distance} km</Badge>
                        <Badge tone={manageable ? "teal" : "slate"} className="font-black text-[10px]">{manageable ? "Milik Anda" : "Publik"}</Badge>
                      </div>
                    </div>
                    <p className="line-clamp-2 text-xs font-semibold leading-relaxed text-slate-500 mt-1" title={item.promo}>{item.promo}</p>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mt-2">
                      <Phone size={12} />
                      <span>{item.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3.5 bg-slate-50/50 border-t border-slate-100/50 flex flex-wrap justify-end gap-2">
                  <a href={whatsappUrl(item.phone, item.name)} target="_blank" rel="noreferrer" className="inline-flex h-8.5 items-center justify-center gap-1.5 rounded-lg border border-emerald-100 bg-white px-3 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50">
                    <Phone size={13} /> Hubungi
                  </a>
                  <Link href={`/dashboard/report?business=${item.id}`} className="inline-flex h-8.5 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100">
                    <ClipboardList size={13} /> Report
                  </Link>
                  {manageable ? (
                    <>
                      <Button variant="secondary" className="h-8.5 text-xs font-bold rounded-lg px-3 hover:bg-slate-100" onClick={() => edit(item)}>
                        <Pencil size={13} /> Edit
                      </Button>
                      <Button variant="danger" className="h-8.5 text-xs font-black rounded-lg px-3" onClick={() => remove(item)}>
                        <Trash2 size={13} /> Hapus
                      </Button>
                    </>
                  ) : null}
                </div>
              </Card>
            );
          })}
          {rows.length === 0 ? (
            <Card className="border-dashed border-slate-200/80 bg-white/80 lg:col-span-2">
              <CardBody className="p-10 text-center">
                <h3 className="text-sm font-black text-slate-800">Dokumentasi tidak ditemukan</h3>
                <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-500">
                  {searchTerm ? `Tidak ada UMKM yang cocok dengan "${searchTerm}".` : "Belum ada dokumentasi usaha yang dibagikan."}
                </p>
              </CardBody>
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}
