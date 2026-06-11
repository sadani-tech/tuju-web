"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, SearchX, CheckCircle2 } from "lucide-react";
import { chatApi } from "@/lib/api";
import { ChatProfession, ChatSession } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Card color variants cycled by index, per the expert-selection mockup
const CARD_VARIANTS = [
  {
    card: "bg-gradient-to-br from-surface to-primary-fixed/30",
    blob: "bg-primary-container/5",
    chip: "text-secondary",
  },
  {
    card: "bg-gradient-to-br from-surface to-tertiary-fixed-dim/20",
    blob: "bg-tertiary-fixed-dim/10",
    chip: "text-on-tertiary-container",
  },
  {
    card: "bg-gradient-to-br from-surface to-accent-purple/10",
    blob: "bg-accent-purple/10",
    chip: "text-accent-purple",
  },
];

export default function ChatPage() {
  const [professions, setProfessions] = useState<ChatProfession[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      chatApi.getProfessions(),
      chatApi.getSessions(),
    ])
      .then(([profRes, sessRes]) => {
        setProfessions(profRes.data);
        setSessions(sessRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Map profession slug → most recent session_id
  const sessionMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of sessions) {
      if (s.profession?.slug && !map[s.profession.slug]) {
        map[s.profession.slug] = s.session_id;
      }
    }
    return map;
  }, [sessions]);

  const chattedSlugs = useMemo(() => new Set(Object.keys(sessionMap)), [sessionMap]);

  const categories = useMemo(() => {
    const cats = ["Semua", ...Array.from(new Set(professions.map((p) => p.category)))];
    return cats;
  }, [professions]);

  const filtered = useMemo(() => {
    if (activeCategory === "Semua") return professions;
    return professions.filter((p) => p.category === activeCategory);
  }, [professions, activeCategory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-10 py-12 max-w-container mx-auto w-full">
      {/* Header */}
      <div className="mb-12 text-center md:text-left">
        <h2 className="text-display-lg-mobile md:text-display-lg text-primary-container mb-6">
          Temukan Pemandumu
        </h2>
        <p className="text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
          Ngobrol dengan AI mentor yang berperan sebagai profesional di bidang impianmu — tanya
          seputar karir, industri, dan langkah selanjutnya.
        </p>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-3 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-full font-label text-label-sm transition-all ${
              activeCategory === cat
                ? "bg-primary-container text-on-primary shadow-navy-sm hover:bg-primary"
                : "bg-surface text-on-surface border border-outline-variant/30 hover:bg-surface-variant hover:shadow-navy-sm"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Expert grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-outline">
          <SearchX className="w-10 h-10 mx-auto mb-3" />
          <p>Belum ada profesi di kategori ini</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((prof, i) => {
            const variant = CARD_VARIANTS[i % CARD_VARIANTS.length];
            const hasChatted = chattedSlugs.has(prof.slug);
            const resumeSessionId = sessionMap[prof.slug];
            const href = `/chat/${prof.slug}${resumeSessionId ? `?session=${resumeSessionId}` : ""}`;
            const featured = i % CARD_VARIANTS.length === 0;

            return (
              <div
                key={prof.id}
                className={`glass-card rounded-xl p-8 border border-outline-variant/30 shadow-navy-sm flex flex-col hover:-translate-y-2 hover:shadow-navy-lg transition-all duration-300 relative overflow-hidden group ${variant.card}`}
              >
                <div
                  className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500 ${variant.blob}`}
                />
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className="w-16 h-16 rounded-xl bg-white shadow-navy-sm flex items-center justify-center border border-outline-variant/20 text-3xl">
                    {prof.emoji || "🎯"}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm font-label text-label-sm font-semibold shadow-navy-sm border border-outline-variant/10 ${variant.chip}`}
                    >
                      {prof.category}
                    </span>
                    {hasChatted && (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-tertiary-fixed/20 text-on-tertiary-fixed-variant font-label text-label-sm">
                        <CheckCircle2 className="w-3 h-3" /> Pernah Chat
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="text-headline-md text-primary-container mb-3 relative z-10">
                  {prof.name}
                </h3>
                <p className="text-body-md text-on-surface-variant mb-8 flex-grow leading-relaxed relative z-10">
                  {prof.description || `Ngobrol langsung dengan AI yang berperan sebagai ${prof.name}.`}
                </p>
                <Link
                  href={href}
                  className={`w-full py-3.5 rounded-md text-button transition-all duration-300 flex items-center justify-center gap-2 relative z-10 ${
                    featured
                      ? "bg-gradient-to-r from-primary-container to-secondary text-white shadow-navy-sm hover:shadow-navy hover:from-primary hover:to-primary-container"
                      : "bg-white border border-outline-variant/50 text-primary-container shadow-navy-sm hover:shadow-navy hover:border-primary-container hover:bg-primary-container/5"
                  }`}
                >
                  {hasChatted ? "Lanjutkan Chat" : "Mulai Chat"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
