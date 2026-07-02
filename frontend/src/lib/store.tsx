"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { defaultState } from "./mock-data";
import { EmiState, ThemeMode, User } from "./types";
import { uid } from "./utils";
import { createSupabaseBrowserClient } from "./supabase/client";
import { blankWorkspaceState, ensureDatabaseProfile, loadDatabaseState, loadPublicDatabaseState, saveDatabaseState } from "./supabase/database-state";

// Kunci penyimpanan local storage untuk fallback lokal saat Supabase belum dikonfigurasi.
const STORAGE_KEY = "emi-umkm-next-state-v2";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const LOCAL_IMAGE_MAX_SIDE = 1600;
const LOCAL_IMAGE_QUALITY = 0.82;
const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png"]);
const DATABASE_REQUIRED_MESSAGE = "Database Supabase production belum aktif. Akun dan data UMKM tidak boleh disimpan lokal di website live.";

type RegisterResult = { ok: boolean; message?: string };
type UploadFolder = "articles" | "businesses";

type StoreContext = {
  state: EmiState;
  ready: boolean;
  toast: string | null;
  currentUser: User | null;
  usingDatabase: boolean;
  syncing: boolean;
  update: (updater: (state: EmiState) => EmiState) => void;
  setTheme: (theme: ThemeMode) => void;
  notify: (message: string) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, businessName?: string) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  resetDemo: () => void;
  uploadImage: (file: File, folder: UploadFolder) => Promise<string>;
};

const EmiContext = createContext<StoreContext | null>(null);

function cloneState(state: EmiState) {
  return JSON.parse(JSON.stringify(state)) as EmiState;
}

function readState() {
  if (typeof window === "undefined") return cloneState(defaultState);
  if (!canUseLocalFallback()) return cloneState(defaultState);
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return cloneState(defaultState);
    return { ...cloneState(defaultState), ...JSON.parse(saved) } as EmiState;
  } catch {
    return cloneState(defaultState);
  }
}

function canUseLocalFallback() {
  if (typeof window === "undefined") return false;
  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

function writeLocalState(next: EmiState) {
  if (typeof window === "undefined") return;
  if (!canUseLocalFallback()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    throw new Error("Penyimpanan browser penuh. Pakai gambar lebih kecil atau aktifkan database Supabase.");
  }
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Gagal memproses file gambar."));
    image.src = src;
  });
}

async function fileToLocalDataUrl(file: File) {
  const rawDataUrl = await readFileAsDataUrl(file);
  if (typeof document === "undefined") return rawDataUrl;

  const image = await loadImage(rawDataUrl);
  const scale = Math.min(1, LOCAL_IMAGE_MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return rawDataUrl;

  canvas.width = width;
  canvas.height = height;
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", LOCAL_IMAGE_QUALITY);
}

function extensionFromFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension && /^[a-z0-9]+$/.test(extension)) return extension;
  return file.type.split("/").pop()?.replace("jpeg", "jpg") || "jpg";
}

function userFromState(state: EmiState) {
  return state.users.find(user => user.id === state.session.userId) ?? null;
}

