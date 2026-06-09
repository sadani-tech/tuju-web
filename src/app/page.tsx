import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tuju — Find Your Direction. Build Your Life.",
  description:
    "Platform AI yang membantu kamu menemukan jalur hidup terbaik — dari jurusan SMA, kuliah, hingga karier — berdasarkan data nyata yang kamu miliki.",
  openGraph: {
    title: "Tuju — Find Your Direction. Build Your Life.",
    description:
      "Platform AI untuk menemukan jalur hidupmu — jurusan SMA, kuliah, hingga karier.",
  },
};

const SEGMENTS = [
  { icon: "🎓", title: "Pelajar SMP",    desc: "Temukan jurusan SMA yang tepat" },
  { icon: "📚", title: "Pelajar SMA",    desc: "Pilih jurusan kuliah dengan percaya diri" },
  { icon: "🎓", title: "Mahasiswa",      desc: "Kuatkan jati diri sebelum lulus" },
  { icon: "💼", title: "Fresh Graduate", desc: "Mulai karier dari jalur yang benar" },
  { icon: "🔄", title: "Career Switcher",desc: "Pindah jalur dengan data, bukan perasaan" },
  { icon: "👨‍👩‍👧", title: "Orang Tua",   desc: "Bantu anakmu temukan potensi terbaiknya" },
];

const STEPS = [
  {
    num: "1",
    icon: "📝",
    title: "Ceritakan Dirimu",
    desc: "Isi profil: nilai akademik, kepribadian, minat, gaya kerja, dan tujuan hidupmu.",
    time: "~5 menit",
  },
  {
    num: "2",
    icon: "🤖",
    title: "AI Menganalisis",
    desc: "Rule engine + AI memproses 28+ profesi dan menemukan yang paling cocok untukmu.",
    time: null,
  },
  {
    num: "3",
    icon: "🗺️",
    title: "Temukan Jalanmu",
    desc: "Dapatkan Life Path Report personal, roadmap langkah nyata, dan chat langsung dengan AI profesional.",
    time: null,
  },
];

const STATS = [
  { value: "28+", label: "Profesi tersedia" },
  { value: "7",   label: "Kategori karier" },
  { value: "6",   label: "Dimensi analisis" },
  { value: "100%", label: "Gratis untuk mulai" },
];

const PROBLEMS = [
  { icon: "😔", text: "Masuk IPS padahal lebih jago di pelajaran sains" },
  { icon: "😤", text: "Kuliah 4 tahun di jurusan yang terasa tidak cocok" },
  { icon: "😰", text: "Bekerja di bidang yang tidak dicintai selama bertahun-tahun" },
];

const TESTIMONIALS = [
  {
    name: "Budi S.", age: "17 tahun · Pelajar SMA", avatar: "BS",
    color: "from-blue-500 to-blue-700",
    quote: "Aku sempat ikut-ikutan teman masuk IPS, padahal nilai biologi & matematikaku bagus. Life Path Report Tuju bilang aku 92% cocok jadi Sport Science Professional. Sekarang aku yakin ambil IPA.",
    feature: "Life Path Report", featureIcon: "🎯",
  },
  {
    name: "Rina A.", age: "23 tahun · Fresh Graduate", avatar: "RA",
    color: "from-violet-500 to-violet-700",
    quote: "Lulus Manajemen tapi passion-ku di desain. Setelah chat sama AI Expert UI/UX Designer, aku akhirnya punya roadmap konkret buat pindah jalur tanpa buang ijazahku.",
    feature: "AI Expert Chat", featureIcon: "🤖",
  },
  {
    name: "Pak Hendra", age: "45 tahun · Orang Tua", avatar: "PH",
    color: "from-emerald-500 to-emerald-700",
    quote: "Anak saya kelas 9 dan saya tidak mau dia mengulang kesalahan saya — 20 tahun bekerja di bidang yang tidak dicintai. Tuju langsung kasih rekomendasi jurusan SMA beserta alasannya.",
    feature: "Rekomendasi SMA", featureIcon: "🏫",
  },
];

