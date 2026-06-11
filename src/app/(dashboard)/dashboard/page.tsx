"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Medal,
  Stars,
  ArrowRight,
  ArrowUpRight,
  Check,
  Briefcase,
  MessageSquare,
  Target,
  CheckCircle2,
  Flame,
} from "lucide-react";
import { authApi, reportApi, chatApi, pointsApi, roadmapApi, evolutionApi } from "@/lib/api";
import type {
  MeResponse, LifePathReport, ChatSession,
  PointsBalance, RoadmapResponse, EvolutionSummary,
} from "@/types";
import { PillBadge } from "@/components/ui/PillBadge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { toast } from "@/components/ui/Toast";
import { showPointsGain } from "@/components/gamification/PointsToast";
import { usePointsStore, getLevelInfo } from "@/store/pointsStore";

function CompletenessRing({ pct }: { pct: number }) {
  return (
    <svg viewBox="0 0 36 36" className="w-36 h-36">
      <path
        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        fill="none"
        stroke="#e0e3e5"
        strokeWidth="3"
      />
      <path
        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        fill="none"
        stroke="#00dfc1"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${Math.max(0, Math.min(100, pct))}, 100`}
      />
      <text
        x="18"
        y="20.85"
        textAnchor="middle"
        className="fill-primary"
        style={{ fontSize: "8px", fontWeight: 700 }}
      >
        {pct}%
      </text>
    </svg>
  );
}

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
      <div className="p-4 md:p-10 max-w-container mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-72 bg-surface-container-high rounded" />
          <div className="grid grid-cols-3 gap-gutter">
            {[1, 2, 3].map((i) => <div key={i} className="h-64 bg-surface-container-high rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  const totalPts      = points?.total_points ?? me?.total_points ?? 0;
  const levelInfo     = getLevelInfo(totalPts);
  const currentStreak = points?.current_streak ?? 0;
  const allTasks       = roadmap?.layers.flatMap((l) => l.tasks) ?? [];
  const lastCompleted  = allTasks.filter((t) => t.status === "completed").slice(-1)[0];
  const availableTasks = allTasks.filter((t) => t.status === "available").slice(0, 2);
  const nextLocked     = allTasks.find((t) => t.status !== "completed" && t.status !== "available");

  return (
    <div className="p-4 md:p-10 max-w-container mx-auto space-y-gutter">
      {/* Header */}
      <header>
        <h1 className="text-display-lg-mobile md:text-display-lg text-primary mb-2">
          Ringkasan Perjalananmu
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          {me?.name ? `Halo, ${me.name.split(" ")[0]} — lanjutkan langkahmu menuju karir impian.` : "Lanjutkan langkahmu menuju karir impian."}
        </p>
      </header>

      {(me?.completeness_pct ?? 0) < 30 && (
        <Link
          href="/profile"
          className="block bg-primary-container hover:bg-primary transition-colors text-on-primary rounded-lg p-4 shadow-navy"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">Lengkapi profilmu dulu!</p>
              <p className="text-primary-fixed-dim text-sm">Rekomendasi akan semakin akurat dengan profil lengkap</p>
            </div>
            <ArrowRight className="w-5 h-5 shrink-0" />
          </div>
        </Link>
      )}

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {/* Widget 1 — Profile completeness */}
        <div className="glass-card accent-strip-teal rounded-lg p-6 flex flex-col shadow-navy-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-headline-md text-primary">Profil Kamu</h2>
            {me?.is_verified && <PillBadge variant="green">Verified ✦</PillBadge>}
          </div>
          <p className="text-on-surface-variant text-sm mb-4">
            Lengkapi profil untuk rekomendasi yang lebih akurat.
          </p>
          <div className="flex-1 flex items-center justify-center mb-6">
            <CompletenessRing pct={me?.completeness_pct ?? 0} />
          </div>
          <Link
            href="/profile"
            className="block w-full bg-secondary text-on-secondary text-button font-semibold py-3 rounded-md text-center hover:bg-secondary-container transition-colors shadow-sm"
          >
            Lengkapi Sekarang
          </Link>
        </div>

        {/* Widget 2 — Status (points & level) */}
        <div className="glass-card rounded-lg p-6 flex flex-col justify-between shadow-navy-sm bg-gradient-to-br from-surface to-surface-container-high border-t-4 border-secondary">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-headline-md text-primary">Status Kamu</h2>
              <Medal className="w-8 h-8 text-secondary" />
            </div>
            <div className="mb-4">
              <p className="font-label text-label-sm uppercase text-on-surface-variant mb-1">Level saat ini</p>
              <p className="text-display-lg-mobile text-primary">{levelInfo.name}</p>
              <div className="flex items-center gap-1 mt-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={i < levelInfo.stars ? "text-amber-400" : "text-outline-variant"}>★</span>
                ))}
                {currentStreak >= 3 && (
                  <span className="ml-auto inline-flex items-center gap-1 font-label text-label-sm bg-error-container text-on-error-container px-2 py-0.5 rounded-full whitespace-nowrap">
                    <Flame className="w-3 h-3" /> {currentStreak} hari
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant mt-2">
                {levelInfo.nextName
                  ? `Butuh ${points?.points_to_next_level ?? Math.max(0, (levelInfo.nextMin ?? 0) - totalPts)} poin lagi untuk ${levelInfo.nextName}`
                  : "Level tertinggi! 🏆"}
              </p>
            </div>
          </div>
          <Link
            href="/points"
            className="bg-surface-container-highest rounded-md p-4 flex items-center justify-between hover:bg-surface-container-high transition-colors"
          >
            <div>
              <p className="font-label text-label-sm uppercase text-on-surface-variant">Total Poin</p>
              <p className="text-headline-md text-secondary font-bold">{totalPts.toLocaleString("id")}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-tertiary-fixed-dim/20 flex items-center justify-center text-on-tertiary-container">
              <Stars className="w-5 h-5" />
            </div>
          </Link>
        </div>

        {/* Widget 3 — Active roadmap */}
        <div className="glass-card accent-strip-purple rounded-lg p-6 flex flex-col shadow-navy-sm md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-headline-md text-primary">Roadmap Aktif</h2>
            <Link href="/roadmap" className="text-secondary hover:text-primary transition-colors">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          {!roadmap && (
            <p className="text-sm text-on-surface-variant text-center py-4">
              Roadmap belum tersedia. Selesaikan onboarding terlebih dahulu.
            </p>
          )}
          {roadmap && !lastCompleted && availableTasks.length === 0 && (
            <p className="text-sm text-on-surface-variant text-center py-4">
              🎉 Semua task tersedia sudah diselesaikan!
            </p>
          )}
          {roadmap && (
            <div className="relative flex-1">
              {/* Pathway line */}
              <div className="absolute left-[11px] top-2 bottom-2 border-l-2 border-dashed border-outline-variant/50" />
              <ul className="space-y-5 relative z-10">
                {lastCompleted && (
                  <li className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-tertiary-fixed-dim flex items-center justify-center shrink-0 mt-1 ring-4 ring-background">
                      <Check className="w-3.5 h-3.5 text-on-tertiary-fixed" />
                    </div>
                    <div>
                      <p className="text-sm line-through text-outline">{lastCompleted.title}</p>
                      <p className="font-label text-label-sm text-on-surface-variant">Selesai</p>
                    </div>
                  </li>
                )}
                {availableTasks.map((task, idx) => (
                  <li key={task.id} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 shadow-md mt-1 ring-4 ring-background">
                      <div className="w-2 h-2 rounded-full bg-on-secondary" />
                    </div>
                    <div className={`w-full ${idx === 0 ? "bg-primary-fixed/30 p-3 rounded-md border border-primary-fixed" : ""}`}>
                      <p className={`text-sm text-primary ${idx === 0 ? "font-bold" : ""}`}>{task.title}</p>
                      <p className="font-label text-label-sm text-on-surface-variant">+{task.points_reward} pts</p>
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        disabled={!!completingTask}
                        className="mt-2 font-label text-label-sm text-secondary hover:underline flex items-center gap-1 disabled:opacity-50"
                      >
                        {completingTask === task.id ? "Menyimpan..." : "Tandai Selesai"}
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
                {nextLocked && (
                  <li className="flex items-start gap-4 opacity-50">
                    <div className="w-6 h-6 rounded-full bg-surface-variant shrink-0 mt-1 ring-4 ring-background" />
                    <div>
                      <p className="text-sm text-on-surface">{nextLocked.title}</p>
                      <p className="font-label text-label-sm text-on-surface-variant">Terkunci</p>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Widget 4 — Career recommendations preview */}
        <div className="glass-card rounded-lg p-6 md:col-span-2 lg:col-span-3 border border-outline-variant/30 shadow-navy-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-headline-md text-primary mb-1">Rekomendasi Karir (Preview)</h2>
              <p className="text-on-surface-variant text-sm">Berdasarkan minat dan bakat sementara Anda.</p>
            </div>
            <Link
              href="/report"
              className="px-4 py-2 border border-secondary text-secondary text-button font-semibold rounded-md hover:bg-secondary/5 transition-colors flex items-center gap-2"
            >
              Lihat Laporan Penuh <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {!report && (
            <div className="text-center py-6">
              <Target className="w-8 h-8 text-outline mx-auto mb-2" />
              <p className="text-sm text-on-surface-variant mb-3">Belum ada report</p>
              <Link
                href="/report"
                className="inline-block bg-secondary text-on-secondary rounded-md px-4 py-2 text-sm font-semibold hover:bg-secondary-container transition"
              >
                Generate Report →
              </Link>
            </div>
          )}
          {report && report.status !== "done" && (
            <div className="flex items-center justify-center gap-2 text-on-surface-variant text-sm py-6">
              <LoadingSpinner size="sm" />
              <span>Report sedang dibuat...</span>
            </div>
          )}
          {report?.status === "done" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(report.recommendations || []).slice(0, 3).map((rec) => (
                <Link
                  key={rec.rank}
                  href="/report"
                  className="bg-surface-container-low rounded-md p-4 border border-outline-variant/20 hover:border-secondary/50 transition-colors group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-secondary/10 rounded text-secondary group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <span className="bg-tertiary-fixed-dim/20 text-on-tertiary-fixed-variant font-label text-label-sm px-2 py-1 rounded-full font-bold">
                      {rec.score.toFixed(0)}% Match
                    </span>
                  </div>
                  <h3 className="text-body-lg font-bold text-on-surface mb-2">{rec.profession_name}</h3>
                  <span className="bg-surface-variant text-on-surface-variant text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Peringkat #{rec.rank}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Self Discovery Stats */}
      <div className="glass-card rounded-lg p-6 shadow-navy-sm">
        <h2 className="text-headline-md text-primary mb-4">Self Discovery Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: MessageSquare,
              label: "Sesi AI Chat",
              value: String(evoSummary?.chat_sessions ?? chatSessions.length),
            },
            {
              icon: Target,
              label: "Profesi di-explore",
              value: `${new Set(chatSessions.map((s) => s.profession.id)).size} dari 28`,
            },
            {
              icon: CheckCircle2,
              label: "Task selesai",
              value: `${roadmap?.total_progress?.completed ?? evoSummary?.tasks_completed ?? 0} dari ${roadmap?.total_progress?.total ?? 15}`,
            },
            {
              icon: Flame,
              label: "Login streak",
              value: `${currentStreak} hari`,
            },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 bg-surface-container-low rounded-md">
              <stat.icon className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="text-lg font-bold text-on-surface">{stat.value}</p>
              <p className="font-label text-label-sm text-on-surface-variant mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