export function EmiProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<EmiState>(() => cloneState(defaultState));
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [usingDatabase, setUsingDatabase] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const supabaseRef = useRef(createSupabaseBrowserClient());
  const databaseUserIdRef = useRef<string | null>(null);
  const saveQueueRef = useRef<{ saving: boolean; next: EmiState | null }>({ saving: false, next: null });

  useEffect(() => {
    let cancelled = false;
    const client = supabaseRef.current;

    async function boot() {
      if (!client) {
        if (!cancelled) {
          setState(readState());
          setReady(true);
        }
        return;
      }

      setUsingDatabase(true);
      const { data, error } = await client.auth.getSession();
      if (error) console.error(error.message);

      if (data.session?.user) {
        try {
          const next = await loadDatabaseState(client, data.session.user);
          databaseUserIdRef.current = data.session.user.id;
          if (!cancelled) setState(next);
        } catch (err) {
          console.error(err);
          if (!cancelled) setState(readState());
        }
      } else if (!cancelled) {
        databaseUserIdRef.current = null;
        try {
          setState(await loadPublicDatabaseState(client));
        } catch (err) {
          console.error(err);
          setState({ ...cloneState(defaultState), session: { isLoggedIn: false, userId: null } });
        }
      }

      if (!cancelled) setReady(true);
    }

    void boot();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = state.theme ?? "dark";
  }, [state.theme]);

  function notify(message: string) {
    setToast(message);
    window.clearTimeout((notify as unknown as { timer?: number }).timer);
    (notify as unknown as { timer?: number }).timer = window.setTimeout(() => setToast(null), 2400);
  }

  async function flushDatabaseSave(client: NonNullable<ReturnType<typeof createSupabaseBrowserClient>>, userId: string) {
    if (saveQueueRef.current.saving) return;
    saveQueueRef.current.saving = true;
    setSyncing(true);

    try {
      while (saveQueueRef.current.next) {
        const next = saveQueueRef.current.next;
        saveQueueRef.current.next = null;
        await saveDatabaseState(client, next, userId);
      }
    } catch (error) {
      console.error(error);
      notify("Gagal sinkron ke database. Cek koneksi, bucket storage, atau migration Supabase.");
    } finally {
      saveQueueRef.current.saving = false;
      setSyncing(false);
      if (saveQueueRef.current.next) void flushDatabaseSave(client, userId);
    }
  }

  function persistSideEffects(next: EmiState) {
    const client = supabaseRef.current;
    const databaseUserId = databaseUserIdRef.current;

    if (client && databaseUserId && next.session.isLoggedIn) {
      saveQueueRef.current.next = cloneState(next);
      void flushDatabaseSave(client, databaseUserId);
      return;
    }

    writeLocalState(next);
  }

  function persist(next: EmiState) {
    setState(next);
    persistSideEffects(next);
  }

  function update(updater: (state: EmiState) => EmiState) {
    setState(previous => {
      const next = updater(cloneState(previous));
      persistSideEffects(next);
      return next;
    });
  }

  function setTheme(theme: ThemeMode) {
    update(draft => ({ ...draft, theme }));
  }

  async function login(email: string, password: string) {
    const client = supabaseRef.current;
    if (client) {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error || !data.user) return false;
      const next = await loadDatabaseState(client, data.user);
      databaseUserIdRef.current = data.user.id;
      setState(next);
      return true;
    }

    if (!canUseLocalFallback()) throw new Error(DATABASE_REQUIRED_MESSAGE);

    const user = state.users.find(item => item.email.toLowerCase() === email.toLowerCase() && item.password === password);
    if (!user) return false;
    persist({ ...state, session: { isLoggedIn: true, userId: user.id } });
    return true;
  }

  async function register(name: string, email: string, password: string, businessName?: string) {
    const client = supabaseRef.current;
    if (client) {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            business: businessName || `UMKM ${name}`
          }
        }
      });

      if (error || !data.user) {
        return { ok: false, message: error?.message ?? "Gagal membuat akun." };
      }

      if (!data.session) {
        return { ok: false, message: "Akun dibuat. Silakan cek email verifikasi Supabase, lalu login kembali." };
      }

      await ensureDatabaseProfile(client, data.user, {
        owner: name,
        business: businessName || `UMKM ${name}`
      });

      const next = await loadDatabaseState(client, data.user);
      databaseUserIdRef.current = data.user.id;
      setState(next);
      return { ok: true };
    }

    if (!canUseLocalFallback()) {
      return { ok: false, message: DATABASE_REQUIRED_MESSAGE };
    }

    if (state.users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, message: "Email sudah terdaftar." };
    }

    const user: User = { id: uid("user"), name, email, password };
    const next = blankWorkspaceState(user, { owner: name, business: businessName || `UMKM ${name}` });
    next.users = [...state.users, user];
    persist(next);
    return { ok: true };
  }

  async function logout() {
    const client = supabaseRef.current;
    if (client) {
      await client.auth.signOut();
      databaseUserIdRef.current = null;
      setState({ ...cloneState(defaultState), session: { isLoggedIn: false, userId: null } });
      return;
    }
    persist({ ...state, session: { isLoggedIn: false, userId: null } });
  }

  async function uploadImage(file: File, folder: UploadFolder) {
    if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
      throw new Error("Format gambar harus JPG, JPEG, atau PNG.");
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error("Ukuran foto maksimal 5 MB.");
    }

    const client = supabaseRef.current;
    const databaseUserId = databaseUserIdRef.current;
    if (!client || !databaseUserId) return fileToLocalDataUrl(file);

    const extension = extensionFromFile(file);
    const path = `${databaseUserId}/${folder}/${uid("media")}.${extension}`;
    const { error } = await client.storage.from("emi-media").upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false
    });

    if (error) {
      console.warn("Supabase Storage upload gagal, memakai fallback data URL.", error.message);
      return fileToLocalDataUrl(file);
    }

    const { data } = client.storage.from("emi-media").getPublicUrl(path);
    return data.publicUrl;
  }

  function resetDemo() {
    const current = userFromState(state);
    if (supabaseRef.current && databaseUserIdRef.current && current) {
      persist(blankWorkspaceState(current, state.profile));
      notify("Data workspace database dikosongkan");
      return;
    }
    persist(cloneState(defaultState));
    notify("Data lokal dikembalikan");
  }

  const currentUser = userFromState(state);
  const value = { state, ready, toast, currentUser, usingDatabase, syncing, update, setTheme, notify, login, register, logout, resetDemo, uploadImage };

  return (
    <EmiContext.Provider value={value}>
      {children}
      {toast ? (
        <div className="fixed bottom-5 right-5 z-[90] rounded-xl border border-teal-100 bg-white/90 backdrop-blur-md px-5 py-3.5 text-sm font-semibold text-slate-800 shadow-lift animate-fade-in flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
          {toast}
        </div>
      ) : null}
    </EmiContext.Provider>
  );
}

export function useEmi() {
  const context = useContext(EmiContext);
  if (!context) throw new Error("useEmi harus digunakan di dalam komponen EmiProvider");
  return context;
}