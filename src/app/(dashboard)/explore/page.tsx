"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { professionsApi, reportApi } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { toast } from "@/components/ui/Toast";

type ProfessionItem = {
  id: string;
  slug: string;
  name: string;
  category: string;
  emoji: string | null;
  cost_level: string | null;
  salary_min: number | null;
  salary_max: number | null;
  education_years_min: number;
  work_style_summary: string;
};

type Category = { category: string; count: number; emoji: string };

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return "Bervariasi";
  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(0)} jt` : `${Math.round(n / 1_000)} rb`;
  if (min && max) return `Rp${fmt(min)}–${fmt(max)}/bln`;
  if (max) return `s/d Rp${fmt(max)}/bln`;
  return `ab Rp${fmt(min!)}/bln`;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse space-y-3">
      <div className="w-12 h-12 bg-slate-100 rounded-xl mx-auto" />
      <div className="h-4 bg-slate-100 rounded w-3/4 mx-auto" />
      <div className="h-3 bg-slate-100 rounded w-1/2 mx-auto" />
      <div className="h-3 bg-slate-100 rounded w-full mt-2" />
      <div className="h-8 bg-slate-100 rounded-xl mt-3" />
    </div>
  );
}

export default function ExplorePage() {
  const [professions, setProfessions]     = useState<ProfessionItem[]>([]);
  const [categories, setCategories]       = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [search, setSearch]               = useState("");
  const [loading, setLoading]             = useState(true);
  const [recommendedSlugs, setRecommendedSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([professionsApi.list(), professionsApi.categories()])
      .then(([pRes, cRes]) => {
        setProfessions(pRes.data);
        setCategories(cRes.data);
      })
      .catch(() => toast("Gagal memuat profesi", "error"))
      .finally(() => setLoading(false));

    reportApi.getLayered()
      .then((res) => {
        const slugs = new Set<string>();
        for (const layer of res.data?.layers ?? []) {
          if (layer.type === "profession") {
            for (const item of layer.items ?? []) {
              if (item.profession_slug) slugs.add(item.profession_slug);
            }
          }
        }
        setRecommendedSlugs(slugs);
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    let list = professions;
    if (activeCategory !== "Semua") list = list.filter((p) => p.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [professions, activeCategory, search]);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Eksplorasi Profesi 🔍</h1>
        <p className="text-slate-500 mt-1">
          Temukan profesi yang cocok untukmu dari {professions.length} pilihan
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔎</span>
        <input
          type="text"
          placeholder="Cari nama profesi..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setActiveCategory("Semua"); }}
          className="w-full pl-9 pr-9 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <button
          onClick={() => { setActiveCategory("Semua"); setSearch(""); }}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
            activeCategory === "Semua"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
          }`}
        >
          Semua ({professions.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.category}
            onClick={() => { setActiveCategory(cat.category); setSearch(""); }}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
              activeCategory === cat.category
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
            }`}
          >
            {cat.emoji} {cat.category.split(" & ")[0]} ({cat.count})
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium text-slate-600">Tidak ada profesi dengan nama itu</p>
          <p className="text-sm mt-1">Coba kata kunci lain</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => {
            const isRec = recommendedSlugs.has(p.slug);
            const workTags = p.work_style_summary.split(" · ").filter(Boolean);
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition flex flex-col relative overflow-hidden"
              >
                {isRec && (
                  <div className="absolute top-2 right-2 bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2 py-0.5 rounded-full font-medium z-10">
                    ⭐ Cocok
                  </div>
                )}
                <div className="p-4 flex flex-col flex-1">
                  <div className="text-center mb-3">
                    <div className="text-5xl leading-none mb-2">{p.emoji || "🎯"}</div>
                    <h3 className="font-semibold text-slate-900 text-sm leading-tight">{p.name}</h3>
                    <span className="inline-block mt-1.5 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {p.category}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 space-y-0.5 mb-3">
                    <div>💰 {formatSalary(p.salary_min, p.salary_max)}</div>
                    <div>🎓 {p.education_years_min} tahun pendidikan</div>
                  </div>

                  {workTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {workTags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto grid grid-cols-2 gap-2">
                    <Link
                      href={`/explore/${p.slug}`}
                      className="text-center text-xs font-medium text-slate-700 hover:text-blue-600 py-2 border border-slate-200 hover:border-blue-300 rounded-xl transition"
                    >
                      Detail
                    </Link>
                    <Link
                      href={`/chat/${p.slug}`}
                      className="text-center text-xs font-medium text-blue-600 hover:text-white hover:bg-blue-600 py-2 border border-blue-200 hover:border-blue-600 rounded-xl transition"
                    >
                      Chat AI →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <p className="text-center text-sm text-slate-400">
          Menampilkan {filtered.length} dari {professions.length} profesi
        </p>
      )}
    </div>
  );
}
