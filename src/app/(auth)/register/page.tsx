"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authApi.register(form);
      setAuth(res.data.user, res.data.access_token);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || "Gagal daftar. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex w-full min-h-screen bg-background text-on-background">
      {/* Left column — brand narrative */}
      <section className="hidden lg:flex flex-col relative w-1/2 bg-primary overflow-hidden items-start justify-end p-10 text-on-primary">
        <div aria-hidden className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(123,44,191,0.35),transparent_55%),radial-gradient(ellipse_at_center_left,rgba(37,82,202,0.45),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(0,223,193,0.18),transparent_50%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent" />
          <svg className="absolute inset-0 opacity-30" height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
            <path
              className="text-tertiary-fixed-dim"
              d="M-100,650 C250,750 450,350 850,550 C1250,750 1450,250 1850,450"
              fill="none"
              stroke="currentColor"
              strokeDasharray="10 10"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="relative z-10 max-w-lg mb-12">
          <div className="flex items-center gap-2 mb-8">
            <Compass className="w-8 h-8 text-tertiary-fixed-dim" />
            <h1 className="text-headline-md font-bold tracking-tight text-on-primary">Tuju</h1>
          </div>
          <h2 className="text-display-lg text-on-primary mb-6">Temukan Jalur Karir Masa Depanmu.</h2>
          <p className="text-body-lg text-primary-fixed-dim mb-8">
            Bergabunglah dengan ribuan siswa dan profesional yang telah memetakan kesuksesan mereka
            melalui panduan berbasis AI kami.
          </p>
          {/* Path connecting dots */}
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-tertiary-fixed-dim shadow-[0_0_10px_rgba(38,254,220,0.5)]" />
            <div className="h-0.5 flex-1 bg-gradient-to-r from-tertiary-fixed-dim to-transparent" />
          </div>
        </div>
      </section>

      {/* Right column — registration form */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-10 bg-surface relative overflow-y-auto">
        <div className="w-full max-w-md bg-surface-container-lowest/80 backdrop-blur-xl rounded-xl p-8 md:p-10 shadow-navy border border-outline-variant/30 relative z-10">
          {/* Mobile brand header */}
          <div className="flex items-center gap-2 mb-8 lg:hidden justify-center">
            <Compass className="w-7 h-7 text-secondary" />
            <h1 className="text-headline-md font-bold tracking-tight text-primary">Tuju</h1>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-headline-md text-on-surface mb-2">Daftar ke Tuju</h2>
            <p className="text-body-md text-on-surface-variant">
              Mulailah perjalananmu menemukan jalur hidup terbaik.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-error-container text-on-error-container rounded-md text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-label text-label-sm text-on-surface-variant mb-1 ml-1" htmlFor="name">
                Nama Lengkap
              </label>
              <div className="relative flex items-center">
                <User className="w-5 h-5 absolute left-3 text-outline pointer-events-none" />
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-md text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block font-label text-label-sm text-on-surface-variant mb-1 ml-1" htmlFor="email">
                Email
              </label>
              <div className="relative flex items-center">
                <Mail className="w-5 h-5 absolute left-3 text-outline pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-md text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block font-label text-label-sm text-on-surface-variant mb-1 ml-1" htmlFor="password">
                Kata Sandi
              </label>
              <div className="relative flex items-center">
                <Lock className="w-5 h-5 absolute left-3 text-outline pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Minimal 8 karakter"
                  className="w-full pl-10 pr-12 py-3 bg-surface-container-lowest border border-outline-variant rounded-md text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  className="absolute right-3 text-outline hover:text-on-surface-variant transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 mt-4 bg-secondary text-on-secondary text-button rounded-md hover:bg-secondary-container transition-all shadow-[0_4px_12px_rgba(37,82,202,0.2)] hover:shadow-[0_6px_16px_rgba(37,82,202,0.3)] active:scale-[0.98] flex justify-center items-center gap-2 group disabled:opacity-50"
            >
              {loading ? "Mendaftar..." : "Buat Akun"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-8 text-center text-body-md text-on-surface-variant">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-secondary font-semibold hover:text-secondary-container transition-colors underline decoration-2 underline-offset-4 decoration-secondary/30 hover:decoration-secondary"
            >
              Masuk di sini
            </Link>
          </p>
        </div>

        {/* Decorative blurs */}
        <div aria-hidden className="absolute top-0 right-0 w-64 h-64 bg-tertiary-fixed-dim/5 rounded-full blur-3xl pointer-events-none" />
        <div aria-hidden className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
      </section>
    </main>
  );
}
