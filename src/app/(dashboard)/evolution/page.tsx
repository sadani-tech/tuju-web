"use client";
import { useEffect, useState } from "react";
import { evolutionApi } from "@/lib/api";
import type { EvolutionEvent, EvolutionSummary } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const SPECIAL_TYPES = new Set([
  "level_up", "streak_milestone", "streak",
  "milestone_updated", "profile_completed", "onboarding_completed",
]);

const EVENT_BG: Record<string, string> = {
  profile_update:       "bg-blue-50    border-blue-100",
  report_generated:     "bg-purple-50  border-purple-100",
  report_viewed:        "bg-purple-50  border-purple-100",
  task_completed:       "bg-green-50   border-green-100",
  chat_session:         "bg-indigo-50  border-indigo-100",
  level_up:             "bg-amber-50   border-amber-300",
  streak_milestone:     "bg-orange-50  border-orange-300",
  streak:               "bg-orange-50  border-orange-300",
  document_uploaded:    "bg-slate-50   border-slate-200",
  milestone_updated:    "bg-yellow-50  border-yellow-300",
  profile_completed:    "bg-blue-50    border-blue-300",
  onboarding_completed: "bg-green-50   border-green-300",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
  );
}

function SkeletonItem() {
  return (
    <div className="flex gap-4 animate-pulse">
      <div className="w-10 h-10 bg-slate-200 rounded-full flex-shrink-0 mt-1" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3 bg-slate-200 rounded w-1/4" />
        <div className="h-4 bg-slate-200 rounded w-3/4" />
      </div>
    </div>
  );
}

const LIMIT = 20;

export default function EvolutionPage() {
  const [events, setEvents]       = useState<EvolutionEvent[]>([]);
  const [summary, setSummary]     = useState<EvolutionSummary | null>(null);
  const [loading, setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]     = useState(true);
  const [offset, setOffset]       = useState(LIMIT);

  useEffect(() => {
    Promise.all([
      evolutionApi.list({ limit: LIMIT, offset: 0 }),
      evolutionApi.summary(),
    ]).then(([listRes, summaryRes]) => {
      setEvents(listRes.data);
      setSummary(summaryRes.data);
      setHasMore(listRes.data.length === LIMIT);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await evolutionApi.list({ limit: LIMIT, offset });
      setEvents((prev) => [...prev, ...res.data]);
      setHasMore(res.data.length === LIMIT);
      setOffset((o) => o + LIMIT);
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Perjalananmu ✨</h1>
        <p className="text-slate-500 text-sm mt-1">
          Timeline semua aktivitas dan pencapaianmu di Tuju
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: "🎯", label: "Total Aktivitas", value: summary?.total_events ?? 0 },
            { icon: "⭐", label: "Total Poin",       value: `${summary?.total_points_earned ?? 0} pts` },
            { icon: "🔥", label: "Streak",           value: `${summary?.current_streak ?? 0} hari` },
            { icon: "✅", label: "Task Selesai",     value: summary?.tasks_completed ?? 0 },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className="text-lg font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200 pointer-events-none" />

        {loading ? (
          <div className="space-y-4 pl-14">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} />)}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 pl-10">
            <p className="text-4xl mb-3">🌱</p>
            <p className="font-semibold text-slate-700">Mulai perjalananmu!</p>
            <p className="text-sm text-slate-500 mt-1">
              Lengkapi profil untuk aktivitas pertama
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const isSpecial = SPECIAL_TYPES.has(event.event_type);
              const bgClass   = EVENT_BG[event.event_type] ?? "bg-white border-slate-200";
              return (
                <div key={event.id} className="flex gap-4">
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 text-lg ${bgClass} ${isSpecial ? "shadow-md" : ""}`}
                  >
                    {event.icon}
                  </div>
                  <div className={`flex-1 border rounded-xl p-3 ${bgClass}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400 mb-0.5">{formatDate(event.created_at)}</p>
                        <p className={`text-sm leading-snug ${isSpecial ? "font-semibold text-slate-800" : "text-slate-700"}`}>
                          {event.description}
                        </p>
                      </div>
                      {event.points_earned > 0 && (
                        <span className="text-xs font-bold text-amber-600 flex-shrink-0 mt-0.5 whitespace-nowrap">
                          +{event.points_earned} pts
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Load more */}
      {hasMore && !loading && events.length > 0 && (
        <div className="text-center pt-2">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="bg-white border border-slate-200 hover:border-blue-300 text-slate-700 rounded-xl px-6 py-2.5 text-sm font-medium transition inline-flex items-center gap-2"
          >
            {loadingMore ? <><LoadingSpinner size="sm" /> Memuat...</> : "Muat lebih banyak"}
          </button>
        </div>
      )}
    </div>
  );
}
