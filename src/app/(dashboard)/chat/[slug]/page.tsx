"use client";
import {
  useEffect,
  useRef,
  useState,
  useCallback,
  KeyboardEvent,
  ChangeEvent,
} from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { chatApi, streamChat } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ChatProfession, ChatMessage } from "@/types";

const SUGGESTED_QUESTIONS = [
  "Seperti apa keseharian kerjamu?",
  "Berapa gaji awal di bidang ini?",
  "Bagaimana cara mulai karier di sini?",
];

export default function ChatRoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [profession, setProfession] = useState<ChatProfession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [pointsAwarded, setPointsAwarded] = useState(false);
  const [pointsJustAwarded, setPointsJustAwarded] = useState(false);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const streamingContentRef = useRef("");

  // Auto-scroll whenever messages or streaming content changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Auto-dismiss points modal
  useEffect(() => {
    if (!pointsJustAwarded) return;
    const timer = setTimeout(() => setPointsJustAwarded(false), 2500);
    return () => clearTimeout(timer);
  }, [pointsJustAwarded]);

  // Load profession + start/resume session
  useEffect(() => {
    const resumeId = searchParams.get("session");

    chatApi
      .getProfessions()
      .then((res) => {
        const prof: ChatProfession | undefined = res.data.find(
          (p: ChatProfession) => p.slug === slug
        );
        if (!prof) {
          router.replace("/chat");
          return;
        }
        setProfession(prof);

        return chatApi.startSession({
          profession_id: prof.id,
          ...(resumeId ? { resume_session_id: resumeId } : {}),
        });
      })
      .then((res) => {
        if (!res) return;
        const { session_id, history } = res.data;
        setSessionId(session_id);
        setPointsAwarded(res.data.profession?.points_awarded ?? false);

        if (history?.length) {
          setMessages(
            history.map((m: ChatMessage) => ({
              role: m.role,
              content: m.content,
              created_at: m.created_at,
            }))
          );
          setMessageCount(history.filter((m: ChatMessage) => m.role === "user").length);
        }

        // Persist session in URL without navigation
        const url = new URL(window.location.href);
        url.searchParams.set("session", session_id);
        window.history.replaceState({}, "", url.toString());
      })
      .catch(() => toast("Gagal memuat profesi", "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleSend = useCallback(
    async (overrideText?: string) => {
      const message = (overrideText ?? inputText).trim();
      if (!message || !sessionId || isStreaming) return;

      const history = messages.map((m) => ({ role: m.role, content: m.content }));

      setMessages((prev) => [...prev, { role: "user", content: message }]);
      setInputText("");
      setStreamingContent("");
      streamingContentRef.current = "";
      setIsStreaming(true);

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      try {
        await streamChat(
          { session_id: sessionId, message, history },
          (chunk) => {
            streamingContentRef.current += chunk;
            setStreamingContent((prev) => prev + chunk);
          },
          (doneEvent) => {
            const finalContent = streamingContentRef.current;
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: finalContent },
            ]);
            setStreamingContent("");
            streamingContentRef.current = "";
            setIsStreaming(false);
            if (doneEvent.message_count != null) {
              setMessageCount(doneEvent.message_count);
            }
            if (doneEvent.session_id) {
              setSessionId(doneEvent.session_id);
            }
          },
          (points) => {
            setPointsAwarded(true);
            setPointsJustAwarded(true);
          },
          (errMsg) => {
            toast(errMsg, "error");
            setIsStreaming(false);
          }
        );
      } catch {
        toast("Koneksi terputus, coba lagi", "error");
        setIsStreaming(false);
      }
    },
    [inputText, sessionId, isStreaming, messages]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 96)}px`;
  };

  const userMessageCount = messages.filter((m) => m.role === "user").length;
  const showPointsBanner =
    !pointsAwarded && messageCount >= 4 && messageCount < 5;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[100dvh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profession) return null;

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-slate-50">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 z-10">
        <Link
          href="/chat"
          className="text-slate-500 hover:text-slate-800 transition p-1 -ml-1 rounded-lg"
        >
          ←
        </Link>

        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
          {profession.emoji || "🎯"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-semibold text-slate-900 text-sm truncate">
              {profession.name}
            </h1>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex-shrink-0">
              {profession.category}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {messageCount} pesan · Session aktif
          </p>
        </div>
      </header>

      {/* ── Conversation area ──────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Empty state with suggested questions */}
        {messages.length === 0 && !isStreaming && (
          <div className="flex flex-col items-center justify-center min-h-[50%] text-center space-y-4 pt-8">
            <div className="text-[72px] leading-none">{profession.emoji || "🎯"}</div>
            <div>
              <p className="font-semibold text-slate-900">
                Halo! Aku AI yang berperan sebagai {profession.name}
              </p>
              <p className="text-slate-500 text-sm mt-1 max-w-xs">
                Tanya apa saja tentang profesi ini — mulai dari keseharian,
                gaji, cara memulai, sampai suka dukanya!
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-sm">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="text-sm bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-600 px-3 py-2 rounded-xl transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} professionEmoji={profession.emoji} />
        ))}

        {/* Streaming bubble */}
        {isStreaming && (
          <div className="flex gap-2 items-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[80%] shadow-sm">
              {streamingContent ? (
                <p className="text-slate-800 leading-relaxed whitespace-pre-wrap text-sm">
                  {streamingContent}
                  <span className="animate-pulse inline-block ml-0.5 text-blue-500 font-bold">
                    ▋
                  </span>
                </p>
              ) : (
                <div className="flex gap-1 items-center py-1">
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input area ─────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-t border-slate-200 px-4 pt-3 pb-4 md:pb-3 space-y-2">
        {/* Points banner */}
        {showPointsBanner && (
          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-center">
            ⭐ 1 pesan lagi untuk dapat +30 poin!
          </div>
        )}

        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            rows={1}
            placeholder="Tanya sesuatu tentang profesi ini..."
            className="flex-1 resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 disabled:opacity-50 disabled:bg-slate-50 transition"
            style={{ minHeight: "40px", maxHeight: "96px" }}
          />
          <button
            onClick={() => handleSend()}
            disabled={isStreaming || !inputText.trim()}
            className="h-10 w-10 flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl transition flex-shrink-0"
          >
            {isStreaming ? (
              <LoadingSpinner size="sm" />
            ) : (
              <span className="text-sm">→</span>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-400 text-center">
          Powered by Gemini Flash · tekan Enter untuk kirim
        </p>
      </div>

      {/* ── Points awarded modal ───────────────────────────────────── */}
      {pointsJustAwarded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-3 mx-6">
            <p className="text-5xl">🎉</p>
            <h2 className="text-2xl font-bold text-slate-900">+30 Poin!</h2>
            <p className="text-slate-500">Kamu sudah selesaikan 1 sesi chat</p>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({
  msg,
  professionEmoji,
}: {
  msg: ChatMessage;
  professionEmoji: string | null;
}) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-[75%] text-sm leading-relaxed whitespace-pre-wrap">
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-start">
      <div className="w-7 h-7 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
        {professionEmoji || "🤖"}
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[80%] shadow-sm text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
        {msg.content}
      </div>
    </div>
  );
}
