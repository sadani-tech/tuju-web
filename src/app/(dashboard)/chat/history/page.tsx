"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { chatApi } from "@/lib/api";
import { ChatSession } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function ChatHistoryPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chatApi
      .getSessions()
      .then((res) => setSessions(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/chat"
          className="text-slate-500 hover:text-slate-800 transition p-1 rounded-lg"
        >
          ←
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Riwayat Chat</h1>
          <p className="text-sm text-slate-500">{sessions.length} sesi</p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-16 text-slate-400 space-y-3">
          <p className="text-4xl">💬</p>
          <p>Belum ada sesi chat</p>
          <Link
            href="/chat"
            className="inline-block text-sm text-blue-600 hover:underline"
          >
            Mulai chat sekarang →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.session_id}
              className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-blue-300 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    {session.profession.emoji || "🎯"}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">
                      {session.profession.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {session.message_count} pesan ·{" "}
                      {new Date(session.started_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {session.points_awarded && (
                    <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                      ✅ +30 pts
                    </span>
                  )}
                  <Link
                    href={`/chat/${session.profession.slug}?session=${session.session_id}`}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded-lg transition"
                  >
                    Lanjutkan →
                  </Link>
                </div>
              </div>

              {session.last_message_preview && (
                <p className="mt-3 text-xs text-slate-500 line-clamp-2 pl-13">
                  {session.last_message_preview}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
