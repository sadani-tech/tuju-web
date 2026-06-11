"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
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
    <div className="p-4 md:p-10 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/chat"
          className="flex items-center gap-2 text-secondary font-label text-label-sm hover:underline mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke AI Expert
        </Link>
        <h1 className="text-display-lg-mobile text-gradient mb-2">Riwayat Chat</h1>
        <p className="text-body-md text-on-surface-variant">{sessions.length} sesi konsultasi</p>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-16 text-on-surface-variant space-y-3">
          <MessageCircle className="w-10 h-10 mx-auto text-outline" />
          <p>Belum ada sesi chat</p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-1 text-sm text-secondary font-semibold hover:underline"
          >
            Mulai chat sekarang <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.session_id}
              className="glass-card rounded-lg shadow-navy-sm border border-outline-variant/30 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-navy border-l-4 border-l-transparent hover:border-l-secondary-container"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-fixed rounded-full border border-primary/10 flex items-center justify-center text-xl flex-shrink-0">
                    {session.profession.emoji || "🎯"}
                  </div>
                  <div>
                    <p className="font-semibold text-primary">{session.profession.name}</p>
                    <p className="font-label text-label-sm text-on-surface-variant mt-0.5">
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
                    <span className="flex items-center gap-1 text-xs bg-tertiary-fixed-dim/10 text-on-tertiary-container border border-tertiary-fixed-dim/20 px-3 py-1 rounded-full font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> +30 pts
                    </span>
                  )}
                  <Link
                    href={`/chat/${session.profession.slug}?session=${session.session_id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-secondary border border-secondary/30 hover:border-secondary hover:bg-secondary/5 px-3 py-1.5 rounded-full transition"
                  >
                    Lanjutkan <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {session.last_message_preview && (
                <p className="mt-3 text-sm text-on-surface-variant line-clamp-2 pl-[60px]">
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
