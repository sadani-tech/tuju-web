"use client";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Star, Flame, Target, TrendingUp, Trophy, Zap } from "lucide-react";
import { evolutionApi } from "@/lib/api";
import type { EvolutionEvent, EvolutionSummary } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const SPECIAL_TYPES = new Set([
  "level_up", "streak_milestone", "streak",
  "milestone_updated", "profile_completed", "onboarding_completed",
]);

// Accent (ring + points chip) per event type — teal / blue / purple per mockup
const EVENT_ACCENT: Record<string, { ring: string; chip: string; hover: string }> = {
  task_completed:       { ring: "border-tertiary-fixed-dim text-on-tertiary-container", chip: "bg-tertiary-fixed-dim/10 text-on-tertiary-container border-tertiary-fixed-dim/20", hover: "hover:border-l-tertiary-fixed-dim" },
  onboarding_completed: { ring: "border-tertiary-fixed-dim text-on-tertiary-container", chip: "bg-tertiary-fixed-dim/10 text-on-tertiary-container border-tertiary-fixed-dim/20", hover: "hover:border-l-tertiary-fixed-dim" },
  profile_completed:    { ring: "border-tertiary-fixed-dim text-on-tertiary-container", chip: "bg-tertiary-fixed-dim/10 text-on-tertiary-container border-tertiary-fixed-dim/20", hover: "hover:border-l-tertiary-fixed-dim" },
  profile_update:       { ring: "border-secondary-container text-secondary",            chip: "bg-secondary-container/10 text-secondary border-secondary-container/20",            hover: "hover:border-l-secondary-container" },
  report_generated:     { ring: "border-secondary-container text-secondary",            chip: "bg-secondary-container/10 text-secondary border-secondary-container/20",            hover: "hover:border-l-secondary-container" },
  report_viewed:        { ring: "border-secondary-container text-secondary",            chip: "bg-secondary-container/10 text-secondary border-secondary-container/20",            hover: "hover:border-l-secondary-container" },
  document_uploaded:    { ring: "border-secondary-container text-secondary",            chip: "bg-secondary-container/10 text-secondary border-secondary-container/20",            hover: "hover:border-l-secondary-container" },
  chat_session:         { ring: "border-accent-purple text-accent-purple",              chip: "bg-accent-purple/10 text-accent-purple border-accent-purple/20",                    hover: "hover:border-l-accent-purple" },
  level_up:             { ring: "border-accent-purple text-accent-purple",              chip: "bg-accent-purple/10 text-accent-purple border-accent-purple/20",                    hover: "hover:border-l-accent-purple" },
  streak_milestone:     { ring: "border-accent-purple text-accent-purple",              chip: "bg-accent-purple/10 text-accent-purple border-accent-purple/20",                    hover: "hover:border-l-accent-purple" },
  streak:               { ring: "border-accent-purple text-accent-purple",              chip: "bg-accent-purple/10 text-accent-purple border-accent-purple/20",                    hover: "hover:border-l-accent-purple" },
  milestone_updated:    { ring: "border-secondary-container text-secondary",            chip: "bg-secondary-container/10 text-secondary border-secondary-container/20",            hover: "hover:border-l-secondary-container" },
};

const DEFAULT_ACCENT = { ring: "border-outline-variant text-on-surface-variant", chip: "bg-surface-container text-on-surface-variant border-outline-variant/30", hover: "hover:border-l-secondary-container" };

function formatDate(iso: string) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
  );
}

