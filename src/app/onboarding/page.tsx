"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Compass,
  GraduationCap,
  BookOpen,
  Award,
  Briefcase,
  Split,
  Users,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { authApi, reportApi, roadmapApi } from "@/lib/api";
import { Segment } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const SEGMENTS: { value: string; icon: LucideIcon; strip: string; label: string; desc: string }[] = [
  { value: "smp",             icon: GraduationCap, strip: "accent-strip-teal",   label: "Pelajar SMP",      desc: "Kelas 7-9" },
  { value: "sma",             icon: BookOpen,      strip: "accent-strip-blue",   label: "Pelajar SMA/SMK",  desc: "Kelas 10-12" },
  { value: "mahasiswa",       icon: Award,         strip: "accent-strip-purple", label: "Mahasiswa",        desc: "Sedang kuliah" },
  { value: "fresh_grad",      icon: Briefcase,     strip: "accent-strip-teal",   label: "Fresh Graduate",   desc: "Baru lulus / mencari kerja" },
  { value: "career_switcher", icon: Split,         strip: "accent-strip-blue",   label: "Sudah Bekerja",    desc: "Ingin ganti jalur" },
  { value: "orang_tua",       icon: Users,         strip: "accent-strip-purple", label: "Orang Tua",        desc: "Mendampingi anak" },
];

const INTERESTS = [
  { value: "teknologi",   icon: "💻", label: "Teknologi" },
  { value: "kesehatan",   icon: "🏥", label: "Kesehatan" },
  { value: "bisnis",      icon: "💼", label: "Bisnis" },
  { value: "pendidikan",  icon: "📚", label: "Pendidikan" },
  { value: "sosial",      icon: "🤝", label: "Sosial" },
  { value: "seni",        icon: "🎨", label: "Seni" },
  { value: "olahraga",    icon: "⚽", label: "Olahraga" },
  { value: "sains",       icon: "🔬", label: "Sains" },
  { value: "kreativitas", icon: "✨", label: "Kreativitas" },
];

const PERSONALITY_QUESTIONS = [
  {
    question: "Kamu lebih ke mana?",
    options: [
      { label: "🤫 Introvert", desc: "Lebih nyaman sendiri atau kelompok kecil", value: "introvert" },
      { label: "🗣️ Ekstrovert", desc: "Suka ketemu orang, energi dari interaksi", value: "ekstrovert" },
    ],
  },
  {
    question: "Cara berpikirmu?",
    options: [
      { label: "🔢 Analitis", desc: "Suka angka, logika, data", value: "analitis" },
      { label: "🎭 Kreatif", desc: "Suka ide baru, imajinasi, ekspresi", value: "kreatif" },
    ],
  },
  {
    question: "Kalau ada ketidakpastian...",
    options: [
      { label: "😰 Kurang nyaman", desc: "Prefer semuanya jelas dan terencana", value: "stabil" },
      { label: "💪 Justru suka", desc: "Tantangan itu menarik dan memotivasimu", value: "tantangan" },
    ],
  },
  {
    question: "Dalam memutuskan sesuatu, kamu lebih...",
    options: [
      { label: "💡 Logika & Data", desc: "Analisis fakta sebelum memutuskan", value: "logika" },
      { label: "❤️ Intuisi & Rasa", desc: "Percaya naluri dan perasaan", value: "intuisi" },
    ],
  },
  {
    question: "Yang lebih penting bagimu?",
    options: [
      { label: "🏠 Stabilitas", desc: "Keamanan, kepastian, rutinitas yang nyaman", value: "stabilitas" },
      { label: "🚀 Tantangan", desc: "Growth, hal baru, selalu berkembang", value: "growth" },
    ],
  },
];

