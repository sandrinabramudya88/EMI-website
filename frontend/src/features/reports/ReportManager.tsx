"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  StickyNote,
  Trash2,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel, Input, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useEmi } from "@/lib/store";
import { ReportNote, ReportPriority, ReportStatus } from "@/lib/types";
import { cn, formatDate, searchMatches, uid } from "@/lib/utils";

type NoteForm = {
  id?: string;
  businessId: string;
  title: string;
  body: string;
  status: ReportStatus;
  priority: ReportPriority;
};

const statusOptions: ReportStatus[] = ["Draft", "Perlu Follow Up", "Selesai"];
const priorityOptions: ReportPriority[] = ["Rendah", "Sedang", "Tinggi"];

function emptyNoteForm(businessId: string): NoteForm {
  return {
    businessId,
    title: "",
    body: "",
    status: "Draft",
    priority: "Sedang"
  };
}

function statusTone(status: ReportStatus) {
  if (status === "Selesai") return "teal" as const;
  if (status === "Perlu Follow Up") return "amber" as const;
  return "slate" as const;
}

function priorityTone(priority: ReportPriority) {
  if (priority === "Tinggi") return "rose" as const;
  if (priority === "Sedang") return "blue" as const;
  return "slate" as const;
}

export function ReportManager() {
  const { state, update, notify } = useEmi();
  const [search, setSearch] = useState("");
  const searchTerm = search.trim();
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [noteForm, setNoteForm] = useState<NoteForm | null>(null);
  const queryTargetAppliedRef = useRef(false);


  useEffect(() => {
    const targetBusinessId = new URLSearchParams(window.location.search).get("business");
    if (!queryTargetAppliedRef.current && targetBusinessId && state.businesses.some(item => item.id === targetBusinessId)) {
      queryTargetAppliedRef.current = true;
      setSelectedBusinessId(targetBusinessId);
      return;
    }

    if (!selectedBusinessId && state.businesses[0]) {
      setSelectedBusinessId(state.businesses[0].id);
    }
  }, [selectedBusinessId, state.businesses]);
  const filteredBusinesses = useMemo(() => {
    return state.businesses.filter(item => {
      const notes = state.reportNotes.filter(note => note.businessId === item.id);
      return searchMatches(search, [
        item.name,
        item.category,
        item.phone,
        item.promo,
        `${item.distance} km`,
        ...notes.flatMap(note => [
          note.title,
          note.body,
          note.status,
          note.priority,
          note.author,
          note.createdAt,
          note.updatedAt,
          formatDate(note.createdAt),
          formatDate(note.updatedAt)
        ])
      ]);
    });
  }, [search, state.businesses, state.reportNotes]);

  const selectedBusiness =
    filteredBusinesses.find(item => item.id === selectedBusinessId) ?? filteredBusinesses[0] ?? (!searchTerm ? state.businesses[0] : null);

  const notes = useMemo(() => {
    if (!selectedBusiness) return [];
    return state.reportNotes
      .filter(item => item.businessId === selectedBusiness.id)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [selectedBusiness, state.reportNotes]);

  const followUpCount = notes.filter(item => item.status === "Perlu Follow Up").length;
  const doneCount = notes.filter(item => item.status === "Selesai").length;

  function openCreateForm() {
    if (!selectedBusiness) return;
    setNoteForm(emptyNoteForm(selectedBusiness.id));
  }

  function openEditForm(note: ReportNote) {
    setNoteForm({
      id: note.id,
      businessId: note.businessId,
      title: note.title,
      body: note.body,
      status: note.status,
      priority: note.priority
    });
  }

  function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const targetBusiness = state.businesses.find(item => item.id === noteForm?.businessId) ?? selectedBusiness;
    if (!targetBusiness || !noteForm?.title.trim() || !noteForm.body.trim()) return;

    const today = new Date().toISOString().slice(0, 10);
    update(draft => {
      if (noteForm.id) {
        return {
          ...draft,
          reportNotes: draft.reportNotes.map(item =>
            item.id === noteForm.id
              ? {
                  ...item,
                  businessId: targetBusiness.id,
                  title: noteForm.title.trim(),
                  body: noteForm.body.trim(),
                  status: noteForm.status,
                  priority: noteForm.priority,
                  updatedAt: today
                }
              : item
          )
        };
      }

      const newNote: ReportNote = {
        id: uid("note"),
        businessId: targetBusiness.id,
        title: noteForm.title.trim(),
        body: noteForm.body.trim(),
        status: noteForm.status,
        priority: noteForm.priority,
        createdAt: today,
        updatedAt: today,
        author: draft.profile.owner,
        ownerId: draft.session.userId
      };

      return { ...draft, reportNotes: [newNote, ...draft.reportNotes] };
    });

    setSelectedBusinessId(targetBusiness.id);
    setNoteForm(null);
    notify(noteForm.id ? "Catatan report berhasil diperbarui" : "Catatan report berhasil dibuat");
  }

  function removeNote(id: string) {
    if (!confirm("Hapus catatan report ini?")) return;
    update(draft => ({ ...draft, reportNotes: draft.reportNotes.filter(item => item.id !== id) }));
    notify("Catatan report dihapus");
  }

  return (
    <div className="grid min-h-[calc(100vh-140px)] overflow-hidden rounded-3xl border border-slate-200/50 bg-white/95 shadow-soft xl:grid-cols-[380px_minmax(0,1fr)]">
      <aside className="flex flex-col border-b border-slate-200/60 bg-slate-50/30 p-5 xl:border-b-0 xl:border-r xl:border-slate-200/60">
        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200/70 bg-white p-5 shadow-soft">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                <ClipboardList size={20} />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-teal-700">Report UMKM</p>
                <h2 className="mt-1 text-base font-black tracking-tight text-slate-900">Catatan per usaha</h2>
                <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-500">
                  Pilih UMKM, lalu buat catatan follow up, evaluasi, atau laporan kunjungan.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Cari UMKM, kontak, isi catatan..."
              className="min-h-[42px] rounded-2xl border-slate-200/80 bg-white pl-10 pr-9 text-xs focus:border-teal-650"
            />
            {searchTerm ? (
              <button type="button" aria-label="Bersihkan pencarian" onClick={() => setSearch("")} className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
                <X size={13} />
              </button>
            ) : null}
          </div>
        </div>

        <div className="scrollbar-thin mt-5 flex-1 space-y-3 overflow-y-auto pr-1">
          {filteredBusinesses.map(item => {
            const noteCount = state.reportNotes.filter(note => note.businessId === item.id).length;
            const selected = selectedBusiness?.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedBusinessId(item.id)}
                className={cn(
                  "flex w-full gap-3 rounded-2xl border p-3 text-left transition-all duration-200",
                  selected
                    ? "border-teal-200 bg-teal-50 shadow-sm"
                    : "border-transparent hover:border-slate-200 hover:bg-white"
                )}
              >
                <img src={item.image} alt={item.name} className="h-14 w-14 shrink-0 rounded-2xl object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-black text-slate-900">{item.name}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-slate-500">
                    <span>{item.category}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>{item.distance} km</span>
                  </span>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[10px] font-black text-teal-700 ring-1 ring-teal-100">
                    <StickyNote size={11} /> {noteCount} catatan
                  </span>
                </span>
              </button>
            );
          })}

          {filteredBusinesses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-xs font-semibold text-slate-400">
              {searchTerm ? `Tidak ada UMKM atau catatan yang cocok dengan "${searchTerm}".` : "UMKM tidak ditemukan."}
            </div>
          ) : null}
        </div>
      </aside>

      <section className="min-w-0 bg-slate-50/30">
        {selectedBusiness ? (
          <div className="flex h-full flex-col">
            <header className="border-b border-slate-200/60 bg-white/95 p-5 sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 gap-4">
                  <img src={selectedBusiness.image} alt={selectedBusiness.name} className="h-20 w-20 shrink-0 rounded-3xl object-cover shadow-soft" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="teal">{selectedBusiness.category}</Badge>
                      <Badge tone="slate"><MapPin size={11} /> {selectedBusiness.distance} km</Badge>
                    </div>
                    <h1 className="mt-3 truncate text-2xl font-black tracking-tight text-slate-900">{selectedBusiness.name}</h1>
                    <p className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Phone size={13} /> {selectedBusiness.phone}
                    </p>
                  </div>
                </div>

                <Button onClick={openCreateForm} className="min-h-[44px] rounded-xl px-5 text-xs font-black shadow-md shadow-teal-700/10">
                  <Plus size={15} /> Tambah Catatan
                </Button>
              </div>

              <div className="mt-5 rounded-2xl border border-teal-100 bg-teal-50/60 p-4 text-xs font-semibold leading-relaxed text-slate-600">
                <span className="font-black text-teal-800">Promo UMKM:</span> {selectedBusiness.promo}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Catatan</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{notes.length}</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Perlu Follow Up</p>
                  <p className="mt-2 text-2xl font-black text-amber-700">{followUpCount}</p>
                </div>
                <div className="rounded-2xl border border-teal-100 bg-teal-50/70 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-teal-700">Selesai</p>
                  <p className="mt-2 text-2xl font-black text-teal-800">{doneCount}</p>
                </div>
              </div>
            </header>

            <div className="scrollbar-thin flex-1 overflow-y-auto p-5 sm:p-6">
              {notes.length > 0 ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  {notes.map(note => (
                    <Card key={note.id} className="border-slate-200/70 bg-white/95 p-5 shadow-soft">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge tone={statusTone(note.status)}>{note.status}</Badge>
                            <Badge tone={priorityTone(note.priority)}>Prioritas {note.priority}</Badge>
                          </div>
                          <h3 className="mt-3 text-base font-black leading-snug text-slate-900">{note.title}</h3>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button variant="ghost" className="h-8 w-8 rounded-lg px-0 text-slate-500 hover:bg-slate-100" onClick={() => openEditForm(note)} aria-label="Edit catatan">
                            <Pencil size={14} />
                          </Button>
                          <Button variant="ghost" className="h-8 w-8 rounded-lg px-0 text-rose-600 hover:bg-rose-50" onClick={() => removeNote(note.id)} aria-label="Hapus catatan">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>

                      <p className="mt-4 whitespace-pre-line text-sm font-medium leading-7 text-slate-600">{note.body}</p>

                      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span className="inline-flex items-center gap-1.5"><CalendarDays size={12} /> Dibuat {formatDate(note.createdAt)}</span>
                        <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={12} /> Update {formatDate(note.updatedAt)}</span>
                        <span>Oleh {note.author}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid min-h-[340px] place-items-center rounded-3xl border border-dashed border-slate-200 bg-white/75 p-8 text-center">
                  <div className="max-w-md">
                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                      <StickyNote size={24} />
                    </span>
                    <h2 className="mt-5 text-base font-black text-slate-900">Belum ada catatan untuk UMKM ini</h2>
                    <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-500">
                      Buat report pertama untuk menyimpan hasil survei, follow up, kendala, atau potensi kerja sama.
                    </p>
                    <Button onClick={openCreateForm} className="mt-5 min-h-[40px] rounded-xl px-5 text-xs font-black">
                      <Plus size={15} /> Buat Catatan Pertama
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid h-full place-items-center p-8 text-center">
            <Card className="max-w-md border-slate-100 bg-white/90 p-8 shadow-soft">
              <AlertCircle size={28} className="mx-auto text-amber-500" />
              <h2 className="mt-4 text-base font-black text-slate-900">{searchTerm ? "UMKM tidak ditemukan" : "Belum ada data UMKM"}</h2>
              <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-500">
                {searchTerm ? `Tidak ada UMKM atau catatan report yang cocok dengan "${searchTerm}".` : "Tambahkan data UMKM di menu Radar UMKM agar report notes bisa dibuat per usaha."}
              </p>
            </Card>
          </div>
        )}
      </section>

      {noteForm ? (
        <Modal title={noteForm.id ? "Edit Catatan Report" : "Tambah Catatan Report"} onClose={() => setNoteForm(null)}>
          <form className="space-y-4" onSubmit={saveNote}>
            <FieldLabel label="Ditujukan ke UMKM">
              <Select
                value={noteForm.businessId}
                onChange={event => setNoteForm({ ...noteForm, businessId: event.target.value })}
                className="rounded-xl border-slate-200/80 focus:border-teal-650"
              >
                {state.businesses.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
              </Select>
            </FieldLabel>
            <FieldLabel label="Judul Catatan">
              <Input
                value={noteForm.title}
                onChange={event => setNoteForm({ ...noteForm, title: event.target.value })}
                required
                placeholder="Contoh: Follow up promo reseller"
                className="rounded-xl border-slate-200/80 focus:border-teal-650"
              />
            </FieldLabel>

            <div className="grid gap-4 sm:grid-cols-2">
              <FieldLabel label="Status">
                <Select
                  value={noteForm.status}
                  onChange={event => setNoteForm({ ...noteForm, status: event.target.value as ReportStatus })}
                  className="rounded-xl border-slate-200/80 focus:border-teal-650"
                >
                  {statusOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </Select>
              </FieldLabel>
              <FieldLabel label="Prioritas">
                <Select
                  value={noteForm.priority}
                  onChange={event => setNoteForm({ ...noteForm, priority: event.target.value as ReportPriority })}
                  className="rounded-xl border-slate-200/80 focus:border-teal-650"
                >
                  {priorityOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </Select>
              </FieldLabel>
            </div>

            <FieldLabel label="Isi Report / Notes">
              <Textarea
                rows={6}
                value={noteForm.body}
                onChange={event => setNoteForm({ ...noteForm, body: event.target.value })}
                required
                placeholder="Tuliskan hasil kunjungan, peluang kerja sama, kendala, kebutuhan follow up, atau catatan penting lain untuk UMKM ini."
                className="min-h-[160px] rounded-xl border-slate-200/80 focus:border-teal-650"
              />
            </FieldLabel>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <Button type="button" variant="secondary" className="min-h-[38px] rounded-xl px-4 text-xs font-bold" onClick={() => setNoteForm(null)}>
                <X size={15} /> Batal
              </Button>
              <Button type="submit" className="min-h-[38px] rounded-xl px-5 text-xs font-black">
                Simpan Catatan
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}