function monthLabel(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

function SkeletonItem() {
  return (
    <div className="flex gap-6 animate-pulse">
      <div className="w-12 h-12 bg-surface-container-high rounded-full flex-shrink-0 mt-1" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3 bg-surface-container-high rounded w-1/4" />
        <div className="h-4 bg-surface-container-high rounded w-3/4" />
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

  // Group consecutive events under month markers, mockup-style
  const grouped = useMemo(() => {
    const groups: { month: string; items: EvolutionEvent[] }[] = [];
    for (const event of events) {
      const month = monthLabel(event.created_at);
      const last = groups[groups.length - 1];
      if (last && last.month === month) last.items.push(event);
      else groups.push({ month, items: [event] });
    }
    return groups;
  }, [events]);

  const stats = [
    {
      icon: Target, label: "Total Aktivitas", value: summary?.total_events ?? 0,
      strip: "border-l-secondary-container", tint: "", accent: "text-secondary",
      note: "Terus jelajahi jalurmu", noteIcon: TrendingUp,
    },
    {
      icon: Star, label: "Total Poin", value: `${summary?.total_points_earned ?? 0} pts`,
      strip: "border-l-tertiary-fixed-dim", tint: "bg-tertiary-fixed-dim/5", accent: "text-on-tertiary-container",
      note: "Setiap langkah dihitung", noteIcon: Trophy,
    },
    {
      icon: Flame, label: "Streak", value: `${summary?.current_streak ?? 0} hari`,
      strip: "border-l-accent-purple", tint: "bg-accent-purple/5", accent: "text-accent-purple",
      note: "Jaga momentumnya!", noteIcon: Zap,
    },
    {
      icon: CheckCircle2, label: "Task Selesai", value: summary?.tasks_completed ?? 0,
      strip: "border-l-secondary-container", tint: "", accent: "text-secondary",
      note: "Selangkah lebih dekat", noteIcon: TrendingUp,
    },
  ];

  return (
    <div className="p-4 md:p-10 max-w-container mx-auto w-full">
      {/* Page header */}
      <div className="mb-12">
        <h2 className="text-display-lg-mobile md:text-display-lg text-gradient mb-4">
          Perjalananmu Sejauh Ini
        </h2>
        <p className="text-body-lg text-on-surface-variant max-w-2xl">
          Riwayat lengkap milestone, aktivitas, dan poin yang kamu kumpulkan di sepanjang
          jalur terpandumu.
        </p>
      </div>

      {/* Stats bento grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-surface-container-high animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16">
          {stats.map((s) => (
            <div
              key={s.label}
              className={`glass-card p-5 md:p-6 rounded-lg relative overflow-hidden border-l-4 shadow-navy-sm transition-shadow hover:shadow-navy ${s.strip} ${s.tint}`}
            >
              <div className={`absolute top-0 right-0 p-4 opacity-10 ${s.accent}`}>
                <s.icon className="w-14 h-14" />
              </div>
              <p className="font-label text-label-sm text-on-surface-variant uppercase tracking-wider mb-2 font-semibold">
                {s.label}
              </p>
              <h3 className="text-3xl md:text-4xl font-bold text-primary mb-1">{s.value}</h3>
              <p className={`text-sm flex items-center gap-1 font-medium ${s.accent}`}>
                <s.noteIcon className="w-3.5 h-3.5" />
                {s.note}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Section title */}
      <div className="flex items-center gap-4 mb-8">
        <h3 className="text-headline-md text-primary">Timeline Aktivitas</h3>
        <div className="flex-1 h-px bg-outline-variant/30" />
      </div>

      {/* Vertical timeline */}
      <div className="max-w-3xl mx-auto md:pl-8 relative">
        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} />)}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🌱</p>
            <p className="font-semibold text-on-surface">Mulai perjalananmu!</p>
            <p className="text-sm text-on-surface-variant mt-1">
              Lengkapi profil untuk aktivitas pertama
            </p>
          </div>
        ) : (
          grouped.map((group, gi) => (
            <div key={`${group.month}-${gi}`}>
              {/* Month marker */}
              <div className={`mb-8 relative z-10 ${gi > 0 ? "mt-14" : ""}`}>
                <span className="bg-white border border-outline-variant/50 text-primary font-label text-label-sm py-1.5 px-4 rounded-full uppercase tracking-widest shadow-navy-sm font-semibold">
                  {group.month}
                </span>
              </div>

              {group.items.map((event, i) => {
                const isSpecial = SPECIAL_TYPES.has(event.event_type);
                const accent = EVENT_ACCENT[event.event_type] ?? DEFAULT_ACCENT;
                const isLastOverall =
                  gi === grouped.length - 1 && i === group.items.length - 1;
                return (
                  <div key={event.id} className="relative flex gap-6 mb-10 group">
                    {/* Node + connector */}
                    <div className="flex-shrink-0 mt-1 relative z-10">
                      {!isLastOverall && (
                        <div className="absolute top-12 -bottom-10 left-1/2 -translate-x-1/2 w-0.5 bg-surface-container-highest -z-10" />
                      )}
                      <div
                        className={`w-12 h-12 rounded-full bg-white border-2 flex items-center justify-center text-lg shadow-navy-sm transition-colors duration-300 ${accent.ring}`}
                      >
                        {event.icon}
                      </div>
                    </div>
                    {/* Card */}
                    <div
                      className={`glass-card flex-1 p-5 md:p-6 rounded-lg shadow-navy-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-navy border-l-4 border-l-transparent ${accent.hover}`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-outline font-semibold uppercase tracking-wider">
                            {formatDate(event.created_at)}
                          </span>
                          <p className={`mt-1 leading-snug ${isSpecial ? "font-semibold text-primary" : "text-on-surface"}`}>
                            {event.description}
                          </p>
                        </div>
                        {event.points_earned > 0 && (
                          <div className={`font-bold px-4 py-1.5 rounded-full text-sm border shadow-navy-sm flex-shrink-0 ${accent.chip}`}>
                            +{event.points_earned} pts
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}

        {/* Load more */}
        {hasMore && !loading && events.length > 0 && (
          <div className="text-center pt-8 pb-12">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="text-button text-secondary border-2 border-secondary rounded-full px-8 py-2.5 hover:bg-secondary hover:text-white transition-colors duration-300 bg-transparent font-semibold shadow-navy-sm inline-flex items-center gap-2 disabled:opacity-50"
            >
              {loadingMore ? <><LoadingSpinner size="sm" /> Memuat...</> : "Muat Lebih Banyak"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
