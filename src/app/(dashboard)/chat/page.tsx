"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { chatApi } from "@/lib/api";
import { ChatProfession, ChatSession } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

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
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Chat dengan AI Expert 🤖
        </h1>
        <p className="text-slate-500 mt-1">
          Ngobrol langsung dengan AI yang berperan sebagai profesional impianmu
        </p>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
              activeCategory === cat
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Profession grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-3xl mb-2">🔍</p>
          <p>Belum ada profesi di kategori ini</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((prof) => {
            const hasChatted = chattedSlugs.has(prof.slug);
            const resumeSessionId = sessionMap[prof.slug];
            const href = `/chat/${prof.slug}${resumeSessionId ? `?session=${resumeSessionId}` : ""}`;

            return (
              <div
                key={prof.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm transition flex flex-col"
              >
                {/* Emoji */}
                <div className="text-center mb-3">
                  <div className="text-5xl leading-none mb-2">
                    {prof.emoji || "🎯"}
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm leading-tight">
                    {prof.name}
                  </h3>
                  <span className="inline-block mt-1.5 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {prof.category}
                  </span>
                </div>

                <div className="mt-auto space-y-2">
                  {hasChatted && (
                    <div className="text-center">
                      <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                        ✓ Pernah Chat
                      </span>
                    </div>
                  )}
                  <Link
                    href={href}
                    className="block w-full text-center text-sm font-medium text-blue-600 hover:text-white hover:bg-blue-600 py-2 border border-blue-200 hover:border-blue-600 rounded-xl transition"
                  >
                    {hasChatted ? "Lanjutkan →" : "Mulai Chat →"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
