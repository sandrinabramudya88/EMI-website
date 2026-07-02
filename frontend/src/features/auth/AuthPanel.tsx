"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Sprout, ArrowRight, Loader2, Eye, EyeOff, Wallet, ClipboardList, BarChart3, MapPinned } from "lucide-react";
import { FieldLabel, Input } from "@/components/ui/Field";
import { useEmi } from "@/lib/store";

export function AuthPanel({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const { login, register, notify, usingDatabase } = useEmi();
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const isRegister = mode === "register";

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        const result = await register(name, email, password, businessName);
        if (!result.ok) {
          notify(result.message ?? "Gagal membuat akun.");
          return;
        }
        notify("Akun berhasil dibuat!");
        router.push("/dashboard");
        return;
      }

      if (!(await login(email, password))) {
        notify("Email atau password salah");
        return;
      }
      notify("Selamat datang kembali!");
      router.push("/dashboard");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Terjadi kesalahan saat autentikasi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex overflow-x-hidden overflow-y-auto">
      {/* LEFT - Decorative panel */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col items-start justify-between p-12 overflow-hidden">
        {/* Background layers */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#050a14] via-[#070e1c] to-[#060c16]" />
        <div className="pointer-events-none absolute inset-0 dot-bg opacity-60" />
        {/* Glow orbs */}
        <div className="pointer-events-none absolute top-1/4 left-1/3 h-80 w-80 rounded-full bg-accent/[0.08] blur-[80px]" />
        <div className="pointer-events-none absolute bottom-1/4 right-0 h-64 w-64 rounded-full bg-blue-500/[0.08] blur-[80px]" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center">
            <Sprout size={20} className="text-accent" />
          </div>
          <div>
            <div className="font-black text-ink text-base tracking-tight">EMI UMKM</div>
            <div className="text-[10px] font-bold text-accent/60 uppercase tracking-widest">Platform Bisnis</div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-black text-accent uppercase tracking-widest">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              Semua data tersimpan privat
            </div>
            <h2 className="text-4xl font-black text-ink leading-[1.1] tracking-tight">
              Kelola bisnis<br />
              <span className="gradient-text">lebih cerdas.</span>
            </h2>
            <p className="text-muted text-sm font-medium leading-relaxed max-w-xs">
              Catat keuangan, buat report UMKM, promosi toko, dan bagikan insight bisnis - semuanya dalam satu workspace privat.
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-2.5">
            {[
              { icon: Wallet, label: "Pencatatan arus kas real-time" },
              { icon: ClipboardList, label: "Report notes untuk tiap UMKM" },
              { icon: BarChart3, label: "Grafik keuangan & ekspor Excel" },
              { icon: MapPinned, label: "Radar promosi bisnis terdekat" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-sm text-muted font-medium">
                <span className="grid h-7 w-7 place-items-center rounded-xl border border-accent/15 bg-accent/10 text-accent">
                  <Icon size={14} />
                </span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Bottom quote */}
        <div className="relative z-10 border-l-2 border-accent/30 pl-4">
          <p className="text-xs text-muted font-medium italic leading-relaxed">
            &quot;Fitur keuangan EMI sangat membantu saya memantau omzet harian tanpa ribet.&quot;
          </p>
          <p className="text-[10px] text-accent/60 font-bold mt-1.5 uppercase tracking-widest">- Pengguna EMI UMKM</p>
        </div>
      </div>

      {/* RIGHT - Form */}
      <div className="relative flex min-h-screen flex-1 items-center justify-center p-6 py-10">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-[400px] space-y-6 animate-fade-up">
          {/* Header */}
          <div className="space-y-1.5">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-xl bg-accent/10 border border-accent/25 flex items-center justify-center">
                <Sprout size={16} className="text-accent" />
              </div>
              <span className="font-black text-ink text-sm">EMI UMKM</span>
            </div>
            <h1 className="text-2xl font-black text-ink tracking-tight">
              {isRegister ? "Buat akun gratis" : "Selamat datang kembali"}
            </h1>
            <p className="text-sm text-muted font-medium">
              {isRegister
                ? "Daftarkan workspace bisnis Anda sekarang"
                : "Masuk ke dashboard bisnis Anda"}
            </p>
          </div>
          {!usingDatabase ? (
            <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-xs font-bold leading-relaxed text-amber-200">
              Database Supabase belum aktif. Aktifkan environment Supabase agar akun dan data tersimpan online.
            </div>
          ) : null}

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">
            {isRegister && (
              <>
                <FieldLabel label="Nama Lengkap">
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="Nama pemilik usaha"
                    className="min-h-[44px]"
                  />
                </FieldLabel>
                <FieldLabel label="Nama UMKM / Perusahaan (Opsional)">
                  <Input
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    placeholder="Contoh: Dapur Rempah Rina"
                    className="min-h-[44px]"
                  />
                </FieldLabel>
              </>
            )}
            <FieldLabel label="Email">
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="email@domain.com"
                className="min-h-[44px]"
              />
            </FieldLabel>
            <FieldLabel label="Password">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="********"
                  className="min-h-[44px] pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dim hover:text-muted transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </FieldLabel>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary min-h-[46px] rounded-xl flex items-center justify-center gap-2 text-sm font-black disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Memproses...</>
              ) : (
                <>{isRegister ? "Buat Workspace" : "Masuk Sekarang"} <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          {/* Switch mode */}
          <p className="text-center text-xs text-muted font-medium">
            {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
            <a
              href={isRegister ? "/login" : "/register"}
              className="text-accent font-black hover:underline"
            >
              {isRegister ? "Masuk" : "Daftar gratis"}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
