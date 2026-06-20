"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Sprout, ArrowRight, Loader2, Eye, EyeOff, Wallet, MessageSquareText, BarChart3, MapPinned } from "lucide-react";
import { FieldLabel, Input } from "@/components/ui/Field";
import { useEmi } from "@/lib/store";

export function AuthPanel({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const { login, register, notify } = useEmi();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(mode === "login" ? "rina@emi.test" : "");
  const [password, setPassword] = useState(mode === "login" ? "admin123" : "");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const isRegister = mode === "register";

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    if (isRegister) {
      const result = register(name, email, password);
      if (!result.ok) { notify(result.message ?? "Gagal"); setLoading(false); return; }
      notify("Akun berhasil dibuat!");
      router.push("/dashboard");
    } else {
      if (!login(email, password)) { notify("Email atau password salah"); setLoading(false); return; }
      notify("Selamat datang kembali!");
      router.push("/dashboard");
    }
  }

  async function handleSocial(provider: string) {
    setSocialLoading(provider);
    await new Promise(r => setTimeout(r, 1200));
    login("rina@emi.test", "admin123");
    notify(`Masuk via ${provider} berhasil!`);
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-bg flex overflow-hidden">
      {/* LEFT - Decorative panel */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col items-start justify-between p-12 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#050a14] via-[#070e1c] to-[#060c16]" />
        <div className="absolute inset-0 dot-bg opacity-60" />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/3 h-80 w-80 rounded-full bg-accent/[0.08] blur-[80px]" />
        <div className="absolute bottom-1/4 right-0 h-64 w-64 rounded-full bg-blue-500/[0.08] blur-[80px]" />

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
              Catat keuangan, chat mitra, promosi toko, dan bagikan insight bisnis - semuanya dalam satu workspace privat.
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-2.5">
            {[
              { icon: Wallet, label: "Pencatatan arus kas real-time" },
              { icon: MessageSquareText, label: "Chat komunitas UMKM sekitar" },
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
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 grid-bg opacity-30" />
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

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocial("Google")}
              disabled={!!socialLoading || loading}
              className="flex items-center justify-center gap-2.5 h-11 rounded-xl border border-[rgba(99,179,237,0.15)] bg-surface-2/50 hover:bg-surface-2 hover:border-[rgba(99,179,237,0.3)] text-ink text-xs font-bold transition-all duration-150 disabled:opacity-50"
            >
              {socialLoading === "Google" ? (
                <Loader2 size={15} className="animate-spin text-muted" />
              ) : (
                <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
              )}
              Google
            </button>

            {/* Apple */}
            <button
              type="button"
              onClick={() => handleSocial("Apple")}
              disabled={!!socialLoading || loading}
              className="flex items-center justify-center gap-2.5 h-11 rounded-xl border border-[rgba(99,179,237,0.15)] bg-surface-2/50 hover:bg-surface-2 hover:border-[rgba(99,179,237,0.3)] text-ink text-xs font-bold transition-all duration-150 disabled:opacity-50"
            >
              {socialLoading === "Apple" ? (
                <Loader2 size={15} className="animate-spin text-muted" />
              ) : (
                <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.42c1.28.07 2.17.74 2.99.8 1.17-.24 2.29-.93 3.53-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.4 3.97zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              )}
              Apple
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[rgba(99,179,237,0.1)]" />
            <span className="text-[10px] font-black text-dim uppercase tracking-widest">atau dengan email</span>
            <div className="flex-1 h-px bg-[rgba(99,179,237,0.1)]" />
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">
            {isRegister && (
              <FieldLabel label="Nama Lengkap">
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="Nama pemilik usaha"
                  className="min-h-[44px]"
                />
              </FieldLabel>
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

          {/* Demo creds */}
          {!isRegister && (
            <div className="rounded-xl border border-[rgba(99,179,237,0.1)] bg-surface-2/30 px-4 py-3 text-center">
              <p className="text-[10px] text-dim font-bold uppercase tracking-widest mb-1">Demo</p>
              <p className="text-xs font-black text-accent">rina@emi.test / admin123</p>
            </div>
          )}

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
