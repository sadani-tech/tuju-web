"use client";
import { useEffect, useState } from "react";
import { profileApi } from "@/lib/api";
import { ProfileMe, CompletenessResult } from "@/types";
import { toast, ToastContainer } from "@/components/ui/Toast";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PillBadge } from "@/components/ui/PillBadge";
import { TagInput } from "@/components/profile/TagInput";
import { RIASECSlider } from "@/components/profile/RIASECSlider";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const SECTIONS = [
  { key: "academic", label: "Akademik", icon: "📚" },
  { key: "personality", label: "Kepribadian", icon: "🧠" },
  { key: "interests", label: "Minat & Hobi", icon: "💡" },
  { key: "goals", label: "Goals", icon: "🎯" },
  { key: "documents", label: "Dokumen", icon: "📄" },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

const INTERESTS_LIST = [
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

const RIASEC_DEFS = [
  {
    code: "R",
    label: "Realistic",
    field: "riasec_r" as const,
    desc: "Suka kerja fisik, teknis, dengan benda/alat",
  },
  {
    code: "I",
    label: "Investigative",
    field: "riasec_i" as const,
    desc: "Suka analisis, riset, berpikir kritis",
  },
  {
    code: "A",
    label: "Artistic",
    field: "riasec_a" as const,
    desc: "Suka kreasi, ekspresi, fleksibilitas",
  },
  {
    code: "S",
    label: "Social",
    field: "riasec_s" as const,
    desc: "Suka membantu, mengajar, berinteraksi",
  },
  {
    code: "E",
    label: "Enterprising",
    field: "riasec_e" as const,
    desc: "Suka memimpin, persuasi, bisnis",
  },
  {
    code: "C",
    label: "Conventional",
    field: "riasec_c" as const,
    desc: "Suka keteraturan, data, prosedur",
  },
];

const WS_DIMS = [
  { key: "people_orientation", leftLabel: "🔍 Data/Sistem", rightLabel: "👥 Orang" },
  { key: "structure", leftLabel: "🎯 Fleksibel", rightLabel: "📋 Terstruktur" },
  { key: "environment", leftLabel: "🏢 Indoor", rightLabel: "🌿 Outdoor" },
  { key: "collaboration", leftLabel: "🧍 Solo", rightLabel: "🤝 Tim" },
  { key: "stress_tolerance", leftLabel: "🌊 Stabil", rightLabel: "⚡ High Pressure" },
  { key: "variety", leftLabel: "🎯 Rutinitas", rightLabel: "🔄 Variasi" },
];

type PersonalityState = {
  riasec_r: number;
  riasec_i: number;
  riasec_a: number;
  riasec_s: number;
  riasec_e: number;
  riasec_c: number;
  extrovert_score: number;
  analytical_score: number;
  creative_score: number;
  learning_style: string;
};

type WorkStyleState = {
  people_orientation: number;
  structure: number;
  environment: number;
  collaboration: number;
  stress_tolerance: number;
  variety: number;
};

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState<SectionKey>("academic");
  const [profileMe, setProfileMe] = useState<ProfileMe | null>(null);
  const [completeness, setCompleteness] = useState<CompletenessResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [academic, setAcademic] = useState({
    education_level: "",
    school_name: "",
    current_grade: "",
    avg_score: "",
    favorite_subjects: [] as string[],
    achievements: [] as string[],
  });

  const [personality, setPersonality] = useState<PersonalityState>({
    riasec_r: 50,
    riasec_i: 50,
    riasec_a: 50,
    riasec_s: 50,
    riasec_e: 50,
    riasec_c: 50,
    extrovert_score: 5,
    analytical_score: 5,
    creative_score: 5,
    learning_style: "",
  });

  const [workStyle, setWorkStyle] = useState<WorkStyleState>({
    people_orientation: 0.5,
    structure: 0.5,
    environment: 0.5,
    collaboration: 0.5,
    stress_tolerance: 0.5,
    variety: 0.5,
  });

  const [interests, setInterests] = useState({
    interest_categories: [] as string[],
    hobbies: [] as string[],
    extracurricular: [] as string[],
    hard_skills: [] as string[],
    soft_skills: [] as string[],
  });

  const [goals, setGoals] = useState({
    financial_condition: "",
    education_target: "",
    career_target_5y: "",
    current_obstacles: "",
  });

  const fetchAll = async () => {
    try {
      const [meRes, compRes] = await Promise.all([
        profileApi.me(),
        profileApi.getCompleteness(),
      ]);
      const data: ProfileMe = meRes.data;
      setProfileMe(data);
      setCompleteness(compRes.data);

      if (data.academic) {
        setAcademic({
          education_level: data.academic.education_level || "",
          school_name: data.academic.school_name || "",
          current_grade: data.academic.current_grade || "",
          avg_score: data.academic.avg_score?.toString() || "",
          favorite_subjects: data.academic.favorite_subjects || [],
          achievements: data.academic.achievements || [],
        });
      }
      if (data.personality) {
        setPersonality({
          riasec_r: data.personality.riasec_r ?? 50,
          riasec_i: data.personality.riasec_i ?? 50,
          riasec_a: data.personality.riasec_a ?? 50,
          riasec_s: data.personality.riasec_s ?? 50,
          riasec_e: data.personality.riasec_e ?? 50,
          riasec_c: data.personality.riasec_c ?? 50,
          extrovert_score: data.personality.extrovert_score ?? 5,
          analytical_score: data.personality.analytical_score ?? 5,
          creative_score: data.personality.creative_score ?? 5,
          learning_style: "",
        });
        if (data.personality.work_style) {
          const ws = data.personality.work_style;
          setWorkStyle({
            people_orientation: ws.people_orientation ?? 0.5,
            structure: ws.structure ?? 0.5,
            environment: ws.environment ?? 0.5,
            collaboration: ws.collaboration ?? 0.5,
            stress_tolerance: ws.stress_tolerance ?? 0.5,
            variety: ws.variety ?? 0.5,
          });
        }
      }
      if (data.interests) {
        setInterests({
          interest_categories: data.interests.interest_categories || [],
          hobbies: data.interests.hobbies || [],
          extracurricular: data.interests.extracurricular || [],
          hard_skills: data.interests.hard_skills || [],
          soft_skills: data.interests.soft_skills || [],
        });
      }
      if (data.goals) {
        setGoals({
          financial_condition: data.goals.financial_condition || "",
          education_target: data.goals.education_target || "",
          career_target_5y: data.goals.career_target_5y || "",
          current_obstacles: data.goals.current_obstacles || "",
        });
      }
    } catch {
      toast("Gagal memuat profil", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("tuju_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }
    }
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveAcademic = async () => {
    setSaving(true);
    try {
      await profileApi.updateAcademic({
        ...academic,
        avg_score: academic.avg_score ? parseFloat(academic.avg_score) : null,
      });
      toast("Akademik tersimpan! +10 poin", "success");
      const compRes = await profileApi.getCompleteness();
      setCompleteness(compRes.data);
    } catch {
      toast("Gagal menyimpan", "error");
    }
    setSaving(false);
  };

  const savePersonality = async () => {
    setSaving(true);
    try {
      await Promise.all([
        profileApi.updatePersonality(personality),
        profileApi.updateWorkStyle(workStyle),
      ]);
      toast("Kepribadian tersimpan! +10 poin", "success");
      const compRes = await profileApi.getCompleteness();
      setCompleteness(compRes.data);
    } catch {
      toast("Gagal menyimpan", "error");
    }
    setSaving(false);
  };

  const saveInterests = async () => {
    setSaving(true);
    try {
      await profileApi.updateInterests({
        interest_domains: interests.interest_categories,
        hobbies: interests.hobbies,
        extracurricular: interests.extracurricular,
        hard_skills: interests.hard_skills,
        soft_skills: interests.soft_skills,
      });
      toast("Minat tersimpan! +10 poin", "success");
      const compRes = await profileApi.getCompleteness();
      setCompleteness(compRes.data);
    } catch {
      toast("Gagal menyimpan", "error");
    }
    setSaving(false);
  };

  const saveGoals = async () => {
    setSaving(true);
    try {
      await profileApi.updateGoals(goals);
      toast("Goals tersimpan! +10 poin", "success");
      const compRes = await profileApi.getCompleteness();
      setCompleteness(compRes.data);
    } catch {
      toast("Gagal menyimpan", "error");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const total = completeness?.total ?? 0;
  const sections = completeness?.sections ?? {
    academic: false,
    personality: false,
    interests: false,
    goals: false,
    documents: false,
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <ToastContainer />
      <h1 className="text-display-lg-mobile text-primary mb-8">Profil Saya</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="md:w-64 shrink-0 space-y-4">
          <div className="glass-card rounded-lg border border-outline-variant/30 shadow-navy-sm p-6 space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
                {profileMe?.profile?.segment === "sma" ? "📚" : "👤"}
              </div>
              <p className="text-headline-md text-on-surface">{total}%</p>
              <p className="font-label text-label-sm text-on-surface-variant">Kelengkapan profil</p>
            </div>
            <ProgressBar
              value={total}
              color={total >= 100 ? "bg-tertiary-fixed-dim" : "bg-secondary"}
              height="h-2.5"
            />
            {total >= 100 && (
              <div className="text-center">
                <PillBadge variant="green">Profile Verified ✦</PillBadge>
              </div>
            )}
          </div>

          <div className="glass-card rounded-lg border border-outline-variant/30 shadow-navy-sm p-3 space-y-1">
            {SECTIONS.map((s) => {
              const done = sections[s.key as keyof typeof sections];
              return (
                <button
                  key={s.key}
                  onClick={() => setActiveSection(s.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-left text-sm transition ${
                    activeSection === s.key
                      ? "bg-secondary-container/10 text-secondary font-medium shadow-navy-sm"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  }`}
                >
                  <span className="text-lg">{s.icon}</span>
                  <span className="flex-1">{s.label}</span>
                  {done ? (
                    <svg className="w-5 h-5 text-on-tertiary-container" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  ) : (
                    <span className="w-4 h-4 rounded border border-outline-variant bg-surface-bright" />
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Form Area */}
        <main className="flex-1 glass-card rounded-lg border border-outline-variant/30 shadow-navy-sm p-6 md:p-8">

          {/* ACADEMIC */}
          {activeSection === "academic" && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-primary">📚 Data Akademik</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
                    Jenjang Pendidikan
                  </label>
                  <select
                    value={academic.education_level}
                    onChange={(e) =>
                      setAcademic((a) => ({ ...a, education_level: e.target.value }))
                    }
                    className="w-full border border-outline-variant rounded-md px-4 py-2.5 bg-surface-container-lowest text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                  >
                    <option value="">Pilih jenjang</option>
                    {["SMP", "SMA", "SMK", "D3", "S1", "S2", "S3"].map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
                    Nama Sekolah/Kampus
                  </label>
                  <input
                    type="text"
                    value={academic.school_name}
                    onChange={(e) =>
                      setAcademic((a) => ({ ...a, school_name: e.target.value }))
                    }
                    className="w-full border border-outline-variant rounded-md px-4 py-2.5 bg-surface-container-lowest text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                    placeholder="SMA Negeri 1 Jakarta..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
                    Kelas / Semester
                  </label>
                  <input
                    type="text"
                    value={academic.current_grade}
                    onChange={(e) =>
                      setAcademic((a) => ({ ...a, current_grade: e.target.value }))
                    }
                    className="w-full border border-outline-variant rounded-md px-4 py-2.5 bg-surface-container-lowest text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                    placeholder="Kelas 11 / Semester 3..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
                    Nilai Rata-rata (0-100)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={academic.avg_score}
                    onChange={(e) =>
                      setAcademic((a) => ({ ...a, avg_score: e.target.value }))
                    }
                    className="w-full border border-outline-variant rounded-md px-4 py-2.5 bg-surface-container-lowest text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                    placeholder="85"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
                  Mata Pelajaran Favorit
                </label>
                <TagInput
                  value={academic.favorite_subjects}
                  onChange={(tags) =>
                    setAcademic((a) => ({ ...a, favorite_subjects: tags }))
                  }
                  placeholder="Matematika, Biologi... (Enter untuk tambah)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
                  Prestasi / Penghargaan
                </label>
                <TagInput
                  value={academic.achievements}
                  onChange={(tags) =>
                    setAcademic((a) => ({ ...a, achievements: tags }))
                  }
                  placeholder="Juara olimpiade, lomba, dll..."
                />
              </div>
              <button
                onClick={saveAcademic}
                disabled={saving}
                className="bg-secondary hover:bg-secondary-container disabled:opacity-50 text-on-secondary text-button rounded-md px-8 py-3 shadow-navy-sm hover:shadow-navy transition-all flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" /> Menyimpan...
                  </>
                ) : (
                  "Simpan Akademik"
                )}
              </button>
            </div>
          )}

          {/* PERSONALITY */}
          {activeSection === "personality" && (
            <div className="space-y-8">
              <h2 className="text-lg font-bold text-primary">
                🧠 Kepribadian &amp; Work Style
              </h2>

              {/* RIASEC */}
              <div>
                <h3 className="font-semibold text-on-surface mb-4">Skor RIASEC</h3>
                <div className="space-y-5">
                  {RIASEC_DEFS.map((r) => (
                    <RIASECSlider
                      key={r.code}
                      label={r.label}
                      code={r.code}
                      description={r.desc}
                      value={personality[r.field]}
                      onChange={(val) =>
                        setPersonality((p) => ({ ...p, [r.field]: val }))
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Work Style */}
              <div>
                <h3 className="font-semibold text-on-surface mb-4">
                  Gaya Kerja (Work Style)
                </h3>
                <div className="space-y-5">
                  {WS_DIMS.map((dim) => (
                    <div key={dim.key}>
                      <div className="flex justify-between font-label text-label-sm text-on-surface-variant mb-2">
                        <span>{dim.leftLabel}</span>
                        <span>{dim.rightLabel}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.1}
                        value={workStyle[dim.key as keyof WorkStyleState]}
                        onChange={(e) =>
                          setWorkStyle((w) => ({
                            ...w,
                            [dim.key]: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full accent-secondary h-2 rounded-full"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={savePersonality}
                disabled={saving}
                className="bg-secondary hover:bg-secondary-container disabled:opacity-50 text-on-secondary text-button rounded-md px-8 py-3 shadow-navy-sm hover:shadow-navy transition-all flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" /> Menyimpan...
                  </>
                ) : (
                  "Simpan Kepribadian"
                )}
              </button>
            </div>
          )}

          {/* INTERESTS */}
          {activeSection === "interests" && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-primary">💡 Minat &amp; Hobi</h2>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2">
                  Domain Minat
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {INTERESTS_LIST.map((i) => {
                    const sel = interests.interest_categories.includes(i.value);
                    return (
                      <button
                        key={i.value}
                        type="button"
                        onClick={() =>
                          setInterests((prev) => ({
                            ...prev,
                            interest_categories: sel
                              ? prev.interest_categories.filter((x) => x !== i.value)
                              : [...prev.interest_categories, i.value],
                          }))
                        }
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-sm transition ${
                          sel
                            ? "border-secondary bg-primary-fixed/20"
                            : "border-outline-variant/50 hover:border-secondary/50"
                        }`}
                      >
                        <span className="text-xl">{i.icon}</span>
                        <span className="text-xs font-medium text-on-surface">
                          {i.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
                  Hobi
                </label>
                <TagInput
                  value={interests.hobbies}
                  onChange={(tags) => setInterests((p) => ({ ...p, hobbies: tags }))}
                  placeholder="Membaca, coding, olahraga..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
                  Ekstrakurikuler / Organisasi
                </label>
                <TagInput
                  value={interests.extracurricular}
                  onChange={(tags) =>
                    setInterests((p) => ({ ...p, extracurricular: tags }))
                  }
                  placeholder="OSIS, basket, debat..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
                    Hard Skills
                  </label>
                  <TagInput
                    value={interests.hard_skills}
                    onChange={(tags) =>
                      setInterests((p) => ({ ...p, hard_skills: tags }))
                    }
                    placeholder="Python, desain, Excel..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
                    Soft Skills
                  </label>
                  <TagInput
                    value={interests.soft_skills}
                    onChange={(tags) =>
                      setInterests((p) => ({ ...p, soft_skills: tags }))
                    }
                    placeholder="Public speaking, teamwork..."
                  />
                </div>
              </div>
              <button
                onClick={saveInterests}
                disabled={saving}
                className="bg-secondary hover:bg-secondary-container disabled:opacity-50 text-on-secondary text-button rounded-md px-8 py-3 shadow-navy-sm hover:shadow-navy transition-all flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" /> Menyimpan...
                  </>
                ) : (
                  "Simpan Minat"
                )}
              </button>
            </div>
          )}

          {/* GOALS */}
          {activeSection === "goals" && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-primary">🎯 Kondisi &amp; Goals</h2>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
                  Kondisi Finansial Keluarga
                </label>
                <select
                  value={goals.financial_condition}
                  onChange={(e) =>
                    setGoals((g) => ({ ...g, financial_condition: e.target.value }))
                  }
                  className="w-full border border-outline-variant rounded-md px-4 py-2.5 bg-surface-container-lowest text-on-surface focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                >
                  <option value="">Pilih kondisi</option>
                  <option value="rendah">Rendah</option>
                  <option value="menengah">Menengah</option>
                  <option value="tinggi">Tinggi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
                  Target Pendidikan
                </label>
                <textarea
                  value={goals.education_target}
                  onChange={(e) =>
                    setGoals((g) => ({ ...g, education_target: e.target.value }))
                  }
                  rows={2}
                  placeholder="Ingin kuliah di jurusan Teknik Informatika, UI..."
                  className="w-full border border-outline-variant rounded-md px-4 py-2.5 bg-surface-container-lowest text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
                  Target Karier 5 Tahun ke Depan
                </label>
                <textarea
                  value={goals.career_target_5y}
                  onChange={(e) =>
                    setGoals((g) => ({ ...g, career_target_5y: e.target.value }))
                  }
                  rows={2}
                  placeholder="Menjadi software engineer di startup teknologi..."
                  className="w-full border border-outline-variant rounded-md px-4 py-2.5 bg-surface-container-lowest text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
                  Hambatan yang Dirasakan Saat Ini
                </label>
                <textarea
                  value={goals.current_obstacles}
                  onChange={(e) =>
                    setGoals((g) => ({ ...g, current_obstacles: e.target.value }))
                  }
                  rows={2}
                  placeholder="Tidak tahu harus mulai dari mana, biaya kuliah..."
                  className="w-full border border-outline-variant rounded-md px-4 py-2.5 bg-surface-container-lowest text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all"
                />
              </div>
              <button
                onClick={saveGoals}
                disabled={saving}
                className="bg-secondary hover:bg-secondary-container disabled:opacity-50 text-on-secondary text-button rounded-md px-8 py-3 shadow-navy-sm hover:shadow-navy transition-all flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" /> Menyimpan...
                  </>
                ) : (
                  "Simpan Goals"
                )}
              </button>
            </div>
          )}

          {/* DOCUMENTS */}
          {activeSection === "documents" && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-primary">📄 Dokumen (Opsional)</h2>
              <div className="border-2 border-dashed border-outline-variant rounded-lg p-10 text-center bg-surface-container-low/50">
                <p className="text-3xl mb-2">📁</p>
                <p className="text-on-surface font-medium">
                  Upload Rapor, Transkrip, atau Sertifikat
                </p>
                <p className="text-on-surface-variant text-sm mt-1">
                  Fitur ini akan segera tersedia
                </p>
                <div className="mt-2">
                  <PillBadge variant="slate">Coming Soon</PillBadge>
                </div>
              </div>
              {(profileMe?.documents ?? []).length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-on-surface">
                    Dokumen tersimpan:
                  </p>
                  {profileMe?.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 p-3 bg-surface-container-low rounded-md border border-outline-variant/20"
                    >
                      <span>📄</span>
                      <span className="text-sm text-on-surface flex-1">
                        {doc.file_name}
                      </span>
                      <PillBadge variant="blue">{doc.document_type}</PillBadge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
