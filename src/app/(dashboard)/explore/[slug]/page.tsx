"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { professionsApi } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ProgressBar } from "@/components/ui/ProgressBar";

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
  rendah: "bg-green-50 text-green-700 border-green-200",
  menengah: "bg-amber-50 text-amber-700 border-amber-200",
  tinggi: "bg-red-50 text-red-700 border-red-200",
  sangat_tinggi: "bg-red-100 text-red-800 border-red-300",
};

const LEVEL_COLORS: Record<string, string> = {
  H: "bg-red-100 text-red-700 border-red-200",
  M: "bg-amber-100 text-amber-700 border-amber-200",
  L: "bg-green-100 text-green-700 border-green-200",
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

function ScoreBar({ label, value, max, color = "bg-blue-500" }: { label: string; value: number; max: number; color?: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-600 w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-slate-700 w-14 text-right flex-shrink-0">
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
        <p className="font-semibold text-slate-700">Profesi tidak ditemukan</p>
        <button onClick={() => router.back()} className="mt-4 text-blue-600 text-sm hover:underline">
          ← Kembali
        </button>
      </div>
    );
  }

  const workStyleEntries = Object.entries(prof.work_style_ideal ?? {}).filter(
    ([key]) => key in WORK_STYLE_CONFIG
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="mb-4 text-sm text-slate-500 hover:text-blue-600 transition flex items-center gap-1"
      >
        ← Kembali
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column ───────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Section 1 — Hero */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="text-6xl leading-none flex-shrink-0">{prof.emoji || "🎯"}</div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-slate-900">{prof.name}</h1>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                    {prof.category}
                  </span>
                  {prof.cost_level && (
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${COST_LEVEL_COLORS[prof.cost_level] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}>
                      {COST_LEVEL_LABELS[prof.cost_level] ?? prof.cost_level}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {prof.description && (
              <p className="text-slate-600 text-sm leading-relaxed mb-5">{prof.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-0.5">💰 Estimasi Gaji</p>
                <p className="font-semibold text-slate-800 text-sm">{formatSalary(prof.salary_min, prof.salary_max)}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-0.5">🎓 Pendidikan Min</p>
                <p className="font-semibold text-slate-800 text-sm">{prof.education_years_min} tahun</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-0.5">📊 Tingkat Biaya</p>
                <p className="font-semibold text-slate-800 text-sm">
                  {COST_LEVEL_LABELS[prof.cost_level ?? ""] ?? "Bervariasi"}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-0.5">🎯 RIASEC</p>
                <p className="font-semibold text-slate-800 text-sm">
                  {[prof.riasec_primary, prof.riasec_secondary, prof.riasec_tertiary].filter(Boolean).join(" – ")}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2 — Work Style */}
          {workStyleEntries.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 mb-4">📊 Profil Gaya Kerja</h2>
              <div className="space-y-4">
                {workStyleEntries.map(([dim, val]) => {
                  const cfg = WORK_STYLE_CONFIG[dim];
                  const pct = Math.round(val * 100);
                  return (
                    <div key={dim}>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>{cfg.icon} {cfg.low}</span>
                        <span className="font-medium text-slate-700">{pct}%</span>
                        <span>{cfg.high}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
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
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 mb-4">🎓 Jalur Pendidikan</h2>
              <div className="space-y-3">
                {prof.education_paths.map((path, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0 mt-0.5" />
                      {i < prof.education_paths!.length - 1 && (
                        <div className="w-0.5 bg-slate-200 flex-1 my-1" />
                      )}
                    </div>
                    <p className="text-sm text-slate-700 pb-3">{String(path)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4 — Mata Pelajaran Kunci */}
          {prof.academic_requirements && Object.keys(prof.academic_requirements).length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 mb-2">📚 Mata Pelajaran Kunci</h2>
              <p className="text-xs text-slate-500 mb-4">
                H = Tinggi (≥75) · M = Sedang (≥70) · L = Dasar (≥65)
              </p>

              {/* Hard prerequisites banner */}
              {prof.hard_prerequisites && Object.keys(prof.hard_prerequisites).length > 0 && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <span className="text-red-500 flex-shrink-0">⚠️</span>
                  <p className="text-sm text-red-700">
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
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium ${LEVEL_COLORS[req.level] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}
                  >
                    {subj.charAt(0).toUpperCase() + subj.slice(1)} {req.level}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section 5 — Profesi Serupa */}
          {prof.similar_professions_detail.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 mb-4">🔗 Profesi Serupa</h2>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {prof.similar_professions_detail.map((sim) => (
                  <Link
                    key={sim.slug}
                    href={`/explore/${sim.slug}`}
                    className="flex-shrink-0 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-xl p-3 text-center transition min-w-[120px]"
                  >
                    <div className="text-3xl mb-1">{sim.emoji || "🎯"}</div>
                    <p className="text-xs font-medium text-slate-800 leading-tight">{sim.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{sim.category.split(" & ")[0]}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right column (sticky on desktop) ─────────── */}
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">

          {/* Chat CTA */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div>
              <p className="font-bold text-slate-900 mb-1">🤖 Chat dengan AI Expert</p>
              <p className="text-sm text-slate-500">
                Tanya langsung ke AI yang berperan sebagai <span className="font-medium text-slate-700">{prof.name}</span> ini.
              </p>
            </div>
            <Link
              href={`/chat/${prof.slug}`}
              className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl text-sm transition"
            >
              Mulai Chat Sekarang →
            </Link>
          </div>

          {/* Match score card */}
          {prof.user_match_score !== undefined ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div>
                <p className="font-bold text-slate-900 mb-1">⭐ Kecocokanmu</p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-amber-400 h-3 rounded-full transition-all duration-700"
                      style={{ width: `${prof.user_match_score}%` }}
                    />
                  </div>
                  <span className="font-bold text-slate-800 text-sm flex-shrink-0">
                    {prof.user_match_score.toFixed(1)}%
                  </span>
                </div>
              </div>
              {prof.user_match_breakdown && (
                <div className="space-y-2">
                  <ScoreBar label="RIASEC" value={prof.user_match_breakdown.riasec} max={30} color="bg-blue-500" />
                  <ScoreBar label="Gaya Kerja" value={prof.user_match_breakdown.work_style} max={20} color="bg-violet-500" />
                  <ScoreBar label="Minat" value={prof.user_match_breakdown.interests} max={20} color="bg-green-500" />
                  <ScoreBar label="Akademik" value={prof.user_match_breakdown.academic} max={15} color="bg-amber-500" />
                  <ScoreBar label="Kepribadian" value={prof.user_match_breakdown.personality} max={10} color="bg-pink-500" />
                </div>
              )}
              <Link
                href="/report"
                className="block w-full text-center text-sm font-medium text-blue-600 hover:text-white hover:bg-blue-600 py-2.5 border border-blue-200 hover:border-blue-600 rounded-xl transition"
              >
                Lihat Full Report →
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              <p className="font-bold text-slate-900">📊 Lihat kecocokanmu</p>
              <p className="text-sm text-slate-500">
                Lengkapi profil untuk melihat skor kecocokan dengan profesi ini.
              </p>
              <Link
                href="/profile"
                className="block w-full text-center text-sm font-medium text-blue-600 hover:text-white hover:bg-blue-600 py-2.5 border border-blue-200 hover:border-blue-600 rounded-xl transition"
              >
                Lengkapi Profil →
              </Link>
            </div>
          )}

          {/* Quick info */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Info Cepat</p>
            {prof.interest_domains && prof.interest_domains.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Domain Minat</p>
                <div className="flex flex-wrap gap-1">
                  {prof.interest_domains.map((d) => (
                    <span key={d} className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {prof.relevant_for_segments && prof.relevant_for_segments.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Cocok untuk</p>
                <div className="flex flex-wrap gap-1">
                  {prof.relevant_for_segments.map((s) => (
                    <span key={s} className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full capitalize">
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
