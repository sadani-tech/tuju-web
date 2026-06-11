"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,82,202,0.08),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(0,245,212,0.06),transparent_50%)]"
      />
      <div className="relative z-10 w-full max-w-md glass-card rounded-lg shadow-navy p-8">
        <p className="text-headline-md font-bold text-primary mb-6">Tuju</p>
        <h1 className="text-headline-md text-primary mb-2">Daftar ke Tuju</h1>
        <p className="text-on-surface-variant mb-6">Mulai temukan jalur hidupmu</p>

        {error && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-md text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Nama Lengkap", key: "name", type: "text" },
            { label: "Email", key: "email", type: "email" },
            { label: "Password", key: "password", type: "password" },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block font-label text-label-sm uppercase text-on-surface-variant mb-2">{label}</label>
              <input
                type={type}
                required
                className="input-tuju"
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-secondary hover:bg-secondary-container text-on-secondary text-button font-semibold rounded-md transition disabled:opacity-50"
          >
            {loading ? "Mendaftar..." : "Daftar Gratis"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-secondary font-medium hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
