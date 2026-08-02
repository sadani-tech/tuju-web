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
import {
  ArrowLeft,
  Send,
  Clock,
  Lightbulb,
  Info,
  MessageCircle,
  Star,
  PartyPopper,
} from "lucide-react";
import { chatApi, streamChat } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ChatProfession, ChatMessage, ChatSession } from "@/types";

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
  const [sessions, setSessions] = useState<ChatSession[]>([]);
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

  // Recent consultations for the history sidebar
  useEffect(() => {
    chatApi
      .getSessions()
      .then((res) => setSessions(res.data))
      .catch(() => {});
  }, [slug]);

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
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-surface-bright">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 backdrop-blur-lg bg-surface/80 border-b border-outline-variant/30 shadow-navy-sm px-4 py-3 flex items-center gap-3 z-10 sticky top-0">
        <Link
          href="/chat"
          className="text-on-surface-variant hover:text-secondary transition p-1 -ml-1 rounded"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="w-10 h-10 bg-primary-fixed rounded-full border border-primary/10 flex items-center justify-center text-xl flex-shrink-0">
          {profession.emoji || "🎯"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-semibold text-primary text-sm truncate">
              {profession.name}
            </h1>
            <span className="text-xs px-2 py-0.5 bg-tertiary-fixed-dim/20 text-on-tertiary-container rounded-full flex-shrink-0">
              {profession.category}
            </span>
          </div>
          <p className="font-label text-label-sm text-on-surface-variant">
            {messageCount} pesan · Session aktif
          </p>
        </div>
      </header>

      {/* ── Chat canvas ────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* History sidebar */}
        <div className="hidden lg:flex w-72 flex-col border-r border-outline-variant/30 bg-surface-container-lowest overflow-y-auto">
          <div className="p-4 border-b border-outline-variant/20">
            <h3 className="font-label text-label-sm text-on-surface-variant uppercase tracking-wider">
              Konsultasi Terakhir
            </h3>
          </div>
          <div className="flex-1 p-2">
            {sessions.length === 0 && (
              <p className="p-3 text-sm text-on-surface-variant">Belum ada sesi lain.</p>
            )}
            {sessions.map((s) => {
              const isActive = s.session_id === sessionId;
              return (
                <Link
                  key={s.session_id}
                  href={`/chat/${s.profession.slug}?session=${s.session_id}`}
                  className={`block p-3 mb-2 rounded-md transition-colors border-l-4 ${
                    isActive
                      ? "bg-primary-fixed/20 hover:bg-primary-fixed/40 border-primary"
                      : "hover:bg-surface-container border-transparent"
                  }`}
                >
                  <div
                    className={`text-sm font-semibold truncate ${
                      isActive ? "text-primary" : "text-on-surface"
                    }`}
                  >
                    {s.profession.emoji} {s.profession.name}
                  </div>
                  <div className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(s.started_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    · {s.message_count} pesan
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main chat column */}
        <div className="flex-1 flex flex-col bg-surface-bright relative min-w-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-8 flex flex-col">
            {/* Empty state with suggested questions */}
            {messages.length === 0 && !isStreaming && (
              <div className="flex flex-col items-center justify-center min-h-[50%] text-center space-y-4 pt-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-tertiary-fixed-dim p-1 shadow-navy-sm">
                  <div className="w-full h-full bg-surface rounded-full flex items-center justify-center text-5xl">
                    {profession.emoji || "🎯"}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-primary">
                    Halo! Aku AI yang berperan sebagai {profession.name}
                  </p>
                  <p className="text-on-surface-variant text-sm mt-1 max-w-xs mx-auto">
                    Tanya apa saja tentang profesi ini — mulai dari keseharian,
                    gaji, cara memulai, sampai suka dukanya!
                  </p>
                </div>
              </div>
            )}

            {/* Message bubbles */}
            <div className="max-w-3xl mx-auto w-full space-y-8">
              {messages.map((msg, i) => (
                <MessageBubble
                  key={i}
                  msg={msg}
                  professionEmoji={profession.emoji}
                  professionName={profession.name}
                  professionCategory={profession.category}
                />
              ))}

              {/* Streaming bubble */}
              {isStreaming && (
                <div className="flex w-full gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0 border border-primary/10 text-lg">
                    {profession.emoji || "🤖"}
                  </div>
                  <div className="flex-1">
                    <div className="bg-surface-container-lowest p-5 rounded-xl rounded-tl-sm shadow-navy-sm inline-block border border-outline-variant/20 max-w-[85%]">
                      {streamingContent ? (
                        <p className="text-on-surface leading-relaxed whitespace-pre-wrap text-sm">
                          {streamingContent}
                          <span className="animate-pulse inline-block ml-0.5 text-secondary font-bold">
                            ▋
                          </span>
                        </p>
                      ) : (
                        <div className="flex gap-1 items-center py-1">
                          <span className="w-2 h-2 bg-outline-variant rounded-full animate-bounce [animation-delay:0ms]" />
                          <span className="w-2 h-2 bg-outline-variant rounded-full animate-bounce [animation-delay:150ms]" />
                          <span className="w-2 h-2 bg-outline-variant rounded-full animate-bounce [animation-delay:300ms]" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input area ─────────────────────────────────────────── */}
          <div className="p-4 md:p-6 bg-surface-bright/90 backdrop-blur-md border-t border-outline-variant/20 sticky bottom-0">
            <div className="max-w-3xl mx-auto w-full space-y-3">
              {/* Points banner */}
              {showPointsBanner && (
                <div className="text-xs text-on-tertiary-fixed-variant bg-tertiary-fixed/20 border border-tertiary-fixed-dim/40 rounded px-3 py-2 text-center flex items-center justify-center gap-1">
                  <Star className="w-3.5 h-3.5" /> 1 pesan lagi untuk dapat +30 poin!
                </div>
              )}

              {/* Quick reply chips */}
              {messages.length === 0 && !isStreaming && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="px-4 py-2 rounded-full bg-primary-fixed/30 text-on-primary-fixed border border-primary-fixed hover:bg-primary-fixed/50 transition-colors whitespace-nowrap text-sm font-medium"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat input box */}
              <div className="relative bg-surface-container-lowest rounded-md shadow-navy-sm border border-outline-variant/40 focus-within:border-primary-container focus-within:ring-2 focus-within:ring-primary-fixed transition-all p-2 flex items-end">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={isStreaming}
                  rows={1}
                  placeholder="Tanya sesuatu tentang profesi ini..."
                  className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none resize-none p-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 disabled:opacity-50"
                  style={{ minHeight: "40px", maxHeight: "96px" }}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isStreaming || !inputText.trim()}
                  className="bg-primary-container text-white p-2 rounded-md hover:bg-primary transition-colors flex items-center justify-center h-12 w-12 shadow-navy-sm disabled:opacity-40 flex-shrink-0"
                >
                  {isStreaming ? <LoadingSpinner size="sm" /> : <Send className="w-5 h-5" />}
                </button>
              </div>

              <p className="text-[10px] text-on-surface-variant/60 text-center">
                Powered by Gemini Flash · tekan Enter untuk kirim · AI bisa salah, verifikasi info penting.
              </p>
            </div>
          </div>
        </div>

        {/* Expert profile sidebar */}
        <div className="hidden xl:flex w-80 flex-col border-l border-outline-variant/30 bg-surface-container-lowest overflow-y-auto">
          <div className="p-6 border-b border-outline-variant/20 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-tertiary-fixed-dim p-1 mb-4 shadow-navy-sm">
              <div className="w-full h-full bg-surface rounded-full flex items-center justify-center text-4xl">
                {profession.emoji || "🤖"}
              </div>
            </div>
            <h2 className="text-headline-md text-primary font-bold">{profession.name}</h2>
            <p className="text-on-surface-variant text-sm mt-1">{profession.category}</p>
            <div className="mt-4 px-3 py-1 bg-tertiary-fixed-dim/20 text-on-tertiary-container rounded-full text-xs font-semibold uppercase tracking-wider">
              Online
            </div>
          </div>
          <div className="p-6 flex-1">
            {profession.description && (
              <>
                <h3 className="font-label text-label-sm text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" /> Tentang Profesi
                </h3>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                  {profession.description}
                </p>
                <hr className="border-outline-variant/30 my-6" />
              </>
            )}
            <h3 className="font-label text-label-sm text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
              <Info className="w-4 h-4" /> Konteks Sesi
            </h3>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-fixed/30 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">Pesan Terkirim</p>
                  <p className="text-sm text-on-surface-variant mt-0.5">{messageCount} pesan</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-fixed/30 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">Poin Sesi</p>
                  <p className="text-sm text-on-surface-variant mt-0.5">
                    {pointsAwarded ? "+30 poin diraih" : "Chat 5 pesan untuk +30 poin"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Points awarded modal ───────────────────────────────────── */}
      {pointsJustAwarded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/30 backdrop-blur-sm">
          <div className="glass-card rounded-xl shadow-navy-lg p-8 text-center space-y-3 mx-6">
            <PartyPopper className="w-12 h-12 mx-auto text-accent-purple" />
            <h2 className="text-headline-md text-gradient font-bold">+30 Poin!</h2>
            <p className="text-on-surface-variant">Kamu sudah selesaikan 1 sesi chat</p>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({
  msg,
  professionEmoji,
  professionName,
  professionCategory,
}: {
  msg: ChatMessage;
  professionEmoji: string | null;
  professionName: string;
  professionCategory: string;
}) {
  if (msg.role === "user") {
    return (
      <div className="flex w-full gap-4 justify-end">
        <div className="flex-1 flex justify-end">
          <div className="bg-primary-container text-white p-4 md:p-5 rounded-xl rounded-tr-sm shadow-navy-sm inline-block max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap">
            {msg.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full gap-4">
      <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0 border border-primary/10 text-lg">
        {professionEmoji || "🤖"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-surface-container-lowest p-4 md:p-5 rounded-xl rounded-tl-sm shadow-navy-sm inline-block border border-outline-variant/20 max-w-[85%]">
          <h4 className="font-semibold text-primary mb-2 flex items-center gap-2 text-sm">
            {professionName}
            <span className="text-xs px-2 py-0.5 bg-tertiary-fixed-dim/20 text-on-tertiary-container rounded-full">
              {professionCategory}
            </span>
          </h4>
          <p className="text-on-surface text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
        </div>
      </div>
    </div>
  );
}
