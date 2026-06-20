"use client";

import { FormEvent, useMemo, useState } from "react";
import { MessageCircle, Pencil, Plus, Send, Trash2, Users, UserRound, X, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldLabel, Input, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useEmi } from "@/lib/store";
import { ChatTarget, ChatType } from "@/lib/types";
import { cn, initials, uid } from "@/lib/utils";

type TargetForm = {
  id?: string;
  name: string;
  meta: string;
};

/**
 * Komponen CommunityChat adalah ruang obrolan komunitas UMKM.
 * Mengadopsi desain visual premium ala Telegram / Slack.
 */
export function CommunityChat() {
  const { state, update, notify } = useEmi();
  const [type, setType] = useState<ChatType>("private");
  const targets = useMemo(() => state.chatTargets.filter(item => item.type === type), [state.chatTargets, type]);
  const [selectedId, setSelectedId] = useState(targets[0]?.id ?? "");
  const selected = targets.find(item => item.id === selectedId) ?? targets[0];
  const messages = selected ? state.chatMessages.filter(item => item.targetId === selected.id) : [];
  const [message, setMessage] = useState("");
  const [targetForm, setTargetForm] = useState<TargetForm | null>(null);

  function switchType(next: ChatType) {
    const first = state.chatTargets.find(item => item.type === next);
    setType(next);
    setSelectedId(first?.id ?? "");
  }

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !message.trim()) return;
    const time = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    update(draft => ({
      ...draft,
      chatMessages: [
        ...draft.chatMessages,
        {
          id: uid("msg"),
          targetId: selected.id,
          from: "me",
          sender: draft.profile.owner,
          text: message.trim(),
          time
        }
      ]
    }));
    setMessage("");
    notify("Pesan terkirim");
  }

  function saveTarget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!targetForm?.name.trim()) return;
    update(draft => {
      if (targetForm.id) {
        return {
          ...draft,
          chatTargets: draft.chatTargets.map(item =>
            item.id === targetForm.id ? { ...item, name: targetForm.name.trim(), meta: targetForm.meta.trim(), initials: initials(targetForm.name) } : item
          )
        };
      }
      const target: ChatTarget = {
        id: uid("chat"),
        type,
        name: targetForm.name.trim(),
        meta: targetForm.meta.trim(),
        initials: initials(targetForm.name),
        color: type === "private" ? "#4f46e5" : "#0f766e" // Premium Indigo & Teal
      };
      setSelectedId(target.id);
      return { ...draft, chatTargets: [target, ...draft.chatTargets] };
    });
    setTargetForm(null);
    notify("Kontak obrolan disimpan");
  }

  function removeTarget(id: string) {
    update(draft => ({
      ...draft,
      chatTargets: draft.chatTargets.filter(item => item.id !== id),
      chatMessages: draft.chatMessages.filter(item => item.targetId !== id)
    }));
    setSelectedId("");
    notify("Ruang obrolan berhasil dihapus");
  }

  function removeMessage(id: string) {
    update(draft => ({ ...draft, chatMessages: draft.chatMessages.filter(item => item.id !== id) }));
  }

  return (
    <div className="grid min-h-[calc(100vh-140px)] overflow-hidden rounded-3xl border border-slate-200/50 bg-white/95 shadow-soft xl:grid-cols-[380px_minmax(0,1fr)]">
      {/* Sidebar Kontak & Group Obrolan */}
      <aside className="border-b border-slate-200/60 bg-slate-50/20 p-5 xl:border-b-0 xl:border-r xl:border-slate-200/60 flex flex-col justify-between">
        <div className="space-y-5 flex-1 flex flex-col">
          {/* Tab Toggle Pribadi vs Group */}
          <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-slate-100/80 p-1.5 border border-slate-200/20">
            <button
              className={cn(
                "flex min-h-[38px] items-center justify-center gap-2 rounded-xl text-xs font-black transition-all duration-300 active:scale-95",
                type === "private" 
                  ? "bg-white text-indigo-700 shadow-sm border border-slate-200/10 font-black" 
                  : "text-slate-500 hover:text-slate-800"
              )}
              onClick={() => switchType("private")}
            >
              <UserRound size={15} /> Obrolan Pribadi
            </button>
            <button
              className={cn(
                "flex min-h-[38px] items-center justify-center gap-2 rounded-xl text-xs font-black transition-all duration-300 active:scale-95",
                type === "group" 
                  ? "bg-white text-teal-700 shadow-sm border border-slate-200/10 font-black" 
                  : "text-slate-500 hover:text-slate-800"
              )}
              onClick={() => switchType("group")}
            >
              <Users size={15} /> Komunitas Group
            </button>
          </div>

          {/* Tombol Buat Kontak / Group Baru */}
          <Button 
            variant={type === "private" ? "indigo" : "primary"} 
            className="w-full shadow-md active:scale-95 transition-transform duration-100 min-h-[42px]" 
            onClick={() => setTargetForm({ name: "", meta: "" })}
          >
            <Plus size={16} /> {type === "private" ? "Tambah Kontak Baru" : "Buat Group Baru"}
          </Button>

          {/* Daftar Kontak Scrollable */}
          <div className="scrollbar-thin space-y-2.5 overflow-y-auto max-h-[calc(100vh-340px)] pr-1 flex-1">
            {targets.map(item => (
              <div 
                key={item.id} 
                className={cn(
                  "flex items-center gap-3.5 rounded-2xl p-3.5 transition-all duration-300 border relative group",
                  selected?.id === item.id 
                    ? type === "private" ? "bg-indigo-50 border-indigo-100/60" : "bg-teal-50 border-teal-100/60"
                    : "hover:bg-slate-50/80 border-transparent hover:border-slate-100"
                )}
              >
                <button className="flex min-w-0 flex-1 items-center gap-3.5 text-left" onClick={() => setSelectedId(item.id)}>
                  {/* Foto Profil / Inisial dengan status online */}
                  <div className="relative shrink-0 select-none">
                    <span 
                      className="grid h-11 w-11 place-items-center rounded-xl text-xs font-black text-white shadow-sm" 
                      style={{ background: item.color }}
                    >
                      {item.initials}
                    </span>
                    {/* Pulsing Green Dot (Status Online Simulasi) */}
                    <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-emerald-500 shadow-sm" />
                  </div>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-black text-slate-900">{item.name}</span>
                    <span className="block truncate text-[10px] font-bold text-slate-400 mt-0.5">{item.meta}</span>
                  </span>
                </button>
                
                {/* Aksi Ubah & Hapus Chat */}
                <div className="inline-flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button variant="ghost" className="h-8 w-8 px-0 rounded-lg hover:bg-white" onClick={() => setTargetForm({ id: item.id, name: item.name, meta: item.meta })} aria-label="Edit chat">
                    <Pencil size={13} className="text-slate-400 hover:text-slate-600" />
                  </Button>
                  <Button variant="ghost" className="h-8 w-8 px-0 rounded-lg text-rose-600 hover:bg-white" onClick={() => removeTarget(item.id)} aria-label="Hapus chat">
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            ))}
            {targets.length === 0 ? (
              <div className="text-center py-12 text-xs font-semibold text-slate-400">Belum ada {type === "private" ? "kontak" : "group"} ditambahkan.</div>
            ) : null}
          </div>
        </div>
      </aside>

      {/* Area Obrolan Utama */}
      <section className="grid min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] bg-slate-50/30">
        {selected ? (
          <>
            {/* Header Ruang Obrolan */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-200/60 bg-white/95 px-6 py-4.5 backdrop-blur-md">
              <div className="flex min-w-0 items-center gap-3.5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xs font-black text-white shadow-md shadow-indigo-100/10" style={{ background: selected.color }}>
                  {selected.initials}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-black text-slate-900 tracking-tight">{selected.name}</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <p className="truncate text-[10px] font-bold text-slate-400 uppercase tracking-wide">{selected.meta}</p>
                  </div>
                </div>
              </div>
              <Badge tone="teal" className="bg-teal-50 text-teal-700 font-bold border-teal-100/40 select-none">
                <MessageCircle size={13} /> Chat Aktif
              </Badge>
            </div>

            {/* Bubble Chat Area */}
            <div className="scrollbar-thin surface-grid overflow-y-auto p-5 sm:p-7 max-h-[calc(100vh-320px)] flex flex-col justify-end">
              <div className="space-y-4">
                {messages.map(item => (
                  <div 
                    key={item.id} 
                    className={cn(
                      "max-w-[70%] rounded-2xl px-4.5 py-3.5 shadow-soft border relative group transition-all duration-300 animate-fade-in-up", 
                      item.from === "me" 
                        ? "ml-auto bg-gradient-to-tr from-indigo-650 to-indigo-700 text-white border-indigo-600 rounded-tr-none" 
                        : "bg-white text-slate-800 border-slate-100 rounded-tl-none"
                    )}
                  >
                    {type === "group" && item.from !== "me" ? (
                      <p className="mb-1 text-[10px] font-black text-teal-700 select-none uppercase tracking-wide">{item.sender}</p>
                    ) : null}
                    <p className="leading-relaxed text-xs sm:text-sm font-semibold">{item.text}</p>
                    
                    <div className={cn("mt-2 flex items-center justify-between gap-3 text-[9px] font-black uppercase tracking-wider select-none", item.from === "me" ? "text-indigo-100" : "text-slate-400")}>
                      <span>{item.time}</span>
                      {item.from === "me" ? (
                        <button className="underline opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-rose-300 hover:text-rose-200" onClick={() => removeMessage(item.id)}>hapus</button>
                      ) : null}
                    </div>
                  </div>
                ))}
                {messages.length === 0 ? (
                  <div className="text-center py-20 text-xs font-semibold text-slate-400 bg-white/40 border border-slate-100 border-dashed rounded-3xl max-w-md mx-auto">
                    Kirim pesan teks pertama untuk memulai obrolan komunitas dengan aman.
                  </div>
                ) : null}
              </div>
            </div>

            {/* Input Form Kirim Pesan */}
            <form className="border-t border-slate-200/60 bg-white/95 p-5" onSubmit={submitMessage}>
              <div className="flex items-center gap-3 max-w-5xl mx-auto">
                <Textarea 
                  rows={1} 
                  value={message} 
                  onChange={event => setMessage(event.target.value)} 
                  placeholder="Tulis pesan teks di sini..." 
                  className="rounded-xl border-slate-200/80 focus:border-indigo-650 resize-none min-h-[44px] max-h-[120px] font-semibold text-xs sm:text-sm"
                />
                <button 
                  type="submit" 
                  aria-label="Kirim pesan"
                  className={cn(
                    "h-11 w-11 shrink-0 grid place-items-center rounded-xl text-white shadow-md transition-all duration-200 active:scale-95 hover:-translate-y-0.5",
                    type === "private" ? "bg-indigo-650 hover:bg-indigo-700 shadow-indigo-600/10" : "bg-teal-650 hover:bg-teal-700 shadow-teal-600/10"
                  )}
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="grid place-items-center p-8 text-center h-full">
            <Card className="max-w-md p-8 border border-slate-100 shadow-soft bg-white/90 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-indigo-500 to-rose-500" />
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 mx-auto mb-4 border border-indigo-100/30 shadow-sm animate-float">
                <Sparkles size={22} />
              </span>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Belum Ada Chat Terpilih</h2>
              <p className="mt-2.5 text-xs font-semibold leading-relaxed text-slate-500">
                Silakan pilih salah satu kontak obrolan pribadi atau masuk ke group komunitas di panel kiri untuk mulai menjalin kolaborasi bisnis Anda.
              </p>
            </Card>
          </div>
        )}
      </section>

      {/* Modal Kontak/Group Baru */}
      {targetForm ? (
        <Modal title={targetForm.id ? "Ubah Detail Chat" : type === "private" ? "Tambah Kontak Baru" : "Buat Group Baru"} onClose={() => setTargetForm(null)}>
          <form className="space-y-4" onSubmit={saveTarget}>
            <FieldLabel label={type === "private" ? "Nama Kontak" : "Nama Group Komunitas"}>
              <Input value={targetForm.name} onChange={event => setTargetForm({ ...targetForm, name: event.target.value })} required className="rounded-xl border-slate-200/80 focus:border-teal-650" />
            </FieldLabel>
            <FieldLabel label="Deskripsi / Keterangan Kemitraan">
              <Input value={targetForm.meta} onChange={event => setTargetForm({ ...targetForm, meta: event.target.value })} required placeholder="Misal: Pemasok Bahan Kemasan, Produsen Tepung, Mitra Barter" className="rounded-xl border-slate-200/80 focus:border-teal-650" />
            </FieldLabel>
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4.5 text-xs font-bold leading-relaxed text-slate-500">
              💡 Fitur komunitas ini sepenuhnya dienkripsi lokal pada browser Anda. Anda dapat berkolaborasi, bertukar draf promo, atau berbagi supplier kemasan secara privat.
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <Button type="button" variant="secondary" className="min-h-[38px] px-4 rounded-xl text-xs font-bold border-slate-200" onClick={() => setTargetForm(null)}><X size={15} /> Batal</Button>
              <Button type="submit" className="min-h-[38px] px-5 rounded-xl text-xs font-black active:scale-95 transition-transform duration-100">Simpan Detail</Button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