function TestimonialCard({ t }: { t: typeof TESTIMONIALS[0] }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 hover:bg-white/[0.08] transition">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-sm font-bold shrink-0`}>
          {t.avatar}
        </div>
        <div>
          <p className="font-semibold text-sm">{t.name}</p>
          <p className="text-slate-400 text-xs">{t.age}</p>
        </div>
      </div>
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => <span key={i} className="text-amber-400 text-sm">★</span>)}
      </div>
      <p className="text-slate-300 text-sm leading-relaxed flex-1">"{t.quote}"</p>
      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
        <span className="text-base">{t.featureIcon}</span>
        <span className="text-xs text-slate-400">via <span className="text-blue-400">{t.feature}</span></span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-8 py-5 max-w-7xl mx-auto">
        <span className="text-2xl font-bold tracking-tight">Tuju</span>
        <div className="flex gap-3 items-center">
          <Link href="/login" className="px-4 py-2 text-slate-300 hover:text-white transition text-sm">
            Masuk
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition text-sm shadow-lg shadow-blue-500/20"
          >
            Mulai Sekarang
          </Link>
        </div>
      </nav>

      {/* ── Section 1 — HERO ─────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 md:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-6">
          <span>✨</span> Platform AI Jalur Hidup Pertama di Indonesia
        </div>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
          Find Your Direction.
          <br />
          <span className="text-blue-400">Build Your Life.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Platform AI yang membantu kamu menemukan jalur hidup terbaik — dari jurusan SMA, kuliah,
          hingga karier — berdasarkan data nyata yang kamu miliki.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/register"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-lg font-semibold transition shadow-lg shadow-blue-500/20"
          >
            Mulai Gratis →
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 border border-white/20 hover:bg-white/10 rounded-xl text-lg font-semibold transition"
          >
            Sudah punya akun
          </Link>
        </div>
        <p className="text-sm text-slate-500">✦ Gratis · Tanpa kartu kredit · Hasil dalam 5 menit</p>
      </section>

      {/* ── Section 2 — PROBLEM ──────────────────────── */}
      <section className="bg-slate-900/60 py-20">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Apakah kamu pernah merasakan ini?</h2>
          <p className="text-slate-400 mb-12 max-w-xl mx-auto">
            Masalah ini dialami jutaan orang — bukan karena kurang mampu, tapi karena tidak ada panduan yang tepat.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {PROBLEMS.map((p) => (
              <div key={p.text} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left">
                <p className="text-4xl mb-3">{p.icon}</p>
                <p className="text-slate-300 text-sm leading-relaxed">&quot;{p.text}&quot;</p>
              </div>
            ))}
          </div>
          <div className="bg-blue-600/20 border border-blue-500/30 rounded-2xl p-6 max-w-2xl mx-auto">
            <p className="text-slate-200 leading-relaxed">
              Masalah ini bukan karena kamu kurang mampu — tapi karena{" "}
              <span className="text-blue-300 font-semibold">tidak ada panduan yang tepat di waktu yang tepat.</span>{" "}
              Tuju hadir untuk mengubah itu.
            </p>
          </div>
        </div>
      </section>

      {/* ── Section 3 — HOW IT WORKS ─────────────────── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Bagaimana Tuju Bekerja?</h2>
          <p className="text-slate-400 mb-14 max-w-xl mx-auto">Tiga langkah sederhana menuju jalur hidup yang tepat.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left h-full">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-lg font-bold mb-4 flex-shrink-0">
                    {step.num}
                  </div>
                  <div className="text-3xl mb-3">{step.icon}</div>
                  <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                  {step.time && (
                    <p className="text-blue-400 text-xs mt-3 font-medium">{step.time}</p>
                  )}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-10 -right-4 text-slate-600 text-2xl z-10">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4 — FOR EVERYONE ─────────────────── */}
      <section className="bg-slate-900/60 py-20">
        <div className="max-w-5xl mx-auto px-6 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Untuk Semua Fase Hidupmu</h2>
          <p className="text-slate-400 mb-12">
            Dari SMP sampai career switcher — Tuju menemanimu di setiap tahap
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {SEGMENTS.map((seg) => (
              <div key={seg.title} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left hover:bg-white/[0.08] transition">
                <p className="text-3xl mb-2">{seg.icon}</p>
                <p className="font-semibold text-sm mb-1">{seg.title}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{seg.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 5 — FEATURES SHOWCASE ───────────── */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Semua yang Kamu Butuhkan</h2>
          <p className="text-slate-400 mb-14 max-w-xl mx-auto">Tiga fitur inti yang bekerja bersama untuk mengarahkan hidupmu.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🎯",
                title: "Life Path Report",
                desc: "Rekomendasi karier personal berbasis 6 dimensi analisis — bukan kuis kepribadian biasa.",
                badge: "Paling Populer",
              },
              {
                icon: "🤖",
                title: "AI Expert Chat",
                desc: "Ngobrol langsung dengan AI yang berperan sebagai profesional di bidang yang kamu minati.",
                badge: null,
              },
              {
                icon: "🗺️",
                title: "Roadmap Hidup",
                desc: "Langkah-langkah konkret yang bisa kamu kerjakan hari ini, disesuaikan profilmu.",
                badge: null,
              },
            ].map((f) => (
              <div key={f.title} className="bg-white/5 rounded-2xl p-6 border border-white/10 text-left relative overflow-hidden">
                {f.badge && (
                  <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs px-2.5 py-0.5 rounded-full font-medium">
                    {f.badge}
                  </div>
                )}
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 6 — TESTIMONIALS ─────────────────── */}
      <section className="bg-slate-900/60 py-20">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Mereka Sudah Menemukan Arahnya</h2>
            <p className="text-slate-400 text-base max-w-xl mx-auto">
              Dari pelajar SMP hingga career switcher — Tuju menemani setiap fase hidup.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => <TestimonialCard key={t.name} t={t} />)}
          </div>
        </div>
      </section>

      {/* ── Section 7 — STATS ────────────────────────── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <h2 className="text-2xl font-bold mb-12 text-slate-300">Platform yang dirancang untuk presisi</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-5xl font-bold text-white mb-2">{s.value}</p>
                <p className="text-slate-400 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 8 — CTA PENUTUP ──────────────────── */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-6 md:px-8 text-center">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 shadow-2xl shadow-blue-500/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Sudah siap menemukan jalurmu?</h2>
            <p className="text-blue-100 mb-8">Mulai gratis sekarang. Tidak perlu kartu kredit.</p>
            <Link
              href="/register"
              className="inline-block px-10 py-4 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-lg font-bold transition shadow-lg"
            >
              Daftar Gratis Sekarang →
            </Link>
            <p className="text-blue-200 text-sm mt-4">
              Sudah punya akun?{" "}
              <Link href="/login" className="text-white hover:underline font-medium">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-5xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-xl font-bold mb-1">Tuju</p>
              <p className="text-slate-500 text-sm">Find Your Direction. Build Your Life.</p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              {["Tentang", "Fitur", "Profesi", "Kontak"].map((link) => (
                <span key={link} className="hover:text-slate-300 cursor-pointer transition">
                  {link}
                </span>
              ))}
            </div>
          </div>
          <p className="text-center text-slate-600 text-xs mt-8">© 2026 Tuju. Find Your Direction.</p>
        </div>
      </footer>
    </main>
  );
}
