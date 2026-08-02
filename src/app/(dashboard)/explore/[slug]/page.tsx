"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Star,
  BarChart3,
  GraduationCap,
  BookOpen,
  Link2,
  AlertTriangle,
  Wallet,
  Target,
} from "lucide-react";
import { professionsApi } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type WorkStyleBreakdown = Record<string, number>;

type ProfessionDetail = {
  id: string;
  slug: string;
  name: string;
  category: string;
  emoji: string | null;
  description: string | null;
  notes: string | null;
  riasec_primary: string;
  riasec_secondary: string;
  riasec_tertiary: string | null;
  interest_domains: string[] | null;
  academic_requirements: Record<string, { level: string; threshold: number }> | null;
  work_style_ideal: WorkStyleBreakdown | null;
  work_style_labels: Record<string, string>;
  personality_ideal: Record<string, number> | null;
  cost_level: string | null;
  education_years_min: number;
  salary_min: number | null;
  salary_max: number | null;
  education_paths: string[] | null;
  similar_professions: string[] | null;
  similar_professions_detail: { slug: string; name: string; emoji: string | null; category: string }[];
  relevant_for_segments: string[] | null;
  hard_prerequisites: Record<string, number> | null;
  user_match_score?: number;
  user_match_breakdown?: {
    riasec: number;
    work_style: number;
    interests: number;
    academic: number;
    personality: number;
    goals: number;
  };
};

const COST_LEVEL_LABELS: Record<string, string> = {
  rendah: "Biaya Rendah",
  menengah: "Biaya Menengah",
  tinggi: "Biaya Tinggi",
  sangat_tinggi: "Biaya Sangat Tinggi",
};

const COST_LEVEL_COLORS: Record<string, string> = {
  rendah: "bg-tertiary-fixed/20 text-on-tertiary-fixed-variant border-tertiary-fixed-dim/30",
  menengah: "bg-amber-50 text-amber-700 border-amber-200",
  tinggi: "bg-error-container/60 text-on-error-container border-error-container",
  sangat_tinggi: "bg-error-container text-on-error-container border-error/30",
};

const LEVEL_COLORS: Record<string, string> = {
  H: "bg-error-container/60 text-on-error-container border-error-container",
  M: "bg-amber-100 text-amber-700 border-amber-200",
  L: "bg-tertiary-fixed/20 text-on-tertiary-fixed-variant border-tertiary-fixed-dim/30",
};

