import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <span className="text-2xl font-bold tracking-tight">Tuju</span>
        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 text-slate-300 hover:text-white transition">
            Masuk
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition"
          >
            Mulai Sekarang
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 pt-24 pb-16 text-center">
        <h1 className="text-5xl font-bold leading-tight mb-6">
          Temukan Jalanmu.
          <br />
          <span className="text-blue-400">Bangun Hidupmu.</span>
        </h1>
        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
          Tuju membantu kamu menemukan jalur hidup terbaik — dari pilihan jurusan SMA,
          kuliah, hingga karier — berdasarkan data nyata yang kamu miliki.
        </p>
        <Link
          href="/register"
          className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-lg font-semibold transition shadow-lg shadow-blue-500/20"
        >
          Mulai Gratis →
        </Link>
      </section>

      {/* Feature highlights */}
      <section className="max-w-5xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: "🎯", title: "Life Path Report", desc: "Rekomendasi karier personal berbasis AI + data profil kamu" },
          { icon: "🤖", title: "AI Expert Chat", desc: "Ngobrol langsung dengan AI yang berperan sebagai profesional impianmu" },
          { icon: "🗺️", title: "Roadmap Hidup", desc: "Langkah-langkah konkret yang bisa kamu kerjakan hari ini" },
        ].map((f) => (
          <div key={f.title} className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
            <p className="text-slate-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Testimonials */}
      <section className="max-w-5xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Mereka Sudah Menemukan Arahnya</h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Dari pelajar SMP hingga career switcher — Tuju menemani setiap fase hidup.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[
            {
              name: "Budi S.",
              age: "17 tahun · Pelajar SMA",
              avatar: "BS",
              color: "from-blue-500 to-blue-700",
              quote:
                "Aku sempat ikut-ikutan teman masuk IPS, padahal nilai biologi & matematikaku bagus. Life Path Report Tuju bilang aku 92% cocok jadi Sport Science Professional. Sekarang aku yakin ambil IPA dan tahu harus kemana setelah lulus.",
              feature: "Life Path Report",
              featureIcon: "🎯",
            },
            {
              name: "Rina A.",
              age: "23 tahun · Fresh Graduate",
              avatar: "RA",
              color: "from-violet-500 to-violet-700",
              quote:
                "Lulus Manajemen tapi passion-ku di desain. Aku stuck berminggu-minggu. Setelah isi profil Tuju dan chat sama AI Expert UI/UX Designer, aku akhirnya punya roadmap konkret buat pindah jalur tanpa buang ijazahku.",
              feature: "AI Expert Chat",
              featureIcon: "🤖",
            },
            {
              name: "Pak Hendra",
              age: "45 tahun · Orang Tua",
              avatar: "PH",
              color: "from-emerald-500 to-emerald-700",
              quote:
                "Anak saya kelas 9 dan saya tidak mau dia mengulang kesalahan saya — 20 tahun bekerja di bidang yang tidak dicintai. Saya isi profil untuk anak saya, dan Tuju langsung kasih rekomendasi jurusan SMA yang masuk akal beserta alasannya.",
              feature: "Rekomendasi SMA",
              featureIcon: "🏫",
            },
          ].map((t) => (
            <div
              key={t.name}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 hover:bg-white/[0.08] transition"
            >
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
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-amber-400 text-sm">★</span>
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed flex-1">"{t.quote}"</p>
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <span className="text-base">{t.featureIcon}</span>
                <span className="text-xs text-slate-400">via <span className="text-blue-400">{t.feature}</span></span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              name: "Dina P.",
              age: "20 tahun · Mahasiswa Psikologi",
              avatar: "DP",
              color: "from-pink-500 to-pink-700",
              quote:
                "Semester 4 aku mulai ragu sama jurusanku. Setelah ngisi Work Style assessment di Tuju, ternyata profil aku sangat cocok sama Psikolog dan Konselor Karier. Sekarang aku lebih tenang dan fokus.",
              feature: "Work Style Assessment",
              featureIcon: "🧠",
            },
            {
              name: "Rendi K.",
              age: "28 tahun · Career Switcher",
              avatar: "RK",
              color: "from-orange-500 to-orange-700",
              quote:
                "5 tahun di akuntansi tapi selalu merasa bukan tempatku. Tuju kasih skor kecocokan per profesi — Digital Marketer 88%, Entrepreneur 81%. Roadmap-nya langsung praktikal, bukan teori doang. Sekarang aku udah onboard di agency.",
              feature: "Roadmap Hidup",
              featureIcon: "🗺️",
            },
          ].map((t) => (
            <div
              key={t.name}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 hover:bg-white/[0.08] transition"
            >
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
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-amber-400 text-sm">★</span>
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed flex-1">"{t.quote}"</p>
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <span className="text-base">{t.featureIcon}</span>
                <span className="text-xs text-slate-400">via <span className="text-blue-400">{t.feature}</span></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="max-w-2xl mx-auto px-8 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Siap menemukan jalanmu?</h2>
        <p className="text-slate-400 mb-8">Gratis. Tidak perlu biaya. Mulai dalam 2 menit.</p>
        <Link
          href="/register"
          className="inline-block px-10 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-lg font-semibold transition shadow-lg shadow-blue-500/20"
        >
          Mulai Sekarang →
        </Link>
      </section>
    </main>
  );
}
