"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, X, GraduationCap, TrendingUp, Star, ArrowRight, SearchX } from "lucide-react";
import { professionsApi, reportApi } from "@/lib/api";
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

// Category tint gradients + accent text color, cycled per the polished mockup
const CATEGORY_STYLES = [
  { overlay: "bg-gradient-to-br from-primary-fixed/50 to-transparent", accent: "text-secondary" },
  { overlay: "bg-gradient-to-br from-accent-purple/10 to-transparent", accent: "text-accent-purple" },
  { overlay: "bg-gradient-to-br from-secondary-fixed/50 to-transparent", accent: "text-on-secondary-fixed-variant" },
  { overlay: "bg-gradient-to-br from-tertiary-fixed/30 to-transparent", accent: "text-on-tertiary-container" },
];

function categoryStyle(category: string) {
  let hash = 0;
  for (const ch of category) hash = (hash + ch.charCodeAt(0)) % CATEGORY_STYLES.length;
  return CATEGORY_STYLES[hash];
}

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
    <div className="bg-white rounded-xl border border-surface-variant p-6 animate-pulse space-y-4">
      <div className="w-14 h-14 bg-surface-container-high rounded-md" />
      <div className="h-5 bg-surface-container-high rounded w-3/4" />
      <div className="h-3 bg-surface-container-high rounded w-1/2" />
      <div className="h-16 bg-surface-container rounded-md" />
      <div className="h-8 bg-surface-container-high rounded-md" />
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
    <div className="p-4 md:p-10 max-w-container mx-auto w-full">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-display-lg-mobile md:text-display-lg text-primary mb-4 tracking-tight">
          Eksplorasi Profesi
        </h2>
        <p className="text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
          Temukan jalur karir yang cocok dengan kepribadian dan latar belakangmu dari{" "}
          {professions.length} pilihan. Gunakan filter untuk mempersempit fokusmu.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-xl mb-6">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input
          type="text"
          placeholder="Cari nama profesi..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setActiveCategory("Semua"); }}
          className="w-full bg-surface-container rounded-md pl-10 pr-10 py-2.5 text-body-md border-none focus:outline-none focus:ring-2 focus:ring-secondary transition-shadow"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-3 mb-10">
        <button
          onClick={() => { setActiveCategory("Semua"); setSearch(""); }}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-navy-sm ${
            activeCategory === "Semua"
              ? "bg-primary-container text-white hover:shadow-navy"
              : "bg-white border border-outline-variant/50 text-on-surface-variant hover:border-primary-container hover:text-primary-container hover:bg-primary-fixed/20"
          }`}
        >
          Semua ({professions.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.category}
            onClick={() => { setActiveCategory(cat.category); setSearch(""); }}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-navy-sm ${
              activeCategory === cat.category
                ? "bg-primary-container text-white hover:shadow-navy"
                : "bg-white border border-outline-variant/50 text-on-surface-variant hover:border-primary-container hover:text-primary-container hover:bg-primary-fixed/20"
            }`}
          >
            {cat.emoji} {cat.category.split(" & ")[0]} ({cat.count})
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-outline">
          <SearchX className="w-10 h-10 mx-auto mb-3" />
          <p className="font-medium text-on-surface">Tidak ada profesi dengan nama itu</p>
          <p className="text-sm mt-1 text-on-surface-variant">Coba kata kunci lain</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
          {filtered.map((p) => {
            const isRec = recommendedSlugs.has(p.slug);
            const workTags = p.work_style_summary.split(" · ").filter(Boolean);
            const style = categoryStyle(p.category);
            return (
              <div
                key={p.id}
                className={`rounded-xl bg-white border border-surface-variant shadow-[0px_4px_24px_rgba(0,35,102,0.04)] hover-lift relative overflow-hidden group flex flex-col ${
                  isRec ? "top-match-glow" : ""
                }`}
              >
                <div className={`absolute inset-0 opacity-60 pointer-events-none ${style.overlay}`} />
                <div className="relative z-10 p-6 flex flex-col flex-1">
                  {isRec && (
                    <div className="absolute top-0 right-0 bg-tertiary-fixed-dim text-on-tertiary-fixed font-label text-[11px] px-3 py-1.5 rounded-bl-lg font-bold shadow-navy-sm flex items-center gap-1">
                      <Star className="w-3.5 h-3.5" /> COCOK
                    </div>
                  )}

                  <div className="w-14 h-14 rounded-md bg-white shadow-navy-sm border border-primary-fixed/60 flex items-center justify-center text-3xl mb-5">
                    {p.emoji || "🎯"}
                  </div>

                  <div className="mb-5">
                    <h3 className="text-xl text-primary mb-1.5 font-bold">{p.name}</h3>
                    <p className={`font-medium text-sm ${style.accent}`}>{p.category}</p>
                  </div>

                  <div className="space-y-3 mb-6 bg-surface-container-lowest/50 p-4 rounded-md border border-surface-variant">
                    <div className="flex items-start gap-3 text-sm text-on-surface">
                      <GraduationCap className="w-4 h-4 text-outline mt-0.5 flex-shrink-0" />
                      <span className="font-medium">{p.education_years_min} tahun pendidikan</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-on-surface">
                      <TrendingUp className="w-4 h-4 text-tertiary-fixed-dim mt-0.5 flex-shrink-0" />
                      <span className="font-medium">{formatSalary(p.salary_min, p.salary_max)}</span>
                    </div>
                  </div>

                  {workTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {workTags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-surface-container-low border border-outline-variant/20 px-3 py-1.5 rounded text-xs font-medium text-on-surface-variant"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto grid grid-cols-2 gap-2">
                    <Link
                      href={`/explore/${p.slug}`}
                      className="text-center text-sm font-semibold text-on-surface-variant hover:text-primary-container py-2 border border-outline-variant/50 hover:border-primary-container rounded-full transition"
                    >
                      Detail
                    </Link>
                    <Link
                      href={`/chat/${p.slug}`}
                      className="flex items-center justify-center gap-1 text-sm font-semibold text-secondary hover:text-white hover:bg-secondary py-2 border border-secondary/30 hover:border-secondary rounded-full transition"
                    >
                      Chat AI <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <p className="text-center text-sm text-outline">
          Menampilkan {filtered.length} dari {professions.length} profesi
        </p>
      )}
    </div>
  );
}
