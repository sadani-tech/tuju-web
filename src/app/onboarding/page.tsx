"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, reportApi } from "@/lib/api";
import { Segment } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ProgressBar } from "@/components/ui/ProgressBar";

const SEGMENTS = [
  { value: "smp", icon: "🎓", label: "Pelajar SMP", desc: "Kelas 7-9" },
  { value: "sma", icon: "📚", label: "Pelajar SMA/SMK", desc: "Kelas 10-12" },
  { value: "mahasiswa", icon: "🎓", label: "Mahasiswa", desc: "Sedang kuliah" },
  { value: "fresh_grad", icon: "💼", label: "Fresh Graduate", desc: "Baru lulus / mencari kerja" },
  { value: "career_switcher", icon: "🔄", label: "Sudah Bekerja", desc: "Ingin ganti jalur" },
  { value: "orang_tua", icon: "👨‍👩‍👧", label: "Orang Tua", desc: "Mendampingi anak" },
];

const INTERESTS = [
  { value: "teknologi", icon: "💻", label: "Teknologi" },
  { value: "kesehatan", icon: "🏥", label: "Kesehatan" },
  { value: "bisnis", icon: "💼", label: "Bisnis" },
  { value: "pendidikan", icon: "📚", label: "Pendidikan" },
  { value: "sosial", icon: "🤝", label: "Sosial" },
  { value: "seni", icon: "🎨", label: "Seni" },
  { value: "olahraga", icon: "⚽", label: "Olahraga" },
  { value: "sains", icon: "🔬", label: "Sains" },
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white space-y-6">
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
          <p className="text-slate-400 text-sm">Ini mungkin butuh 30-60 detik...</p>
        </div>
      </div>
    );
  }

  if (pollStatus === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <p className="text-2xl">😔</p>
          <h2 className="text-xl font-bold text-slate-900">Gagal membuat report</h2>
          <p className="text-slate-500">Coba lagi setelah beberapa saat</p>
          <button
            onClick={() => {
              setPollStatus("idle");
              setLoading(false);
              setStep(4);
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 py-3 font-medium transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header with progress */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-600">Tuju</span>
            <span className="text-xs text-slate-500">
              {step === 4
                ? `Step 4 · Pertanyaan ${subStep + 1}/5`
                : `Step ${step} dari 4`}
            </span>
          </div>
          <ProgressBar value={progress} color="bg-blue-600" height="h-1.5" />
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-lg">

          {/* STEP 1 — Segment */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  Halo! Aku Tuju 👋
                </h2>
                <p className="text-slate-500">Kamu sekarang di fase hidup yang mana?</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {SEGMENTS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() =>
                      setForm((f) => ({ ...f, segment: s.value as Segment }))
                    }
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition ${
                      form.segment === s.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-blue-300"
                    }`}
                  >
                    <span className="text-2xl">{s.icon}</span>
                    <div>
                      <p className="font-semibold text-slate-900">{s.label}</p>
                      <p className="text-sm text-slate-500">{s.desc}</p>
                    </div>
                    {form.segment === s.value && (
                      <span className="ml-auto text-blue-600">✓</span>
                    )}
                  </button>
                ))}
              </div>
              <button
                disabled={!form.segment}
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl py-3 font-semibold transition"
              >
                Lanjut →
              </button>
            </div>
          )}

          {/* STEP 2 — Data Dasar */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  Cerita tentang kamu
                </h2>
                <p className="text-slate-500">Isi beberapa info dasar dulu</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Kota domisili
                  </label>
                  <input
                    type="text"
                    placeholder="Jakarta, Bandung, Surabaya..."
                    value={form.city}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, city: e.target.value }))
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                </div>
                {(form.segment === "smp" || form.segment === "sma") && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Kelas
                    </label>
                    <select
                      value={form.grade}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, grade: e.target.value }))
                      }
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
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
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Jurusan saat ini
                    </label>
                    <select
                      value={form.major_current}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, major_current: e.target.value }))
                      }
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
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
                  className="flex-1 border border-slate-200 hover:border-blue-300 rounded-xl py-3 font-medium text-slate-700 transition"
                >
                  ← Kembali
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 font-semibold transition"
                >
                  Lanjut →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — Minat */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  Bidang yang bikin kamu excited?
                </h2>
                <p className="text-slate-500">Pilih minimal 1 (maksimal 5)</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {INTERESTS.map((i) => {
                  const selected = form.interest_domains.includes(i.value);
                  return (
                    <button
                      key={i.value}
                      onClick={() => toggleInterest(i.value)}
                      disabled={!selected && form.interest_domains.length >= 5}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition ${
                        selected
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 bg-white hover:border-blue-200 disabled:opacity-40"
                      }`}
                    >
                      <span className="text-2xl">{i.icon}</span>
                      <span className="text-xs font-medium text-slate-700">
                        {i.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 border border-slate-200 hover:border-blue-300 rounded-xl py-3 font-medium text-slate-700 transition"
                >
                  ← Kembali
                </button>
                <button
                  disabled={form.interest_domains.length === 0}
                  onClick={() => {
                    setStep(4);
                    setSubStep(0);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl py-3 font-semibold transition"
                >
                  Lanjut →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 — Personality (sub-steps) */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <div className="flex gap-1.5 mb-4">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${
                        i <= subStep ? "bg-blue-600" : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  {PERSONALITY_QUESTIONS[subStep].question}
                </h2>
                <p className="text-sm text-slate-500">
                  Pertanyaan {subStep + 1} dari 5
                </p>
              </div>
              <div className="space-y-3">
                {PERSONALITY_QUESTIONS[subStep].options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => answerPersonality(subStep, opt.value)}
                    className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50 text-left transition"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{opt.label}</p>
                      <p className="text-sm text-slate-500">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              {subStep > 0 && (
                <button
                  onClick={() => setSubStep((s) => s - 1)}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  ← Pertanyaan sebelumnya
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
