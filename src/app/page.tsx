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
          Find Your Direction.
          <br />
          <span className="text-blue-400">Build Your Life.</span>
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
    </main>
  );
}
