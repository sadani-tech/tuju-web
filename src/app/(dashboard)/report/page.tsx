"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { reportApi, authApi } from "@/lib/api";
import {
  LifePathReport,
  MeResponse,
  LayeredOutput,
  RecommendationItem,
  MajorResult,
  TrackResult,
} from "@/types";
import { ProfessionCard } from "@/components/report/ProfessionCard";
import { MajorCard } from "@/components/report/MajorCard";
import { TrackCard } from "@/components/report/TrackCard";
import { PillBadge } from "@/components/ui/PillBadge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type PageState = "loading" | "no_report" | "generating" | "done" | "failed";

export default function ReportPage() {
  const [state, setState] = useState<PageState>("loading");
  const [me, setMe] = useState<MeResponse | null>(null);
  const [report, setReport] = useState<LifePathReport | null>(null);
  const [layered, setLayered] = useState<LayeredOutput | null>(null);
  const [generatingMsg, setGeneratingMsg] = useState(0);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generatingMessages = [
    "Menganalisis profil kamu...",
    "Rule engine memproses 28 profesi...",
    "AI sedang menulis rekomendasimu...",
  ];

  const fetchLayered = async () => {
    try {
      const res = await reportApi.getLayered();
      setLayered(res.data);
    } catch {
      // ignore — layered is optional
    }
  };

  const startPolling = (id: string) => {
    const poll = async () => {
      try {
        const s = await reportApi.getStatus(id);
        if (s.data.status === "done") {
          const r = await reportApi.getLatest();
          setReport(r.data);
          setState("done");
          fetchLayered();
        } else if (s.data.status === "failed") {
          setState("failed");
        } else {
          pollRef.current = setTimeout(poll, 3000);
        }
      } catch {
        setState("failed");
      }
    };
    poll();
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("tuju_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }
    }

    authApi.me().then((r) => setMe(r.data)).catch(() => {});

    reportApi
      .getLatest()
      .then((r) => {
        setReport(r.data);
        setState("done");
        fetchLayered();
      })
      .catch(() => {
        setState("no_report");
      });

    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state !== "generating") return;
    const interval = setInterval(() => {
      setGeneratingMsg((m) => (m + 1) % generatingMessages.length);
    }, 2500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const handleGenerate = async () => {
    setState("generating");
    setGeneratingMsg(0);
    try {
      const res = await reportApi.generate();
      const id = res.data.report_id;
      startPolling(id);
    } catch {
      setState("failed");
    }
  };

  const segment = me?.segment || "mahasiswa";
  const isProfessionSegment = ["mahasiswa", "fresh_grad", "career_switcher"].includes(segment);

  // State: Loading
  if (state === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // State: No Report
  if (state === "no_report") {
    return (
      <div className="p-6 max-w-2xl mx-auto flex items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-4">
          <p className="text-5xl">🎯</p>
          <h2 className="text-2xl font-bold text-slate-900">
            Kamu belum punya Life Path Report
          </h2>
          <p className="text-slate-500">
            Generate report untuk melihat rekomendasi jalur hidupmu berdasarkan
            profil yang sudah diisi
          </p>
          <button
            onClick={handleGenerate}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-8 py-3 font-semibold transition text-lg"
          >
            Generate Report Sekarang ✨
          </button>
        </div>
      </div>
    );
  }

  // State: Generating
  if (state === "generating") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center space-y-6 max-w-sm">
          <LoadingSpinner size="lg" />
          <div className="space-y-3">
            {generatingMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 transition-opacity ${
                  i <= generatingMsg ? "opacity-100" : "opacity-30"
                }`}
              >
                <span className="text-lg">
                  {i < generatingMsg ? "✅" : i === generatingMsg ? "🔄" : "⏳"}
                </span>
                <p className="text-slate-700 font-medium">{msg}</p>
              </div>
            ))}
          </div>
          <p className="text-slate-400 text-sm">Biasanya butuh 30-60 detik...</p>
        </div>
      </div>
    );
  }

  // State: Failed
  if (state === "failed") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-4xl">😔</p>
          <h2 className="text-xl font-bold text-slate-900">Gagal membuat report</h2>
          <button
            onClick={handleGenerate}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 py-3 font-medium transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // State: Done
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Life Path Report</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Versi {report?.version} &middot;{" "}
            {report?.generated_at
              ? new Date(report.generated_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "-"}
          </p>
        </div>
        <button
          onClick={handleGenerate}
          className="border border-slate-200 hover:border-blue-300 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition"
        >
          🔄 Refresh Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Profile Summary */}
        <div className="md:col-span-4 space-y-4">
          {report?.strengths && report.strengths.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-semibold text-slate-900 mb-3">⚡ Kekuatan Kamu</h3>
              <div className="flex flex-wrap gap-2">
                {report.strengths.map((s, i) => (
                  <PillBadge key={i} variant="green">
                    {s}
                  </PillBadge>
                ))}
              </div>
            </div>
          )}

          {report?.areas_to_grow && report.areas_to_grow.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-semibold text-slate-900 mb-3">🌱 Area Berkembang</h3>
              <div className="flex flex-wrap gap-2">
                {report.areas_to_grow.map((a, i) => (
                  <PillBadge key={i} variant="amber">
                    {a}
                  </PillBadge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Narrative + Recommendations */}
        <div className="md:col-span-8 space-y-4">
          {report?.ai_narrative && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-slate-900 mb-3">
                  🤖 Analisis Personal
                </h3>
                <div className="text-slate-700 leading-relaxed text-[15px] whitespace-pre-line">
                  {report.ai_narrative}
                </div>
              </div>
            </div>
          )}

          {/* Profession segment */}
          {isProfessionSegment && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900">🎯 Top Profesi Untukmu</h3>
              {(report?.recommendations || []).map((item, i) => (
                <ProfessionCard
                  key={item.profession_id || i}
                  item={item}
                  rank={item.rank || i + 1}
                />
              ))}
            </div>
          )}

          {/* Layered output for SMA/SMP */}
          {!isProfessionSegment && layered && (
            <div className="space-y-6">
              {layered.layers.map((layer) => (
                <div key={layer.layer}>
                  <h3 className="font-semibold text-slate-900 mb-3">
                    {layer.layer === 1
                      ? "🎯"
                      : layer.layer === 2
                      ? "📚"
                      : "💼"}{" "}
                    {layer.label}
                  </h3>
                  <div className="space-y-3">
                    {layer.type === "profession" &&
                      (layer.items as RecommendationItem[]).map((item, i) => (
                        <ProfessionCard
                          key={i}
                          item={item as RecommendationItem}
                          rank={(item as RecommendationItem).rank || i + 1}
                        />
                      ))}
                    {layer.type === "university_major" &&
                      (layer.items as MajorResult[]).map((item, i) => (
                        <MajorCard
                          key={i}
                          item={item as MajorResult}
                          rank={(item as MajorResult).rank || i + 1}
                        />
                      ))}
                    {layer.type === "highschool_track" &&
                      (layer.items as TrackResult[]).map((item, i) => (
                        <TrackCard
                          key={i}
                          item={item as TrackResult}
                          rank={(item as TrackResult).rank || i + 1}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fallback: non-profession segment without layered data */}
          {!isProfessionSegment && !layered && report?.recommendations && (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900">🎯 Rekomendasi</h3>
              {report.recommendations.map((item, i) => (
                <ProfessionCard
                  key={i}
                  item={item}
                  rank={item.rank || i + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Chat CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white text-center space-y-2">
        <p className="font-semibold text-lg">Mau tahu lebih lanjut tentang profesi ini?</p>
        <p className="text-blue-200 text-sm">
          Chat langsung dengan AI yang berperan sebagai profesional di bidang itu
        </p>
        <Link
          href="/chat"
          className="inline-block mt-2 bg-white text-blue-600 font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition text-sm"
        >
          💬 Chat dengan AI Expert →
        </Link>
      </div>
    </div>
  );
}
