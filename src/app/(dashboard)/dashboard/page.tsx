"use client";
import { useEffect, useState } from "react";
import { profileApi, reportApi, pointsApi } from "@/lib/api";
import Link from "next/link";

export default function DashboardPage() {
  const [completeness, setCompleteness] = useState<{ total: number } | null>(null);
  const [points, setPoints] = useState<{ total_points: number; current_level: string } | null>(null);

  useEffect(() => {
    profileApi.getCompleteness().then((r) => setCompleteness(r.data)).catch(() => {});
    pointsApi.get().then((r) => setPoints(r.data)).catch(() => {});
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Profile Completeness */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Kelengkapan Profil</p>
          <p className="text-3xl font-bold text-blue-600">{completeness?.total ?? "—"}%</p>
          <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${completeness?.total ?? 0}%` }}
            />
          </div>
          <Link href="/profile" className="text-xs text-blue-500 mt-2 block hover:underline">
            Lengkapi sekarang →
          </Link>
        </div>

        {/* Points */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Total Poin</p>
          <p className="text-3xl font-bold text-amber-500">{points?.total_points ?? "—"}</p>
          <p className="text-sm text-slate-500 mt-1">{points?.current_level ?? "Pemula"}</p>
          <Link href="/points" className="text-xs text-blue-500 mt-2 block hover:underline">
            Tukar poin →
          </Link>
        </div>

        {/* Quick action */}
        <div className="bg-blue-600 rounded-2xl p-5 text-white shadow-sm">
          <p className="text-sm text-blue-200 mb-1">Life Path Report</p>
          <p className="font-semibold mb-3">Temukan jalur terbaikmu</p>
          <Link
            href="/report"
            className="inline-block px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition"
          >
            Lihat Report →
          </Link>
        </div>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: "/roadmap", icon: "🗺️", label: "Roadmap" },
          { href: "/explore", icon: "🔍", label: "Eksplorasi" },
          { href: "/chat", icon: "🤖", label: "AI Expert" },
          { href: "/profile", icon: "👤", label: "Profil" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-300 hover:shadow-sm transition flex flex-col items-center gap-2"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-sm font-medium text-slate-700">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