const WORK_STYLE_CONFIG: Record<string, { icon: string; low: string; high: string }> = {
  people_orientation: { icon: "👥", low: "Solo", high: "Banyak Orang" },
  structure:          { icon: "📋", low: "Fleksibel", high: "Terstruktur" },
  environment:        { icon: "🌿", low: "Indoor", high: "Outdoor" },
  collaboration:      { icon: "🤝", low: "Solo", high: "Tim" },
  stress_tolerance:   { icon: "⚡", low: "Stabil", high: "High Pressure" },
  variety:            { icon: "🔄", low: "Rutinitas", high: "Variasi" },
};

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return "Bervariasi";
  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(0)} juta` : `${Math.round(n / 1_000)} ribu`;
  if (min && max) return `Rp${fmt(min)} – Rp${fmt(max)}/bulan`;
  if (max) return `s/d Rp${fmt(max)}/bulan`;
  return `ab Rp${fmt(min!)}/bulan`;
}

function ScoreBar({ label, value, max, color = "bg-secondary" }: { label: string; value: number; max: number; color?: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-on-surface-variant w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-surface-container rounded-full h-2 overflow-hidden">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-on-surface w-14 text-right flex-shrink-0">
        {value.toFixed(1)}/{max}
      </span>
    </div>
  );
}

export default function ProfessionDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [prof, setProf] = useState<ProfessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    professionsApi.detail(slug)
      .then((res) => setProf(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !prof) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center py-20">
        <p className="text-4xl mb-4">😕</p>
        <p className="font-semibold text-on-surface">Profesi tidak ditemukan</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-secondary text-sm hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
      </div>
    );
  }

  const workStyleEntries = Object.entries(prof.work_style_ideal ?? {}).filter(
    ([key]) => key in WORK_STYLE_CONFIG
  );

  return (
    <div className="p-4 md:p-10 max-w-container mx-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="mb-6 font-label text-label-sm text-secondary hover:underline transition flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column ───────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Section 1 — Hero */}
          <div className="glass-card accent-strip-blue rounded-lg shadow-navy-sm border border-outline-variant/30 p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-white shadow-navy-sm border border-primary-fixed/60 flex items-center justify-center text-4xl flex-shrink-0">
                {prof.emoji || "🎯"}
              </div>
              <div className="min-w-0">
                <h1 className="text-headline-md text-primary mb-2">{prof.name}</h1>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-surface-container text-on-surface-variant px-2.5 py-1 rounded-full">
                    {prof.category}
                  </span>
                  {prof.cost_level && (
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${COST_LEVEL_COLORS[prof.cost_level] ?? "bg-surface-container-low text-on-surface-variant border-outline-variant/30"}`}>
                      {COST_LEVEL_LABELS[prof.cost_level] ?? prof.cost_level}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {prof.description && (
              <p className="text-on-surface-variant text-sm leading-relaxed mb-5">{prof.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Wallet, label: "Estimasi Gaji", value: formatSalary(prof.salary_min, prof.salary_max) },
                { icon: GraduationCap, label: "Pendidikan Min", value: `${prof.education_years_min} tahun` },
                { icon: BarChart3, label: "Tingkat Biaya", value: COST_LEVEL_LABELS[prof.cost_level ?? ""] ?? "Bervariasi" },
                { icon: Target, label: "RIASEC", value: [prof.riasec_primary, prof.riasec_secondary, prof.riasec_tertiary].filter(Boolean).join(" – ") },
              ].map((item) => (
                <div key={item.label} className="bg-surface-container-low rounded-md p-3 border border-outline-variant/20">
                  <p className="font-label text-label-sm text-on-surface-variant mb-0.5 flex items-center gap-1.5">
                    <item.icon className="w-3.5 h-3.5" /> {item.label}
                  </p>
                  <p className="font-semibold text-on-surface text-sm">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2 — Work Style */}
          {workStyleEntries.length > 0 && (
            <div className="glass-card rounded-lg shadow-navy-sm border border-outline-variant/30 p-6 md:p-8">
              <h2 className="font-bold text-primary mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-secondary" /> Profil Gaya Kerja
              </h2>
              <div className="space-y-4">
                {workStyleEntries.map(([dim, val]) => {
                  const cfg = WORK_STYLE_CONFIG[dim];
                  const pct = Math.round(val * 100);
                  return (
                    <div key={dim}>
                      <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1">
                        <span>{cfg.icon} {cfg.low}</span>
                        <span className="font-medium text-on-surface">{pct}%</span>
                        <span>{cfg.high}</span>
                      </div>
                      <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-secondary to-tertiary-fixed-dim h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3 — Jalur Pendidikan */}
          {prof.education_paths && prof.education_paths.length > 0 && (
            <div className="glass-card rounded-lg shadow-navy-sm border border-outline-variant/30 p-6 md:p-8">
              <h2 className="font-bold text-primary mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-secondary" /> Jalur Pendidikan
              </h2>
              <div className="space-y-3">
                {prof.education_paths.map((path, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-tertiary-fixed-dim flex-shrink-0 mt-0.5" />
                      {i < prof.education_paths!.length - 1 && (
                        <div className="w-0.5 border-l-2 border-dashed border-primary/30 flex-1 my-1" />
                      )}
                    </div>
                    <p className="text-sm text-on-surface pb-3">{String(path)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4 — Mata Pelajaran Kunci */}
          {prof.academic_requirements && Object.keys(prof.academic_requirements).length > 0 && (
            <div className="glass-card rounded-lg shadow-navy-sm border border-outline-variant/30 p-6 md:p-8">
              <h2 className="font-bold text-primary mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-secondary" /> Mata Pelajaran Kunci
              </h2>
              <p className="font-label text-label-sm text-on-surface-variant mb-4">
                H = Tinggi (≥75) · M = Sedang (≥70) · L = Dasar (≥65)
              </p>

              {/* Hard prerequisites banner */}
              {prof.hard_prerequisites && Object.keys(prof.hard_prerequisites).length > 0 && (
                <div className="flex items-start gap-2 bg-error-container/50 border border-error-container rounded-md p-3 mb-4">
                  <AlertTriangle className="w-4 h-4 text-on-error-container flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-on-error-container">
                    <span className="font-semibold">Prasyarat Wajib:</span>{" "}
                    {Object.entries(prof.hard_prerequisites)
                      .map(([subj, score]) => `${subj} ≥${score}`)
                      .join(" dan ")}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {Object.entries(prof.academic_requirements).map(([subj, req]) => (
                  <span
                    key={subj}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium ${LEVEL_COLORS[req.level] ?? "bg-surface-container text-on-surface-variant border-outline-variant/30"}`}
                  >
                    {subj.charAt(0).toUpperCase() + subj.slice(1)} {req.level}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section 5 — Profesi Serupa */}
          {prof.similar_professions_detail.length > 0 && (
            <div className="glass-card rounded-lg shadow-navy-sm border border-outline-variant/30 p-6 md:p-8">
              <h2 className="font-bold text-primary mb-4 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-secondary" /> Profesi Serupa
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {prof.similar_professions_detail.map((sim) => (
                  <Link
                    key={sim.slug}
                    href={`/explore/${sim.slug}`}
                    className="flex-shrink-0 bg-surface-container-low hover:bg-primary-fixed/20 hover:border-secondary border border-outline-variant/30 rounded-md p-3 text-center transition min-w-[120px]"
                  >
                    <div className="text-3xl mb-1">{sim.emoji || "🎯"}</div>
                    <p className="text-xs font-medium text-on-surface leading-tight">{sim.name}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{sim.category.split(" & ")[0]}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right column (sticky on desktop) ─────────── */}
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">

          {/* Chat CTA */}
          <div className="glass-card accent-strip-purple rounded-lg shadow-navy-sm border border-outline-variant/30 p-6 space-y-4">
            <div>
              <p className="font-bold text-primary mb-1 flex items-center gap-2">
                <Bot className="w-5 h-5 text-accent-purple" /> Chat dengan AI Expert
              </p>
              <p className="text-sm text-on-surface-variant">
                Tanya langsung ke AI yang berperan sebagai{" "}
                <span className="font-medium text-on-surface">{prof.name}</span> ini.
              </p>
            </div>
            <Link
              href={`/chat/${prof.slug}`}
              className="flex items-center justify-center gap-2 w-full text-center bg-secondary hover:bg-secondary-container text-on-secondary text-button py-3 rounded-md transition shadow-navy-sm hover:shadow-navy"
            >
              Mulai Chat Sekarang <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Match score card */}
          {prof.user_match_score !== undefined ? (
            <div className="glass-card accent-strip-teal rounded-lg shadow-navy-sm border border-outline-variant/30 p-6 space-y-4">
              <div>
                <p className="font-bold text-primary mb-1 flex items-center gap-2">
                  <Star className="w-5 h-5 text-tertiary-fixed-dim" /> Kecocokanmu
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-surface-container rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-secondary to-tertiary-fixed-dim h-3 rounded-full transition-all duration-700"
                      style={{ width: `${prof.user_match_score}%` }}
                    />
                  </div>
                  <span className="font-bold text-on-surface text-sm flex-shrink-0">
                    {prof.user_match_score.toFixed(1)}%
                  </span>
                </div>
              </div>
              {prof.user_match_breakdown && (
                <div className="space-y-2">
                  <ScoreBar label="RIASEC" value={prof.user_match_breakdown.riasec} max={30} color="bg-secondary" />
                  <ScoreBar label="Gaya Kerja" value={prof.user_match_breakdown.work_style} max={20} color="bg-accent-purple" />
                  <ScoreBar label="Minat" value={prof.user_match_breakdown.interests} max={20} color="bg-tertiary-fixed-dim" />
                  <ScoreBar label="Akademik" value={prof.user_match_breakdown.academic} max={15} color="bg-amber-400" />
                  <ScoreBar label="Kepribadian" value={prof.user_match_breakdown.personality} max={10} color="bg-primary-container" />
                </div>
              )}
              <Link
                href="/report"
                className="flex items-center justify-center gap-1 w-full text-center text-sm font-semibold text-secondary hover:text-white hover:bg-secondary py-2.5 border border-secondary/30 hover:border-secondary rounded-full transition"
              >
                Lihat Full Report <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="glass-card rounded-lg shadow-navy-sm border border-outline-variant/30 p-6 space-y-3">
              <p className="font-bold text-primary flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-secondary" /> Lihat kecocokanmu
              </p>
              <p className="text-sm text-on-surface-variant">
                Lengkapi profil untuk melihat skor kecocokan dengan profesi ini.
              </p>
              <Link
                href="/profile"
                className="flex items-center justify-center gap-1 w-full text-center text-sm font-semibold text-secondary hover:text-white hover:bg-secondary py-2.5 border border-secondary/30 hover:border-secondary rounded-full transition"
              >
                Lengkapi Profil <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Quick info */}
          <div className="bg-surface-container-low rounded-lg border border-outline-variant/30 p-4 space-y-2">
            <p className="font-label text-label-sm font-semibold text-on-surface-variant uppercase tracking-wide mb-2">
              Info Cepat
            </p>
            {prof.interest_domains && prof.interest_domains.length > 0 && (
              <div>
                <p className="text-xs text-on-surface-variant mb-1">Domain Minat</p>
                <div className="flex flex-wrap gap-1">
                  {prof.interest_domains.map((d) => (
                    <span key={d} className="text-xs bg-white border border-outline-variant/30 text-on-surface-variant px-2 py-0.5 rounded-full">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {prof.relevant_for_segments && prof.relevant_for_segments.length > 0 && (
              <div>
                <p className="text-xs text-on-surface-variant mb-1">Cocok untuk</p>
                <div className="flex flex-wrap gap-1">
                  {prof.relevant_for_segments.map((s) => (
                    <span key={s} className="text-xs bg-primary-fixed/30 text-on-primary-fixed border border-primary-fixed px-2 py-0.5 rounded-full capitalize">
                      {s.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
