"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { authApi, reportApi, chatApi, pointsApi, roadmapApi, evolutionApi } from "@/lib/api";
import type {
  MeResponse, LifePathReport, ChatSession,
  PointsBalance, RoadmapResponse, EvolutionSummary,
} from "@/types";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PillBadge } from "@/components/ui/PillBadge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { toast } from "@/components/ui/Toast";
import { showPointsGain } from "@/components/gamification/PointsToast";
import { usePointsStore, getLevelInfo } from "@/store/pointsStore";

export default function DashboardPage() {
  const [me, setMe]                       = useState<MeResponse | null>(null);
  const [report, setReport]               = useState<LifePathReport | null>(null);
  const [chatSessions, setChatSessions]   = useState<ChatSession[]>([]);
  const [points, setPoints]               = useState<PointsBalance | null>(null);
  const [roadmap, setRoadmap]             = useState<RoadmapResponse | null>(null);
  const [evoSummary, setEvoSummary]       = useState<EvolutionSummary | null>(null);
  const [loading, setLoading]             = useState(true);
  const [completingTask, setCompletingTask] = useState<string | null>(null);

  const { setPoints: storeSetPoints, addPoints: storeAddPoints } = usePointsStore();

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("tuju_token")) {
      window.location.href = "/login";
      return;
    }
    Promise.all([
      authApi.me().catch(() => null),
      reportApi.getLatest().catch(() => null),
      chatApi.getSessions(20, 0).catch(() => null),
      pointsApi.get().catch(() => null),
      roadmapApi.get().catch(() => null),
      evolutionApi.summary().catch(() => null),
    ]).then(([meRes, reportRes, chatRes, pointsRes, roadmapRes, evoRes]) => {
      if (!meRes) { window.location.href = "/login"; return; }
      setMe(meRes.data);
      setReport(reportRes?.data ?? null);
      setChatSessions(chatRes?.data ?? []);
      if (pointsRes?.data) {
        setPoints(pointsRes.data);
        storeSetPoints(pointsRes.data);
      }
      setRoadmap(roadmapRes?.data ?? null);
      setEvoSummary(evoRes?.data ?? null);
    }).finally(() => setLoading(false));
  }, []);

  const handleCompleteTask = useCallback(async (taskId: string) => {
    if (!roadmap || completingTask) return;
    const prevRoadmap = roadmap;

    setRoadmap((r) => r ? {
      ...r,
      layers: r.layers.map((l) => ({
        ...l,
        tasks: l.tasks.map((t) =>
          t.id === taskId ? { ...t, status: "completed" as const } : t
        ),
      })),
    } : r);
    setCompletingTask(taskId);

    try {
      const res = await roadmapApi.completeTask(taskId);
      const { points_awarded, level_changed, new_level, unlocked_tasks } = res.data;
      storeAddPoints(points_awarded);
      setPoints((p) => p ? { ...p, total_points: p.total_points + points_awarded } : p);
      showPointsGain(points_awarded, level_changed && new_level ? { level: new_level } : undefined);
      if (unlocked_tasks?.length > 0) toast("🔓 Layer baru terbuka!", "info");
      roadmapApi.get().then((r) => setRoadmap(r.data)).catch(() => {});
    } catch {
      setRoadmap(prevRoadmap);
      toast("Gagal menyelesaikan task", "error");
    } finally {
      setCompletingTask(null);
    }
  }, [roadmap, completingTask]);

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-200 rounded" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-slate-200 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const totalPts      = points?.total_points ?? me?.total_points ?? 0;
  const levelInfo     = getLevelInfo(totalPts);
  const currentStreak = points?.current_streak ?? 0;
  const availableTasks = roadmap?.layers
    .flatMap((l) => l.tasks)
    .filter((t) => t.status === "available")
    .slice(0, 3) ?? [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Halo, {me?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {me?.segment ? `Segmen: ${me.segment.replace("_", " ")}` : "Selamat datang di Tuju"}
        </p>
      </div>

      {(me?.completeness_pct ?? 0) < 30 && (
        <Link href="/profile" className="block bg-blue-600 hover:bg-blue-500 transition text-white rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Lengkapi profilmu dulu! 📋</p>
              <p className="text-blue-200 text-sm">Rekomendasi akan semakin akurat dengan profil lengkap</p>
            </div>
            <span className="text-xl">→</span>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Profile */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Profil</h2>
            {me?.is_verified && <PillBadge variant="green">Verified ✦</PillBadge>}
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600">{me?.completeness_pct ?? 0}%</p>
            <p className="text-sm text-slate-500 mt-1">Kelengkapan profil</p>
          </div>
          <ProgressBar value={me?.completeness_pct ?? 0} color="bg-blue-500" height="h-2.5" />
          <Link href="/profile" className="block text-center text-sm text-blue-600 font-medium hover:underline">
            Lengkapi sekarang →
          </Link>
        </div>

        {/* Points & Level */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <h2 className="font-semibold text-slate-900">Poin &amp; Level</h2>
          <div>
            <p className="text-4xl font-bold text-amber-500">{totalPts.toLocaleString("id")}</p>
            <p className="text-sm text-slate-500 mt-0.5">total poin</p>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className={i < levelInfo.stars ? "text-amber-400" : "text-slate-200"}>★</span>
            ))}
            <span className="text-sm font-medium text-slate-700 ml-2">{levelInfo.name}</span>
            {currentStreak >= 3 && (
              <span className="ml-auto text-xs font-semibold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full whitespace-nowrap">
                🔥 {currentStreak} hari
              </span>
            )}
          </div>
          <ProgressBar value={levelInfo.progress} color="bg-amber-400" height="h-1.5" />
          <p className="text-xs text-slate-500">
            {levelInfo.nextName
              ? `Butuh ${points?.points_to_next_level ?? Math.max(0, (levelInfo.nextMin ?? 0) - totalPts)} poin lagi untuk ${levelInfo.nextName}`
              : "Level tertinggi! 🏆"}
          </p>
          <Link href="/points" className="block text-center text-xs text-blue-600 font-medium hover:underline">
            Lihat Poin &amp; Reward →
          </Link>
        </div>

        {/* Report */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <h2 className="font-semibold text-slate-900">Life Path Report</h2>
          {!report && (
            <div className="text-center py-4">
              <p className="text-2xl mb-2">🎯</p>
              <p className="text-sm text-slate-600 mb-3">Belum ada report</p>
              <Link href="/report" className="inline-block bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 py-2 text-sm font-medium transition">
                Generate Report →
              </Link>
            </div>
          )}
          {report?.status === "done" && (
            <div className="space-y-2">
              {(report.recommendations || []).slice(0, 3).map((rec, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-4">#{rec.rank}</span>
                  <span className="text-sm font-medium text-slate-800 flex-1 truncate">{rec.profession_name}</span>
                  <span className={`text-xs font-bold ${rec.score >= 80 ? "text-green-600" : "text-blue-600"}`}>
                    {rec.score.toFixed(0)}%
                  </span>
                </div>
              ))}
              <Link href="/report" className="block text-center text-sm text-blue-600 font-medium hover:underline pt-1">
                Lihat Report Lengkap →
              </Link>
            </div>
          )}
          {report && report.status !== "done" && (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <LoadingSpinner size="sm" />
              <span>Report sedang dibuat...</span>
            </div>
          )}
        </div>
      </div>

      {/* Roadmap aktif */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">🗺️ Roadmap Aktif</h2>
          <Link href="/roadmap" className="text-xs text-blue-600 font-medium hover:underline">
            Lihat Semua →
          </Link>
        </div>
        {!roadmap && (
          <p className="text-sm text-slate-500 text-center py-4">
            Roadmap belum tersedia. Selesaikan onboarding terlebih dahulu.
          </p>
        )}
        {roadmap && availableTasks.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4">
            🎉 Semua task tersedia sudah diselesaikan!
          </p>
        )}
        {roadmap && availableTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 transition"
          >
            <button
              onClick={() => handleCompleteTask(task.id)}
              disabled={!!completingTask}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${
                completingTask === task.id
                  ? "border-blue-300 bg-blue-100 cursor-wait"
                  : "border-slate-300 hover:border-blue-400"
              }`}
            >
              {completingTask === task.id && (
                <span className="text-blue-500 text-xs leading-none">✓</span>
              )}
            </button>
            <span className="flex-1 text-sm text-slate-700">{task.title}</span>
            <span className="text-xs font-semibold text-amber-600">+{task.points_reward} pts</span>
          </div>
        ))}
      </div>

      {/* Self Discovery Stats */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h2 className="font-semibold text-slate-900 mb-4">✨ Self Discovery Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: "💬",
              label: "Sesi AI Chat",
              value: evoSummary?.chat_sessions ?? chatSessions.length,
            },
            {
              icon: "🎯",
              label: "Profesi di-explore",
              value: `${new Set(chatSessions.map((s) => s.profession.id)).size} dari 28`,
            },
            {
              icon: "✅",
              label: "Task selesai",
              value: `${roadmap?.total_progress?.completed ?? evoSummary?.tasks_completed ?? 0} dari ${roadmap?.total_progress?.total ?? 15}`,
            },
            {
              icon: "🔥",
              label: "Login streak",
              value: `${currentStreak} hari`,
            },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-3 bg-slate-50 rounded-xl">
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="text-lg font-bold text-slate-800">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
