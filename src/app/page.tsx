import Link from "next/link";
import type { Metadata } from "next";
import {
  GraduationCap,
  BookOpen,
  Award,
  Briefcase,
  Split,
  Users,
  ClipboardList,
  Bot,
  Map,
  Target,
  MessageSquare,
  Stars,
  ArrowRight,
  Compass,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Tuju — Temukan Jalanmu. Bangun Hidupmu.",
  description:
    "Platform AI yang membantu kamu menemukan jalur hidup terbaik — dari jurusan SMA, kuliah, hingga karier — berdasarkan data nyata yang kamu miliki.",
  openGraph: {
    title: "Tuju — Temukan Jalanmu. Bangun Hidupmu.",
    description:
      "Platform AI untuk menemukan jalur hidupmu — jurusan SMA, kuliah, hingga karier.",
  },
};

const SEGMENTS = [
  { icon: GraduationCap, strip: "accent-strip-teal",   title: "Pelajar SMP",     desc: "Bingung memilih jurusan SMA/SMK yang tepat? Temukan arah sejak dini." },
  { icon: BookOpen,      strip: "accent-strip-blue",   title: "Pelajar SMA",     desc: "Pilih jurusan kuliah dengan percaya diri — tanpa takut salah jurusan." },
  { icon: Award,         strip: "accent-strip-purple", title: "Mahasiswa",       desc: "Kuatkan jati diri dan kejelasan jenjang karir sebelum lulus." },
  { icon: Briefcase,     strip: "accent-strip-teal",   title: "Fresh Graduate",  desc: "Mulai karier dari jalur yang benar dengan profil yang tajam." },
  { icon: Split,         strip: "accent-strip-blue",   title: "Career Switcher", desc: "Pindah jalur dengan data, bukan perasaan — transisi aman ke industri baru." },
  { icon: Users,         strip: "accent-strip-purple", title: "Orang Tua",       desc: "Bantu anakmu temukan potensi terbaiknya dengan validasi berbasis data." },
];

const STEPS = [
  {
    num: "1",
    icon: ClipboardList,
    title: "Ceritakan Dirimu",
    desc: "Isi profil: nilai akademik, kepribadian, minat, gaya kerja, dan tujuan hidupmu.",
    time: "~5 menit",
  },
  {
    num: "2",
    icon: Bot,
    title: "AI Menganalisis",
    desc: "Rule engine + AI memproses 28+ profesi dan menemukan yang paling cocok untukmu.",
    time: null,
  },
  {
    num: "3",
    icon: Map,
    title: "Temukan Jalanmu",
    desc: "Dapatkan Life Path Report personal, roadmap langkah nyata, dan chat langsung dengan AI profesional.",
    time: null,
  },
];

const STATS = [
  { value: "28+",  label: "Profesi tersedia" },
  { value: "7",    label: "Kategori karier" },
  { value: "6",    label: "Dimensi analisis" },
  { value: "100%", label: "Gratis untuk mulai" },
];

const PROBLEMS = [
  "Masuk IPS padahal lebih jago di pelajaran sains",
  "Kuliah 4 tahun di jurusan yang terasa tidak cocok",
  "Bekerja di bidang yang tidak dicintai selama bertahun-tahun",
];

const TESTIMONIALS = [
  {
    name: "Budi S.", age: "17 tahun · Pelajar SMA", avatar: "BS",
    color: "bg-secondary",
    quote: "Aku sempat ikut-ikutan teman masuk IPS, padahal nilai biologi & matematikaku bagus. Life Path Report Tuju bilang aku 92% cocok jadi Sport Science Professional. Sekarang aku yakin ambil IPA.",
    feature: "Life Path Report",
  },
  {
    name: "Rina A.", age: "23 tahun · Fresh Graduate", avatar: "RA",
    color: "bg-accent-purple",
    quote: "Lulus Manajemen tapi passion-ku di desain. Setelah chat sama AI Expert UI/UX Designer, aku akhirnya punya roadmap konkret buat pindah jalur tanpa buang ijazahku.",
    feature: "AI Expert Chat",
  },
  {
    name: "Pak Hendra", age: "45 tahun · Orang Tua", avatar: "PH",
    color: "bg-tertiary-container",
    quote: "Anak saya kelas 9 dan saya tidak mau dia mengulang kesalahan saya — 20 tahun bekerja di bidang yang tidak dicintai. Tuju langsung kasih rekomendasi jurusan SMA beserta alasannya.",
    feature: "Rekomendasi SMA",
  },
];