interface FormData {
  segment: Segment | "";
  city: string;
  grade: string;
  major_current: string;
  interest_domains: string[];
  personality: Record<string, string>;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pollStatus, setPollStatus] = useState<"idle" | "polling" | "done" | "failed">("idle");
  const [loadingMsg, setLoadingMsg] = useState(0);

  const [form, setForm] = useState<FormData>({
    segment: "",
    city: "",
    grade: "",
    major_current: "",
    interest_domains: [],
    personality: {},
  });

  const progress =
    step === 4 ? 75 + (subStep / 5) * 25 : (step / 4) * 100;

  const toggleInterest = (val: string) => {
    setForm((f) => ({
      ...f,
      interest_domains: f.interest_domains.includes(val)
        ? f.interest_domains.filter((i) => i !== val)
        : [...f.interest_domains, val],
    }));
  };

  const answerPersonality = (qIndex: number, answer: string) => {
    const updatedPersonality = { ...form.personality, [`q${qIndex}`]: answer };
    setForm((f) => ({
      ...f,
      personality: updatedPersonality,
    }));
    if (qIndex < 4) {
      setSubStep(qIndex + 1);
    } else {
      handleSubmit({ ...form, personality: updatedPersonality });
    }
  };

  const handleSubmit = async (finalForm: FormData) => {
    setLoading(true);
    let msgIdx = 0;
    setLoadingMsg(0);
    const msgInterval = setInterval(() => {
      msgIdx = Math.min(msgIdx + 1, 2);
      setLoadingMsg(msgIdx);
    }, 2000);

    try {
      await authApi.onboarding({
        segment: finalForm.segment as Segment,
        city: finalForm.city || undefined,
        interest_domains: finalForm.interest_domains,
      });

      await roadmapApi.init().catch(() => {});
      const res = await reportApi.generate();
      const id = res.data.report_id;
      clearInterval(msgInterval);
      setPollStatus("polling");

      const poll = async () => {
        try {
          const s = await reportApi.getStatus(id);
          if (s.data.status === "done") {
            setPollStatus("done");
            router.push("/dashboard");
          } else if (s.data.status === "failed") {
            setPollStatus("failed");
          } else {
            setTimeout(poll, 3000);
          }
        } catch {
          setPollStatus("failed");
        }
      };
      setTimeout(poll, 3000);
    } catch {
      clearInterval(msgInterval);
      setPollStatus("failed");
      setLoading(false);
    }
  };

  const loadingMessages = [
    "Menganalisis profilmu...",
    "Rule engine memproses 28 profesi...",
    "AI sedang menulis rekomendasimu...",
  ];

  if (loading || pollStatus === "polling") {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center px-4">
        <div className="text-center text-on-primary space-y-6">
          <LoadingSpinner size="lg" />
          <div className="space-y-2">
            {loadingMessages.map((msg, i) => (
              <p
                key={i}
                className={`text-lg transition-opacity duration-500 ${
                  i <= loadingMsg ? "opacity-100" : "opacity-30"
                }`}
              >
                {i < loadingMsg ? "✅" : i === loadingMsg ? "🔄" : "⏳"} {msg}
              </p>
            ))}
          </div>
          <p className="text-primary-fixed-dim text-sm">Ini mungkin butuh 30-60 detik...</p>
        </div>
      </div>
    );
  }

  if (pollStatus === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="glass-card rounded-lg shadow-navy p-8 text-center space-y-4 max-w-md w-full">
          <p className="text-2xl">😔</p>
          <h2 className="text-headline-md text-primary">Gagal membuat report</h2>
          <p className="text-on-surface-variant">Coba lagi setelah beberapa saat</p>
          <button
            onClick={() => {
              setPollStatus("idle");
              setLoading(false);
              setStep(4);
            }}
            className="bg-secondary hover:bg-secondary-container text-on-secondary rounded-md px-6 py-3 text-button font-semibold transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const stepLabel =
    step === 4 ? `Langkah 4 · Pertanyaan ${subStep + 1} dari 5` : `Langkah ${step} dari 4`;

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,245,212,0.06),transparent_50%),radial-gradient(ellipse_at_top_right,rgba(37,82,202,0.06),transparent_55%)]"
      />

      {/* Progress header */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 pt-10">
        <div className="flex items-center justify-between mb-3">
          <span className="font-label text-label-sm text-on-surface-variant">{stepLabel}</span>
          <span className="text-headline-md font-bold text-primary text-base">Tuju</span>
        </div>
        <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
          <div
            className="h-full bg-tertiary-fixed-dim rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="relative z-10 flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-3xl bg-surface-container-low/60 border border-outline-variant/30 rounded-lg shadow-navy p-6 md:p-12">

          {/* STEP 1 — Segment */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center mx-auto mb-6 shadow-navy">
                  <Compass className="w-7 h-7" />
                </div>
                <h1 className="text-display-lg-mobile md:text-display-lg text-primary mb-4">
                  Halo! Aku Tuju.
                </h1>
                <p className="text-body-lg text-on-surface-variant max-w-xl mx-auto">
                  Untuk memberikan rekomendasi jalur terbaik, kamu sekarang berada di fase hidup yang mana?
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SEGMENTS.map((s) => {
                  const selected = form.segment === s.value;
                  return (
                    <button
                      key={s.value}
                      onClick={() =>
                        setForm((f) => ({ ...f, segment: s.value as Segment }))
                      }
                      className={`${s.strip} flex flex-col items-center gap-2 p-6 rounded-md border bg-surface-container-lowest text-center transition shadow-sm hover:shadow-navy ${
                        selected
                          ? "border-secondary ring-2 ring-secondary/30"
                          : "border-outline-variant/40 hover:border-secondary/50"
                      }`}
                    >
                      <s.icon className="w-7 h-7 text-secondary" />
                      <p className="font-semibold text-primary">{s.label}</p>
                      <p className="font-label text-label-sm text-on-surface-variant">{s.desc}</p>
                      {selected && <Check className="w-4 h-4 text-secondary" />}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end">
                <button
                  disabled={!form.segment}
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary-container disabled:opacity-40 text-on-secondary rounded-md px-8 py-3 text-button font-semibold transition"
                >
                  Selanjutnya <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 — Data Dasar */}
          {step === 2 && (
            <div className="space-y-8 max-w-lg mx-auto">
              <div className="text-center">
                <h1 className="text-headline-md md:text-3xl font-bold text-primary mb-2">
                  Cerita tentang kamu
                </h1>
                <p className="text-on-surface-variant">Isi beberapa info dasar dulu</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block font-label text-label-sm uppercase text-on-surface-variant mb-2">
                    Kota domisili
                  </label>
                  <input
                    type="text"
                    placeholder="Jakarta, Bandung, Surabaya..."
                    value={form.city}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, city: e.target.value }))
                    }
                    className="input-tuju"
                  />
                </div>
                {(form.segment === "smp" || form.segment === "sma") && (
                  <div>
                    <label className="block font-label text-label-sm uppercase text-on-surface-variant mb-2">
                      Kelas
                    </label>
                    <select
                      value={form.grade}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, grade: e.target.value }))
                      }
                      className="input-tuju"
                    >
                      <option value="">Pilih kelas</option>
                      {form.segment === "smp" &&
                        ["7", "8", "9"].map((k) => (
                          <option key={k} value={k}>
                            Kelas {k}
                          </option>
                        ))}
                      {form.segment === "sma" &&
                        ["10", "11", "12"].map((k) => (
                          <option key={k} value={k}>
                            Kelas {k}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
                {form.segment === "sma" && (
                  <div>
                    <label className="block font-label text-label-sm uppercase text-on-surface-variant mb-2">
                      Jurusan saat ini
                    </label>
                    <select
                      value={form.major_current}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, major_current: e.target.value }))
                      }
                      className="input-tuju"
                    >
                      <option value="">Pilih jurusan</option>
                      {["IPA", "IPS", "Bahasa", "SMK", "Belum tau"].map((j) => (
                        <option key={j} value={j}>
                          {j}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 inline-flex items-center justify-center gap-2 border-2 border-primary text-primary rounded-md py-3 text-button font-semibold hover:bg-surface-variant transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-container text-on-secondary rounded-md py-3 text-button font-semibold transition"
                >
                  Selanjutnya <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — Minat */}
          {step === 3 && (
            <div className="space-y-8 max-w-lg mx-auto">
              <div className="text-center">
                <h1 className="text-headline-md md:text-3xl font-bold text-primary mb-2">
                  Bidang yang bikin kamu excited?
                </h1>
                <p className="text-on-surface-variant">Pilih minimal 1 (maksimal 5)</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {INTERESTS.map((i) => {
                  const selected = form.interest_domains.includes(i.value);
                  return (
                    <button
                      key={i.value}
                      onClick={() => toggleInterest(i.value)}
                      disabled={!selected && form.interest_domains.length >= 5}
                      className={`flex flex-col items-center gap-2 p-4 rounded-md border bg-surface-container-lowest transition ${
                        selected
                          ? "border-secondary ring-2 ring-secondary/30"
                          : "border-outline-variant/40 hover:border-secondary/50 disabled:opacity-40"
                      }`}
                    >
                      <span className="text-2xl">{i.icon}</span>
                      <span className="font-label text-label-sm text-on-surface">
                        {i.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 inline-flex items-center justify-center gap-2 border-2 border-primary text-primary rounded-md py-3 text-button font-semibold hover:bg-surface-variant transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali
                </button>
                <button
                  disabled={form.interest_domains.length === 0}
                  onClick={() => {
                    setStep(4);
                    setSubStep(0);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-container disabled:opacity-40 text-on-secondary rounded-md py-3 text-button font-semibold transition"
                >
                  Selanjutnya <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 — Personality (sub-steps) */}
          {step === 4 && (
            <div className="space-y-8 max-w-lg mx-auto">
              <div>
                <div className="flex gap-1.5 mb-6">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${
                        i <= subStep ? "bg-tertiary-fixed-dim" : "bg-surface-container-highest"
                      }`}
                    />
                  ))}
                </div>
                <h1 className="text-headline-md md:text-3xl font-bold text-primary mb-2 text-center">
                  {PERSONALITY_QUESTIONS[subStep].question}
                </h1>
                <p className="font-label text-label-sm text-on-surface-variant text-center">
                  Pertanyaan {subStep + 1} dari 5
                </p>
              </div>
              <div className="space-y-3">
                {PERSONALITY_QUESTIONS[subStep].options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => answerPersonality(subStep, opt.value)}
                    className="w-full flex items-center gap-4 p-5 rounded-md border border-outline-variant/40 bg-surface-container-lowest hover:border-secondary hover:ring-2 hover:ring-secondary/20 text-left transition shadow-sm"
                  >
                    <div>
                      <p className="font-semibold text-primary">{opt.label}</p>
                      <p className="text-sm text-on-surface-variant">{opt.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-secondary ml-auto shrink-0" />
                  </button>
                ))}
              </div>
              {subStep > 0 && (
                <button
                  onClick={() => setSubStep((s) => s - 1)}
                  className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Pertanyaan sebelumnya
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
