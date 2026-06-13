"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, Mail, Lock, ArrowRight } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authApi.login(form);
      setAuth(res.data.user, res.data.access_token);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || "Gagal masuk. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden bg-[radial-gradient(circle_at_2px_2px,rgba(0,35,102,0.05)_1px,transparent_0)] [background-size:32px_32px]">
      {/* Decorative pathway graphic */}
      <div aria-hidden className="absolute inset-0 z-0 pointer-events-none opacity-20 hidden md:block">
        <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
          <path
            className="text-secondary"
            d="M-100,500 C200,600 400,200 800,400 C1200,600 1400,100 1800,300"
            fill="none"
            stroke="currentColor"
            strokeDasharray="10 10"
            strokeWidth="2"
          />
          <path
            className="text-tertiary-fixed"
            d="M-100,600 C300,700 500,300 900,500 C1300,700 1500,200 1900,400"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      </div>

      <main className="w-full max-w-md px-4 md:px-0 z-10 relative">
        <div className="glass-card rounded-xl shadow-navy p-8 md:p-10 flex flex-col gap-8 relative overflow-hidden">
          {/* Accent strip */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-secondary to-tertiary-fixed" />

          {/* Header */}
          <div className="text-center flex flex-col gap-4">
            <div className="mx-auto w-16 h-16 bg-primary-container rounded-md flex items-center justify-center shadow-inner">
              <Compass className="w-9 h-9 text-on-primary-container" />
            </div>
            <div>
              <h1 className="text-headline-md text-primary mb-2">Masuk ke Tuju</h1>
              <p className="text-body-md text-on-surface-variant">
                Selamat datang kembali, mari lanjutkan penjelajahanmu.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-error-container text-on-error-container rounded-md text-sm">{error}</div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-label-sm text-on-surface-variant ml-1" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="nama@email.com"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-md py-3 pl-10 pr-4 text-body-md text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label text-label-sm text-on-surface-variant ml-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-md py-3 pl-10 pr-4 text-body-md text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary hover:bg-secondary-container text-on-secondary text-button py-3 rounded-md transition-all shadow-navy-sm hover:shadow-navy mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Masuk..." : "Masuk"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer */}
          <div className="text-center">
            <p className="text-body-md text-on-surface-variant">
              Belum punya akun?{" "}
              <Link href="/register" className="text-secondary font-semibold hover:text-secondary-container transition-colors">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