function TestimonialCard({ t }: { t: typeof TESTIMONIALS[0] }) {
  return (
    <div className="glass-card rounded-lg p-6 flex flex-col gap-4 shadow-navy-sm hover:shadow-navy transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full ${t.color} text-white flex items-center justify-center text-sm font-bold shrink-0`}>
          {t.avatar}
        </div>
        <div>
          <p className="font-semibold text-sm text-primary">{t.name}</p>
          <p className="text-on-surface-variant text-xs">{t.age}</p>
        </div>
      </div>
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => <span key={i} className="text-amber-400 text-sm">★</span>)}
      </div>
      <p className="text-on-surface-variant text-sm leading-relaxed flex-1">&quot;{t.quote}&quot;</p>
      <div className="flex items-center gap-2 pt-3 border-t border-outline-variant/40">
        <span className="font-label text-label-sm uppercase text-on-surface-variant">via</span>
        <span className="text-xs font-semibold text-secondary">{t.feature}</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-on-background">
      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/30 shadow-sm">
        <nav className="flex items-center justify-between px-4 md:px-10 h-16 max-w-container mx-auto">
          <span className="text-headline-md font-bold text-primary tracking-tight">Tuju</span>
          <div className="flex gap-3 items-center">
            <Link href="/login" className="px-4 py-2 text-on-surface-variant hover:text-secondary transition text-sm font-medium">
              Masuk
            </Link>
            <Link
              href="/register"
              className="bg-primary text-on-primary text-sm font-semibold px-6 py-2 rounded-full hover:bg-secondary transition-colors"
            >
              Mulai Sekarang
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Section 1 — HERO ─────────────────────────── */}
      <section className="relative overflow-hidden pt-36 pb-24 px-4 md:px-10">
        <div
          aria-hidden
          className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(37,82,202,0.10),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(0,245,212,0.08),transparent_50%)]"
        />
        <div className="relative z-10 max-w-container mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary-fixed/60 border border-outline-variant/40 rounded-full px-4 py-1.5 font-label text-label-sm uppercase text-on-primary-fixed-variant mb-8">
            <Compass className="w-4 h-4" /> Platform AI Jalur Hidup Pertama di Indonesia
          </div>
          <h1 className="text-display-lg-mobile md:text-display-lg text-primary mb-6">
            Find Your Direction.
            <br />
            <span className="text-gradient">Build Your Life.</span>
          </h1>
          <p className="text-body-lg text-on-surface-variant mb-10 max-w-2xl mx-auto">
            Platform AI yang membantu kamu menemukan jalur hidup terbaik — dari jurusan SMA, kuliah,
            hingga karier — berdasarkan data nyata yang kamu miliki.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              href="/register"
              className="bg-primary text-on-primary text-button font-semibold px-8 py-4 rounded-full shadow-navy hover:shadow-navy-lg hover:-translate-y-1 transition-all inline-flex items-center gap-2"
            >
              Mulai Gratis <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="border-2 border-primary text-primary text-button font-semibold px-8 py-4 rounded-full hover:bg-surface-variant transition-colors"
            >
              Sudah punya akun
            </Link>
          </div>
          <p className="font-label text-label-sm uppercase text-outline">
            Gratis · Tanpa kartu kredit · Hasil dalam 5 menit
          </p>
        </div>
      </section>

      {/* ── Section 2 — PROBLEM ──────────────────────── */}
      <section className="bg-surface-container-lowest py-20 px-4 md:px-10">
        <div className="max-w-container mx-auto text-center">
          <h2 className="text-headline-md md:text-3xl font-semibold text-primary mb-4">
            Apakah kamu pernah merasakan ini?
          </h2>
          <p className="text-on-surface-variant mb-12 max-w-xl mx-auto">
            Masalah ini dialami jutaan orang — bukan karena kurang mampu, tapi karena tidak ada panduan yang tepat.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-12">
            {PROBLEMS.map((p) => (
              <div key={p} className="glass-card accent-strip-blue rounded-lg p-6 text-left shadow-navy-sm">
                <p className="text-on-surface-variant text-sm leading-relaxed">&quot;{p}&quot;</p>
              </div>
            ))}
          </div>
          <div className="bg-primary-fixed/50 border border-outline-variant/40 rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-on-surface leading-relaxed">
              Masalah ini bukan karena kamu kurang mampu — tapi karena{" "}
              <span className="text-secondary font-semibold">tidak ada panduan yang tepat di waktu yang tepat.</span>{" "}
              Tuju hadir untuk mengubah itu.
            </p>
          </div>
        </div>
      </section>

      {/* ── Section 3 — HOW IT WORKS ─────────────────── */}
      <section className="py-20 px-4 md:px-10">
        <div className="max-w-container mx-auto text-center">
          <h2 className="text-headline-md md:text-3xl font-semibold text-primary mb-4">Bagaimana Tuju Bekerja?</h2>
          <p className="text-on-surface-variant mb-14 max-w-xl mx-auto">Tiga langkah sederhana menuju jalur hidup yang tepat.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative">
                <div className="glass-card rounded-lg p-6 text-left h-full shadow-navy-sm">
                  <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-lg font-bold mb-4">
                    {step.num}
                  </div>
                  <step.icon className="w-8 h-8 text-on-tertiary-container mb-3" />
                  <h3 className="font-bold text-lg text-primary mb-2">{step.title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{step.desc}</p>
                  {step.time && (
                    <p className="font-label text-label-sm uppercase text-secondary mt-3">{step.time}</p>
                  )}
                </div>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-10 -right-5 w-6 h-6 text-on-tertiary-container z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4 — FOR EVERYONE ─────────────────── */}
      <section className="bg-surface-container-lowest py-20 px-4 md:px-10">
        <div className="max-w-container mx-auto text-center">
          <h2 className="text-headline-md md:text-3xl font-semibold text-primary mb-3">Kenapa Membutuhkan Tuju?</h2>
          <p className="text-on-surface-variant mb-12 max-w-3xl mx-auto">
            Berbagai tantangan di setiap tahap pendidikan dan karir yang siap kami bantu pecahkan.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {SEGMENTS.map((seg) => (
              <div
                key={seg.title}
                className={`glass-card ${seg.strip} rounded-md p-6 text-left shadow-navy-sm hover:shadow-navy transition-shadow`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                    <seg.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-button font-semibold text-primary">{seg.title}</h3>
                </div>
                <p className="text-on-surface-variant text-sm leading-relaxed">{seg.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 5 — FEATURES BENTO ───────────────── */}
      <section className="py-20 px-4 md:px-10">
        <div className="max-w-container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-headline-md md:text-3xl font-semibold text-primary mb-4">Fitur Unggulan</h2>
            <p className="text-on-surface-variant max-w-3xl mx-auto">
              Ekosistem lengkap untuk memetakan dan meraih masa depan Anda.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            {/* Life Path Report (large) */}
            <div className="lg:col-span-2 lg:row-span-2 glass-card rounded-xl p-8 flex flex-col justify-between shadow-navy relative overflow-hidden">
              <Target aria-hidden className="absolute -right-8 -bottom-8 w-56 h-56 text-secondary opacity-[0.07]" />
              <div className="relative z-10 max-w-md">
                <div className="inline-block bg-primary-fixed text-primary-container px-3 py-1 rounded-full font-label text-label-sm uppercase mb-4">
                  Inti Tuju
                </div>
                <h3 className="text-display-lg-mobile text-primary mb-4">Life Path Report</h3>
                <p className="text-body-lg text-on-surface-variant mb-8">
                  Laporan komprehensif hasil asesmen psikologis dan minat bakat. Memberikan rekomendasi
                  jurusan, jalur karir, dan milestone yang dapat ditindaklanjuti.
                </p>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 text-secondary text-button font-semibold hover:text-primary transition-colors"
                >
                  Lihat Contoh Report <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            {/* AI Expert Chat */}
            <div className="glass-card rounded-xl p-8 flex flex-col justify-between shadow-navy-sm bg-gradient-to-br from-[#f8f5ff] to-white relative overflow-hidden">
              <MessageSquare aria-hidden className="absolute -right-4 -bottom-4 w-32 h-32 text-accent-purple opacity-10" />
              <div>
                <div className="inline-block bg-[#f3e8ff] text-[#6b21a8] px-3 py-1 rounded-full font-label text-label-sm uppercase mb-4">
                  AI Powered
                </div>
                <h3 className="text-headline-md text-primary mb-2">AI Expert Chat</h3>
                <p className="text-on-surface-variant text-sm">
                  Ngobrol langsung dengan AI yang berperan sebagai profesional di bidang yang kamu minati.
                </p>
              </div>
              <div className="mt-4">
                <div className="bg-white p-3 rounded shadow-sm border border-outline-variant/20 inline-block">
                  <span className="text-sm text-on-surface-variant">&quot;Jurusan apa yang cocok untukku?&quot;</span>
                </div>
              </div>
            </div>
            {/* Points System */}
            <div className="glass-card rounded-xl p-8 flex flex-col justify-between shadow-navy-sm relative overflow-hidden">
              <Stars aria-hidden className="absolute -right-4 -bottom-4 w-32 h-32 text-tertiary-fixed-dim opacity-10" />
              <div>
                <div className="inline-block bg-tertiary-fixed text-tertiary-container px-3 py-1 rounded-full font-label text-label-sm uppercase mb-4">
                  Gamification
                </div>
                <h3 className="text-headline-md text-primary mb-2">Sistem Poin</h3>
                <p className="text-on-surface-variant text-sm">
                  Selesaikan misi, lengkapi profil, dan raih pencapaian untuk naik level di perjalananmu.
                </p>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Stars className="w-7 h-7 text-on-tertiary-container" />
                <span className="font-bold text-xl text-primary">2,500 Poin</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 6 — TESTIMONIALS ─────────────────── */}
      <section className="bg-surface-container-lowest py-20 px-4 md:px-10">
        <div className="max-w-container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-headline-md md:text-3xl font-semibold text-primary mb-3">
              Mereka Sudah Menemukan Arahnya
            </h2>
            <p className="text-on-surface-variant max-w-xl mx-auto">
              Dari pelajar SMP hingga career switcher — Tuju menemani setiap fase hidup.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {TESTIMONIALS.map((t) => <TestimonialCard key={t.name} t={t} />)}
          </div>
        </div>
      </section>

      {/* ── Section 7 — STATS ────────────────────────── */}
      <section className="py-20 px-4 md:px-10">
        <div className="max-w-container mx-auto text-center">
          <h2 className="text-xl font-semibold mb-12 text-on-surface-variant">
            Platform yang dirancang untuk presisi
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-5xl font-bold text-gradient mb-2">{s.value}</p>
                <p className="font-label text-label-sm uppercase text-on-surface-variant">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 8 — CTA PENUTUP ──────────────────── */}
      <section className="py-20 px-4 md:px-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-primary-container rounded-xl p-10 shadow-navy-lg relative overflow-hidden">
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,245,212,0.18),transparent_55%)]"
            />
            <div className="relative z-10">
              <h2 className="text-headline-md md:text-3xl font-bold text-white mb-4">
                Sudah siap menemukan jalurmu?
              </h2>
              <p className="text-primary-fixed mb-8">Mulai gratis sekarang. Tidak perlu kartu kredit.</p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-10 py-4 bg-tertiary-fixed-dim text-on-tertiary-fixed rounded-full text-button font-bold hover:bg-tertiary-fixed transition shadow-lg"
              >
                Daftar Gratis Sekarang <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-primary-fixed-dim text-sm mt-4">
                Sudah punya akun?{" "}
                <Link href="/login" className="text-white hover:underline font-medium">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="border-t border-outline-variant/50 py-12 px-4 md:px-10 bg-surface">
        <div className="max-w-container mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-headline-md font-bold text-primary mb-1">Tuju</p>
              <p className="text-on-surface-variant text-sm">
                © 2026 Tuju Platform. Navigating your future with precision.
              </p>
            </div>
            <nav className="flex flex-wrap gap-6 text-sm text-on-surface-variant">
              {["Tentang", "Fitur", "Profesi", "Kontak"].map((link) => (
                <span key={link} className="hover:text-secondary cursor-pointer transition-colors">
                  {link}
                </span>
              ))}
            </nav>
          </div>
        </div>
      </footer>
    </main>
  );
}
