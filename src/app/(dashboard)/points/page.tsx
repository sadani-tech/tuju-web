"use client";
import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  Sparkles,
  Trophy,
  Flame,
  Check,
  Lock,
  Mic,
  BarChart3,
  Bot,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { pointsApi } from "@/lib/api";
import type { PointsBalance, PointsTransaction } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { toast } from "@/components/ui/Toast";
import { usePointsStore, getLevelInfo } from "@/store/pointsStore";

const EARN_WAYS: {
  title: string;
  chip: string;
  desc: string;
  icon: LucideIcon;
  strip: string;
  tile: string;
  dot: string;
  pill: string;
  check: string;
  items: { label: string; pts: number }[];
}[] = [
  {
    title: "Interaksi Harian",
    chip: "Mudah",
    desc: "Aktivitas ringan untuk membangun kebiasaan baik.",
    icon: ClipboardCheck,
    strip: "border-t-secondary",
    tile: "bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-white",
    dot: "bg-secondary",
    pill: "text-secondary bg-secondary/10",
    check: "text-secondary",
    items: [
      { label: "Isi satu section profil",  pts: 10 },
      { label: "Baca artikel rekomendasi", pts: 10 },
      { label: "Baca Life Path Report",    pts: 20 },
      { label: "Selesaikan onboarding",    pts: 50 },
    ],
  },
  {
    title: "Pencapaian",
    chip: "Menengah",
    desc: "Selesaikan tugas penting dalam perjalanan karirmu.",
    icon: Sparkles,
    strip: "border-t-tertiary-fixed-dim",
    tile: "bg-tertiary-fixed-dim/10 text-on-tertiary-container group-hover:bg-tertiary-fixed-dim group-hover:text-on-tertiary-fixed",
    dot: "bg-tertiary-fixed-dim",
    pill: "text-on-tertiary-container bg-tertiary-fixed-dim/10",
    check: "text-on-tertiary-container",
    items: [
      { label: "Sesi AI Expert Chat",     pts: 30 },
      { label: "Selesaikan roadmap task", pts: 50 },
    ],
  },
  {
    title: "Prestasi Utama",
    chip: "Tantangan",
    desc: "Lompatan besar untuk profil profesionalmu.",
    icon: Trophy,
    strip: "border-t-primary-container",
    tile: "bg-primary-container/10 text-primary-container group-hover:bg-primary-container group-hover:text-white",
    dot: "bg-primary-container",
    pill: "text-primary-container bg-primary-container/10",
    check: "text-primary-container",
    items: [
      { label: "Profile 100% complete",  pts: 200 },
      { label: "Update milestone nyata", pts: 150 },
    ],
  },
  {
    title: "Bonus Streak",
    chip: "Bonus",
    desc: "Konsistensi harianmu dihargai lebih.",
    icon: Flame,
    strip: "border-t-accent-purple",
    tile: "bg-accent-purple/10 text-accent-purple group-hover:bg-accent-purple group-hover:text-white",
    dot: "bg-accent-purple",
    pill: "text-accent-purple bg-accent-purple/10",
    check: "text-accent-purple",
    items: [
      { label: "Login streak 7 hari",  pts: 50 },
      { label: "Login streak 30 hari", pts: 200 },
    ],
  },
];

const REWARDS: { icon: LucideIcon; title: string; desc: string; cost: number; tile: string; pill: string }[] = [
  { icon: Mic,       title: "Konsultasi Gratis", desc: "1 sesi 30 menit",         cost: 500, tile: "bg-primary/5 text-primary",                          pill: "bg-primary text-white" },
  { icon: BarChart3, title: "Report Mendalam",   desc: "Analisis detail lengkap", cost: 300, tile: "bg-secondary/5 text-secondary",                      pill: "bg-secondary text-white" },
  { icon: Bot,       title: "AI Chat Eksklusif", desc: "Profesi premium",         cost: 200, tile: "bg-tertiary-fixed-dim/10 text-on-tertiary-container", pill: "bg-tertiary-fixed-dim text-on-tertiary-fixed" },
];

type TxFilter = "all" | "earned" | "redeemed";

