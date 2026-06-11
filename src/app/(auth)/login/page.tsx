"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,82,202,0.08),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(0,245,212,0.06),transparent_50%)]"
      />
      <div className="relative z-10 w-full max-w-md glass-card rounded-lg shadow-navy p-8">
        <p className="text-headline-md font-bold text-primary mb-6">Tuju</p>
        <h1 className="text-headline-md text-primary mb-2">Masuk ke Tuju</h1>
        <p className="text-on-surface-variant mb-6">Lanjutkan perjalananmu</p>

        {error && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-md text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-label text-label-sm uppercase text-on-surface-variant mb-2">Email</label>
            <input
              type="email"
              required
              className="input-tuju"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-label text-label-sm uppercase text-on-surface-variant mb-2">Password</label>
            <input
              type="password"
              required
              className="input-tuju"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-secondary hover:bg-secondary-container text-on-secondary text-button font-semibold rounded-md transition disabled:opacity-50"
          >
            {loading ? "Masuk..." : "Masuk"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          Belum punya akun?{" "}
          <Link href="/register" className="text-secondary font-medium hover:underline">
            Daftar gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
