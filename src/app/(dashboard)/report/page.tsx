"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Sparkles, RefreshCw, MessageSquare, ArrowRight, UserSearch, Target } from "lucide-react";
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
        <div className="glass-card rounded-lg shadow-navy p-10 text-center space-y-4">
          <Target className="w-12 h-12 text-secondary mx-auto" />
          <h1 className="text-headline-md text-primary">
            Kamu belum punya Life Path Report
          </h1>
          <p className="text-on-surface-variant">
            Generate report untuk melihat rekomendasi jalur hidupmu berdasarkan
            profil yang sudah diisi
          </p>
          <button
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-container text-on-secondary rounded-md px-8 py-3 text-button font-semibold transition shadow-navy"
          >
            <Sparkles className="w-4 h-4" /> Generate Report Sekarang
          </button>
        </div>
      </div>
    );
  }

  // State: Generating
  if (state === "generating") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
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
                <p className="text-on-surface font-medium">{msg}</p>
              </div>
            ))}
          </div>
          <p className="text-on-surface-variant text-sm">Biasanya butuh 30-60 detik...</p>
        </div>
      </div>
    );
  }

  // State: Failed
  if (state === "failed") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card rounded-lg shadow-navy p-8 text-center space-y-4">
          <p className="text-4xl">😔</p>
          <h1 className="text-headline-md text-primary">Gagal membuat report</h1>
          <button
            onClick={handleGenerate}
            className="bg-secondary hover:bg-secondary-container text-on-secondary rounded-md px-6 py-3 text-button font-semibold transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // State: Done
  return (
    <div className="p-4 md:p-10 max-w-container mx-auto space-y-gutter">
      {/* Header */}
      <header className="text-center max-w-2xl mx-auto">
        <h1 className="text-display-lg-mobile md:text-display-lg text-primary mb-3">
          Life Path Report
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          Analisis mendalam berdasarkan profilmu untuk memandu langkah selanjutnya
          di dunia pendidikan dan karier.
        </p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <span className="font-label text-label-sm text-on-surface-variant">
            Versi {report?.version} ·{" "}
            {report?.generated_at
              ? new Date(report.generated_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "-"}
          </span>
          <button
            onClick={handleGenerate}
            className="inline-flex items-center gap-1.5 border border-outline-variant hover:border-secondary rounded-md px-3 py-1.5 font-label text-label-sm text-on-surface-variant hover:text-secondary transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Report
          </button>
        </div>
      </header>

      {/* Ringkasan Kepribadian */}
      {(report?.ai_narrative || (report?.strengths?.length ?? 0) > 0) && (
        <section className="glass-card accent-strip-teal rounded-lg p-6 md:p-8 shadow-navy-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
              <UserSearch className="w-5 h-5" />
            </div>
            <h2 className="text-headline-md text-primary">Ringkasan Kepribadian</h2>
          </div>
          {report?.ai_narrative && (
            <p className="text-on-surface leading-relaxed text-[15px] whitespace-pre-line mb-6">
              {report.ai_narrative}
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report?.strengths && report.strengths.length > 0 && (
              <div className="bg-surface-container-low rounded-md p-4">
                <p className="font-label text-label-sm uppercase text-on-surface-variant mb-2">Kekuatan Kamu</p>
                <div className="flex flex-wrap gap-2">
                  {report.strengths.map((s, i) => (
                    <PillBadge key={i} variant="green">{s}</PillBadge>
                  ))}
                </div>
              </div>
            )}
            {report?.areas_to_grow && report.areas_to_grow.length > 0 && (
              <div className="bg-surface-container-low rounded-md p-4">
                <p className="font-label text-label-sm uppercase text-on-surface-variant mb-2">Area Berkembang</p>
                <div className="flex flex-wrap gap-2">
                  {report.areas_to_grow.map((a, i) => (
                    <PillBadge key={i} variant="amber">{a}</PillBadge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Rekomendasi */}
      <section>
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-7 h-7 rounded-full bg-secondary text-on-secondary flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <h2 className="text-headline-md text-primary text-center">
            Rekomendasi Jurusan &amp; Profesi
          </h2>
        </div>

        {/* Profession segment */}
        {isProfessionSegment && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
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
          <div className="space-y-8">
            {layered.layers.map((layer) => (
              <div key={layer.layer}>
                <h3 className="font-semibold text-primary mb-3">{layer.label}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {report.recommendations.map((item, i) => (
              <ProfessionCard
                key={i}
                item={item}
                rank={item.rank || i + 1}
              />
            ))}
          </div>
        )}
      </section>

      {/* Langkah Selanjutnya — navy CTA banner */}
      <section className="bg-primary-container rounded-lg p-8 md:p-10 text-center shadow-navy-lg relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,245,212,0.15),transparent_55%)]"
        />
        <div className="relative z-10 space-y-4">
          <h2 className="text-headline-md text-white font-bold">Langkah Selanjutnya</h2>
          <p className="text-primary-fixed text-sm max-w-xl mx-auto">
            Siapkan dirimu untuk mencapai tujuan dengan roadmap khusus yang telah kami buat,
            atau gali lebih dalam lewat AI Expert.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-2 bg-tertiary-fixed-dim text-on-tertiary-fixed font-semibold px-6 py-3 rounded-full hover:bg-tertiary-fixed transition text-sm"
            >
              Lihat Roadmap Penuh <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold px-6 py-3 rounded-full hover:bg-white/10 transition text-sm"
            >
              <MessageSquare className="w-4 h-4" /> Chat dengan AI Expert
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