const SOURCE_LABEL: Record<string, string> = {
  task:       "Roadmap",
  chat:       "AI Expert",
  profile:    "Profil",
  report:     "Life Path",
  streak:     "Streak",
  milestone:  "Milestone",
  onboarding: "Onboarding",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function PointsPage() {
  const [points, setPoints]           = useState<PointsBalance | null>(null);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState<TxFilter>("all");
  const [redeemingReward, setRedeemingReward] = useState<string | null>(null);
  const { setPoints: storeSetPoints, addPoints } = usePointsStore();

  useEffect(() => {
    Promise.all([pointsApi.get(), pointsApi.transactions()])
      .then(([pRes, tRes]) => {
        setPoints(pRes.data);
        storeSetPoints(pRes.data);
        setTransactions(tRes.data);
      })
      .catch(() => toast("Gagal memuat data poin", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleRedeem = async (reward: typeof REWARDS[0]) => {
    const totalPts = points?.total_points ?? 0;
    if (totalPts < reward.cost) {
      toast(`Poin belum cukup, butuh ${reward.cost - totalPts} poin lagi`, "error");
      return;
    }
    if (!confirm(`Tukar ${reward.cost} poin untuk "${reward.title}"?`)) return;
    setRedeemingReward(reward.title);
    try {
      await pointsApi.redeem({ reward_type: reward.title, cost: reward.cost });
      addPoints(-reward.cost);
      setPoints((p) => p ? { ...p, total_points: p.total_points - reward.cost } : p);
      toast(`✅ Berhasil menukar "${reward.title}"!`, "success");
      Promise.all([pointsApi.get(), pointsApi.transactions()])
        .then(([pRes, tRes]) => {
          setPoints(pRes.data);
          storeSetPoints(pRes.data);
          setTransactions(tRes.data);
        }).catch(() => {});
    } catch {
      toast("Gagal menukar reward", "error");
    } finally {
      setRedeemingReward(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalPts   = points?.total_points ?? 0;
  const levelInfo  = getLevelInfo(totalPts);
  const progressPct = Math.min(100, points?.progress_to_next_pct ?? levelInfo.progress);
  // SVG ring: r=44 → circumference ≈ 276
  const ringOffset = 276 - (276 * progressPct) / 100;
  const filteredTx = transactions.filter((t) => {
    if (filter === "earned")   return t.amount > 0;
    if (filter === "redeemed") return t.amount < 0;
    return true;
  });

  return (
    <div className="max-w-container mx-auto px-4 md:px-10 py-12 space-y-16">
      {/* ── Hero — Level & Balance ─────────────────────────────────── */}
      <section className="rounded-xl p-8 md:p-12 relative overflow-hidden text-white bg-[linear-gradient(135deg,rgba(0,35,102,0.9)_0%,rgba(0,223,193,0.85)_100%)] border border-white/20 shadow-[0_20px_40px_rgba(0,35,102,0.15)] backdrop-blur-xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-tertiary-fixed-dim/40 rounded-full blur-[80px]" />
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-primary-fixed/30 rounded-full blur-[60px]" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md text-white rounded-full font-label text-label-sm mb-6 border border-white/30 uppercase tracking-wider">
              {"★".repeat(levelInfo.stars)} Level {levelInfo.stars}
            </span>
            <h1 className="text-display-lg-mobile md:text-display-lg text-white mb-3">{levelInfo.name}</h1>
            <p className="text-body-lg text-white/80 mb-8 max-w-md">
              Kamu sedang menavigasi jalurmu dengan tujuan. Selesaikan lebih banyak milestone untuk
              naik ke tingkat berikutnya.
            </p>
            {levelInfo.nextName && (
              <div className="mb-4 bg-white/10 p-5 rounded-lg border border-white/10 backdrop-blur-sm">
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-button text-white/90">Progress ke {levelInfo.nextName}</span>
                  <span className="text-button text-white">
                    {points?.points_to_next_level ?? 0} pts lagi
                  </span>
                </div>
                <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0.5)_0%,#ffffff_100%)] transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <div className="bg-white/10 rounded-lg p-3 text-center border border-white/10">
                <p className="text-2xl font-bold flex items-center justify-center gap-1">
                  <Flame className="w-5 h-5" /> {points?.current_streak ?? 0}
                </p>
                <p className="font-label text-label-sm text-white/70">Hari streak</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center border border-white/10">
                <p className="text-2xl font-bold">{transactions.length}</p>
                <p className="font-label text-label-sm text-white/70">Total transaksi</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-72 h-72 flex items-center justify-center">
              <div className="absolute inset-0 bg-white/5 rounded-full backdrop-blur-sm border border-white/10" />
              <svg className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-lg" viewBox="0 0 100 100">
                <circle className="text-white/10" cx="50" cy="50" fill="none" r="44" stroke="currentColor" strokeWidth="3" />
                <circle
                  className="text-tertiary-fixed"
                  cx="50" cy="50" fill="none" r="44"
                  stroke="currentColor"
                  strokeDasharray="276"
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  strokeWidth="6"
                />
              </svg>
              <div className="text-center z-10">
                <span className="block font-label text-label-sm text-white/70 uppercase tracking-widest mb-1">
                  Total Poin
                </span>
                <span className="block text-5xl md:text-6xl font-bold tracking-tight text-white drop-shadow-md">
                  {totalPts.toLocaleString("id")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cara Dapat Poin ────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-headline-md text-primary">Cara Dapat Poin</h2>
          <div className="h-px bg-outline-variant/30 flex-1" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {EARN_WAYS.map((cat) => (
            <div
              key={cat.title}
              className={`glass-card rounded-xl p-6 hover:-translate-y-1 transition-all duration-300 border-t-4 shadow-navy-sm group ${cat.strip}`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-md transition-colors ${cat.tile}`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 bg-surface-container rounded-full font-label text-label-sm text-on-surface-variant flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${cat.dot}`} /> {cat.chip}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">{cat.title}</h3>
              <p className="text-sm text-on-surface-variant mb-4">{cat.desc}</p>
              <div className="space-y-3">
                {cat.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm gap-2">
                    <span className="text-on-surface-variant flex items-center gap-2 min-w-0">
                      <Check className={`w-3.5 h-3.5 flex-shrink-0 ${cat.check}`} />
                      <span className="truncate">{item.label}</span>
                    </span>
                    <span className={`text-button text-sm px-2 py-0.5 rounded-full flex-shrink-0 ${cat.pill}`}>
                      +{item.pts}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tukar Poin ─────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-headline-md text-primary">Tukar Poin</h2>
          <div className="h-px bg-outline-variant/30 flex-1" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REWARDS.map((reward) => {
            const canAfford = totalPts >= reward.cost;
            return (
              <div
                key={reward.title}
                className={`glass-card rounded-xl p-5 flex flex-col items-center text-center shadow-navy-sm transition-shadow ${
                  canAfford ? "hover:shadow-navy" : "opacity-60"
                }`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${reward.tile}`}>
                  <reward.icon className="w-8 h-8" />
                </div>
                <h4 className="text-button text-primary mb-1">{reward.title}</h4>
                <p className="text-xs text-on-surface-variant mb-4">{reward.desc}</p>
                <button
                  onClick={() => canAfford && handleRedeem(reward)}
                  disabled={!canAfford || redeemingReward === reward.title}
                  className={`px-4 py-1.5 rounded-full text-button text-sm mt-auto transition flex items-center gap-1.5 ${
                    canAfford
                      ? `${reward.pill} hover:opacity-90`
                      : "bg-surface-container text-outline cursor-not-allowed"
                  }`}
                >
                  {redeemingReward === reward.title ? (
                    "Memproses..."
                  ) : canAfford ? (
                    `Tukar · ${reward.cost.toLocaleString("id")} pts`
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" /> {reward.cost.toLocaleString("id")} pts
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Riwayat Transaksi ──────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <h2 className="text-headline-md text-primary">Riwayat Transaksi</h2>
          <div className="flex gap-2">
            {(["all", "earned", "redeemed"] as TxFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full font-label text-label-sm transition ${
                  filter === f
                    ? "bg-primary-container text-white shadow-navy-sm"
                    : "bg-white border border-outline-variant/50 text-on-surface-variant hover:border-primary-container hover:text-primary-container"
                }`}
              >
                {f === "all" ? "Semua" : f === "earned" ? "Diraih" : "Ditukar"}
              </button>
            ))}
          </div>
        </div>

        {filteredTx.length === 0 ? (
          <p className="text-center text-on-surface-variant py-8">Belum ada transaksi</p>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden shadow-navy-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container/50 border-b border-outline-variant/20">
                    <th className="py-4 px-6 font-label text-label-sm text-on-surface-variant uppercase tracking-wider w-32">Tanggal</th>
                    <th className="py-4 px-6 font-label text-label-sm text-on-surface-variant uppercase tracking-wider">Aktivitas</th>
                    <th className="py-4 px-6 font-label text-label-sm text-on-surface-variant uppercase tracking-wider w-32">Tipe</th>
                    <th className="py-4 px-6 font-label text-label-sm text-on-surface-variant uppercase tracking-wider text-right w-32">Poin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-sm">
                  {filteredTx.map((t) => {
                    const isPositive = t.amount > 0;
                    return (
                      <tr key={t.id} className="hover:bg-surface-variant/30 transition-colors group">
                        <td className="py-4 px-6 text-on-surface-variant whitespace-nowrap">
                          {formatDate(t.created_at)}
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-medium text-primary">{t.description}</p>
                          <p className="text-xs text-on-surface-variant mt-0.5">
                            {SOURCE_LABEL[t.source] ?? t.source}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              isPositive ? "bg-secondary/10 text-secondary" : "bg-error/10 text-error"
                            }`}
                          >
                            {isPositive ? "Earn" : "Redeem"}
                          </span>
                        </td>
                        <td
                          className={`py-4 px-6 text-right text-button whitespace-nowrap group-hover:scale-105 transition-transform origin-right ${
                            isPositive ? "text-secondary" : "text-error"
                          }`}
                        >
                          {isPositive ? "+" : ""}
                          {t.amount.toLocaleString("id")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
