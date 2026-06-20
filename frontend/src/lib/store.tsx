"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { defaultState } from "./mock-data";
import { EmiState, ThemeMode, User } from "./types";
import { uid } from "./utils";

// Kunci penyimpanan local storage untuk menyimpan data state UMKM
const STORAGE_KEY = "emi-umkm-next-state-v1";

// Definisi tipe data konteks (Context) untuk store global aplikasi
type StoreContext = {
  state: EmiState;                                                          // Data state global saat ini
  ready: boolean;                                                          // Menandakan apakah data lokal selesai dimuat
  toast: string | null;                                                    // Isi pesan toast aktif
  currentUser: User | null;                                                // Data akun user yang sedang masuk
  update: (updater: (state: EmiState) => EmiState) => void;                // Fungsi untuk memutasi state secara aman
  setTheme: (theme: ThemeMode) => void;                                    // Mengganti mode tema antarmuka
  notify: (message: string) => void;                                       // Memicu kemunculan notifikasi toast
  login: (email: string, password: string) => boolean;                     // Simulasi aksi masuk (login)
  register: (name: string, email: string, password: string) => { ok: boolean; message?: string }; // Simulasi daftar (register)
  logout: () => void;                                                      // Aksi keluar (logout)
  resetDemo: () => void;                                                   // Mengembalikan state ke data demo bawaan
};

// Pembuatan objek React Context untuk state EMI
const EmiContext = createContext<StoreContext | null>(null);

/**
 * Menduplikasi objek state secara mendalam (deep clone) agar terhindar dari referensi mutasi langsung.
 */
function cloneState(state: EmiState) {
  return JSON.parse(JSON.stringify(state)) as EmiState;
}

/**
 * Membaca data state terakhir dari LocalStorage (jika di sisi client) atau menggunakan data default.
 */
function readState() {
  if (typeof window === "undefined") return cloneState(defaultState);
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return cloneState(defaultState);
    return { ...cloneState(defaultState), ...JSON.parse(saved) } as EmiState;
  } catch {
    return cloneState(defaultState);
  }
}

/**
 * EmiProvider membungkus aplikasi dan menyediakan state, mutasi,
 * notifikasi, serta manajemen sesi ke seluruh komponen anak.
 */
export function EmiProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<EmiState>(() => cloneState(defaultState));
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Efek samping untuk membaca data tersimpan dari LocalStorage setelah komponen dimuat di browser
  useEffect(() => {
    setState(readState());
    setReady(true);
  }, []);

  // Menerapkan tema global ke root dokumen.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = state.theme ?? "dark";
  }, [state.theme]);

  /**
   * Menyimpan perubahan state terbaru ke LocalStorage agar data tetap persisten meskipun halaman direfresh.
   */
  function persist(next: EmiState) {
    setState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }

  /**
   * Fungsi helper untuk mengupdate state. Menyuplai salinan state saat ini ke fungsi updater.
   */
  function update(updater: (state: EmiState) => EmiState) {
    persist(updater(cloneState(state)));
  }

  /**
   * Mengubah mode tema dan menyimpannya ke state persisten.
   */
  function setTheme(theme: ThemeMode) {
    update(draft => ({ ...draft, theme }));
  }

  /**
   * Menampilkan pesan pemberitahuan singkat (Toast) di sudut kanan bawah.
   */
  function notify(message: string) {
    setToast(message);
    window.clearTimeout((notify as unknown as { timer?: number }).timer);
    (notify as unknown as { timer?: number }).timer = window.setTimeout(() => setToast(null), 2400);
  }

  /**
   * Mengotentikasi kredensial email & password dan mencocokkannya dengan daftar user terdaftar.
   */
  function login(email: string, password: string) {
    const user = state.users.find(item => item.email.toLowerCase() === email.toLowerCase() && item.password === password);
    if (!user) return false;
    update(draft => ({ ...draft, session: { isLoggedIn: true, userId: user.id } }));
    return true;
  }

  /**
   * Mendaftarkan akun user baru, mencegah email ganda, dan langsung menetapkan sesi aktif.
   */
  function register(name: string, email: string, password: string) {
    if (state.users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, message: "Email sudah terdaftar." };
    }
    const user: User = { id: uid("user"), name, email, password };
    update(draft => ({
      ...draft,
      users: [...draft.users, user],
      session: { isLoggedIn: true, userId: user.id },
      profile: { ...draft.profile, owner: name }
    }));
    return { ok: true };
  }

  /**
   * Menghancurkan sesi aktif dan mengembalikan status ke guest mode.
   */
  function logout() {
    update(draft => ({ ...draft, session: { isLoggedIn: false, userId: null } }));
  }

  /**
   * Mereset seluruh isi database lokal kembali ke setelan default awal demo.
   */
  function resetDemo() {
    persist(cloneState(defaultState));
    notify("Data demo dikembalikan");
  }

  // Mengidentifikasi profil user yang sedang login
  const currentUser = state.users.find(user => user.id === state.session.userId) ?? null;

  const value = { state, ready, toast, currentUser, update, setTheme, notify, login, register, logout, resetDemo };

  return (
    <EmiContext.Provider value={value}>
      {children}
      {/* Komponen Toast Notifikasi Melayang */}
      {toast ? (
        <div className="fixed bottom-5 right-5 z-[90] rounded-xl border border-teal-100 bg-white/90 backdrop-blur-md px-5 py-3.5 text-sm font-semibold text-slate-800 shadow-lift animate-fade-in flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
          {toast}
        </div>
      ) : null}
    </EmiContext.Provider>
  );
}

/**
 * Custom Hook useEmi untuk mengakses data state dan aksi global di seluruh halaman.
 */
export function useEmi() {
  const context = useContext(EmiContext);
  if (!context) throw new Error("useEmi harus digunakan di dalam komponen EmiProvider");
  return context;
}
