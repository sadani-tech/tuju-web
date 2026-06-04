"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { authApi, reportApi, chatApi } from "@/lib/api";
import { MeResponse, LifePathReport, ChatSession } from "@/types";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PillBadge } from "@/components/ui/PillBadge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const LEVELS = [
  { name: "Pemula", min: 0, max: 199, stars: 1 },
  { name: "Penjelajah", min: 200, max: 499, stars: 2 },
  { name: "Pencari Jati Diri", min: 500, max: 999, stars: 3 },
  { name: "Pejuang Impian", min: 1000, max: 1999, stars: 4 },
  { name: "Arsitek Hidupku", min: 2000, max: Infinity, stars: 5 },
];

function getLevelInfo(pts: number) {
  const lvl = LEVELS.find((l) => pts >= l.min && pts <= l.max) || LEVELS[0];
  const nextLvl = LEVELS[LEVELS.indexOf(lvl) + 1];
  const progress = nextLvl
    ? ((pts - lvl.min) / (nextLvl.min - lvl.min)) * 100
    : 100;
  return { ...lvl, progress, nextMin: nextLvl?.min ?? lvl.max };
}

export default function DashboardPage() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [report, setReport] = useState<LifePathReport | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [reportLoading, setReportLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("tuju_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }
    }

    authApi
      .me()
      .then((r) => setMe(r.data))
      .catch(() => {
        if (typeof window !== "undefined") window.location.href = "/login";
      })
      .finally(() => setLoading(false));

    reportApi
      .getLatest()
      .then((r) => setReport(r.data))
      .catch(() => setReport(null))
      .finally(() => setReportLoading(false));

    chatApi
      .getSessions(20, 0)
      .then((r) => setChatSessions(r.data))
      .catch(() => {});
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-200 rounded" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const levelInfo = getLevelInfo(me?.total_points ?? 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Halo, {me?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {me?.segment
              ? `Segmen: ${me.segment.replace("_", " ")}`
              : "Selamat datang di Tuju"}
          </p>
        </div>
      </div>

      {/* Low completeness banner */}
      {(me?.completeness_pct ?? 0) < 30 && (
        <Link
          href="/profile"
          className="block bg-blue-600 hover:bg-blue-500 transition text-white rounded-2xl p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Lengkapi profilmu dulu! 📋</p>
              <p className="text-blue-200 text-sm">
                Rekomendasi akan semakin akurat dengan profil lengkap
              </p>
            </div>
            <span className="text-white text-xl">→</span>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Widget 1: Completeness */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Profil</h2>
            {me?.is_verified && (
              <PillBadge variant="green">Profile Verified ✦</PillBadge>
            )}
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600">
              {me?.completeness_pct ?? 0}%
            </p>
            <p className="text-sm text-slate-500 mt-1">Kelengkapan profil</p>
          </div>
          <ProgressBar
            value={me?.completeness_pct ?? 0}
            color="bg-blue-500"
            height="h-2.5"
          />
          <Link
            href="/profile"
            className="block text-center text-sm text-blue-600 font-medium hover:underline"
          >
            Lengkapi sekarang →
          </Link>
        </div>

        {/* Widget 2: Points */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <h2 className="font-semibold text-slate-900">Poin &amp; Level</h2>
          <div>
            <p className="text-4xl font-bold text-amber-500">
              {me?.total_points ?? 0}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">total poin</p>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                className={i < levelInfo.stars ? "text-amber-400" : "text-slate-200"}
              >
                ★
              </span>
            ))}
            <span className="text-sm font-medium text-slate-700 ml-2">
              {me?.current_level ?? "Pemula"}
            </span>
          </div>
          <ProgressBar
            value={levelInfo.progress}
            color="bg-amber-400"
            height="h-1.5"
          />
          <p className="text-xs text-slate-500">
            {levelInfo.nextMin !== Infinity
              ? `${levelInfo.nextMin - (me?.total_points ?? 0)} poin lagi ke level berikutnya`
              : "Level tertinggi! 🏆"}
          </p>
        </div>

        {/* Widget 3: Report Preview */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <h2 className="font-semibold text-slate-900">Life Path Report</h2>

          {reportLoading && (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <LoadingSpinner size="sm" />
              <span>Memuat report...</span>
            </div>
          )}

          {!reportLoading && !report && (
            <div className="text-center py-4">
              <p className="text-2xl mb-2">🎯</p>
              <p className="text-sm text-slate-600 mb-3">Belum ada report</p>
              <Link
                href="/report"
                className="inline-block bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 py-2 text-sm font-medium transition"
              >
                Generate Report →
              </Link>
            </div>
          )}

          {!reportLoading && report && report.status === "done" && (
            <div className="space-y-2">
              {(report.recommendations || []).slice(0, 3).map((rec, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-4">#{rec.rank}</span>
                  <span className="text-sm font-medium text-slate-800 flex-1 truncate">
                    {rec.profession_name}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      rec.score >= 80 ? "text-green-600" : "text-blue-600"
                    }`}
                  >
                    {rec.score.toFixed(0)}%
                  </span>
                </div>
              ))}
              <Link
                href="/report"
                className="block text-center text-sm text-blue-600 font-medium hover:underline pt-1"
              >
                Lihat Report Lengkap →
              </Link>
            </div>
          )}

          {!reportLoading && report && report.status !== "done" && (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <LoadingSpinner size="sm" />
              <span>Report sedang dibuat...</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: "/profile", icon: "📋", label: "Profil", disabled: false },
          { href: "/report", icon: "🎯", label: "Report", disabled: false },
          { href: "/roadmap", icon: "🗺️", label: "Roadmap", disabled: true },
          { href: "/chat", icon: "🤖", label: "AI Expert", disabled: false },
        ].map((item) => (
          <div key={item.href} className="relative">
            <Link
              href={item.disabled ? "#" : item.href}
              className={`flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-200 transition ${
                item.disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:border-blue-300 hover:shadow-sm"
              }`}
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-sm font-medium text-slate-700">
                {item.label}
              </span>
              {item.disabled && (
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                  Soon
                </span>
              )}
            </Link>
          </div>
        ))}
      </div>

      {/* Last chat session shortcut */}
      {chatSessions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
              {chatSessions[0].profession.emoji || "🤖"}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                💬 Sesi AI Chat: {chatSessions.length} sesi
              </p>
              <p className="text-xs text-slate-500">
                Terakhir: {chatSessions[0].profession.name}
              </p>
            </div>
          </div>
          <Link
            href={`/chat/${chatSessions[0].profession.slug}?session=${chatSessions[0].session_id}`}
            className="text-xs font-medium text-blue-600 border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded-lg transition flex-shrink-0"
          >
            Lanjutkan →
          </Link>
        </div>
      )}
    </div>
  );
}
