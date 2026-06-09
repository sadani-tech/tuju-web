"use client";
import { useEffect, useState } from "react";
import { pointsApi } from "@/lib/api";
import type { PointsBalance, PointsTransaction } from "@/types";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { toast } from "@/components/ui/Toast";
import { usePointsStore, getLevelInfo } from "@/store/pointsStore";

const EARN_WAYS = [
  {
    category: "🟢 Easy",
    items: [
      { icon: "📝", label: "Isi satu section profil",  pts: 10  },
      { icon: "📚", label: "Baca artikel rekomendasi", pts: 10  },
      { icon: "👁️", label: "Baca Life Path Report",    pts: 20  },
      { icon: "🎉", label: "Selesaikan onboarding",    pts: 50  },
    ],
  },
  {
    category: "🟡 Medium",
    items: [
      { icon: "🤖", label: "Sesi AI Expert Chat",       pts: 30 },
      { icon: "✅", label: "Selesaikan roadmap task",   pts: 50 },
    ],
  },
  {
    category: "🔴 Hard",
    items: [
      { icon: "✦",  label: "Profile 100% complete",    pts: 200 },
      { icon: "🏆", label: "Update milestone nyata",   pts: 150 },
    ],
  },
  {
    category: "🎁 Bonus",
    items: [
      { icon: "🔥", label: "Login streak 7 hari",      pts: 50  },
      { icon: "🔥", label: "Login streak 30 hari",     pts: 200 },
    ],
  },
];

const REWARDS = [
  { icon: "🎙️", title: "Konsultasi Gratis",  desc: "1 sesi 30 menit",        cost: 500 },
  { icon: "📊", title: "Report Mendalam",    desc: "Analisis detail lengkap", cost: 300 },
  { icon: "🤖", title: "AI Chat Eksklusif",  desc: "Profesi premium",         cost: 200 },
];

type TxFilter = "all" | "earned" | "redeemed";

const SOURCE_ICON: Record<string, string> = {
  task:        "✅",
  chat:        "🤖",
  profile:     "📝",
  report:      "🎯",
  streak:      "🔥",
  milestone:   "🏆",
  onboarding:  "🎉",
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
  const filteredTx = transactions.filter((t) => {
    if (filter === "earned")   return t.amount > 0;
    if (filter === "redeemed") return t.amount < 0;
    return true;
  });

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      {/* Section 1 — Level & Balance */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white space-y-4">
        <div>
          <div className="flex items-center gap-1 mb-1">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className={`text-xl ${i < levelInfo.stars ? "text-amber-300" : "text-white/30"}`}>
                ★
              </span>
            ))}
          </div>
          <p className="text-blue-200 text-sm">Level:</p>
          <p className="text-xl font-bold">{levelInfo.name}</p>
        </div>
        <div>
          <p className="text-5xl font-bold">{totalPts.toLocaleString("id")}</p>
          <p className="text-blue-200 text-sm mt-0.5">Total Poin</p>
        </div>
        {levelInfo.nextName && (
          <div className="space-y-1.5">
            <p className="text-sm text-blue-200">
              {points?.points_to_next_level ?? 0} poin lagi untuk {levelInfo.nextName}
            </p>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${points?.progress_to_next_pct ?? levelInfo.progress}%` }}
              />
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">🔥 {points?.current_streak ?? 0}</p>
            <p className="text-xs text-blue-200">Hari streak</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">📊 {transactions.length}</p>
            <p className="text-xs text-blue-200">Total transaksi</p>
          </div>
        </div>
      </div>

      {/* Section 2 — Cara Dapat Poin */}
      <div className="space-y-4">
        <h2 className="font-bold text-lg text-slate-900">💡 Cara Dapat Poin</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EARN_WAYS.map((cat) => (
            <div key={cat.category} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
              <p className="font-semibold text-sm text-slate-700 mb-2">{cat.category}</p>
              {cat.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span className="text-slate-600 truncate">{item.label}</span>
                  </div>
                  <span className="font-semibold text-amber-600 flex-shrink-0 ml-2">+{item.pts} pts</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Section 3 — Tukar Poin */}
      <div className="space-y-4">
        <h2 className="font-bold text-lg text-slate-900">🎁 Tukar Poin</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {REWARDS.map((reward) => {
            const canAfford = totalPts >= reward.cost;
            return (
              <div
                key={reward.title}
                className={`bg-white border rounded-2xl p-5 space-y-3 transition ${
                  canAfford
                    ? "border-slate-200 hover:border-blue-300 hover:shadow-sm"
                    : "border-slate-200 opacity-60"
                }`}
              >
                <p className="text-3xl">{reward.icon}</p>
                <div>
                  <p className="font-semibold text-slate-800">{reward.title}</p>
                  <p className="text-xs text-slate-500">{reward.desc}</p>
                </div>
                <p className="text-lg font-bold text-amber-600">{reward.cost} poin</p>
                <button
                  onClick={() => canAfford && handleRedeem(reward)}
                  disabled={!canAfford || redeemingReward === reward.title}
                  className={`w-full rounded-xl py-2 text-sm font-semibold transition ${
                    canAfford
                      ? "bg-blue-600 hover:bg-blue-500 text-white"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {redeemingReward === reward.title
                    ? "Memproses..."
                    : canAfford
                    ? "Tukar Sekarang"
                    : `🔒 Butuh ${reward.cost - totalPts} poin lagi`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 4 — Riwayat Transaksi */}
      <div className="space-y-4">
        <h2 className="font-bold text-lg text-slate-900">📜 Riwayat Transaksi</h2>
        <div className="flex gap-2">
          {(["all", "earned", "redeemed"] as TxFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === f
                  ? "bg-blue-100 text-blue-700"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-blue-200"
              }`}
            >
              {f === "all" ? "Semua" : f === "earned" ? "Diraih" : "Ditukar"}
            </button>
          ))}
        </div>
        {filteredTx.length === 0 ? (
          <p className="text-center text-slate-500 py-8">Belum ada transaksi</p>
        ) : (
          <div className="space-y-2">
            {filteredTx.map((t) => {
              const isPositive = t.amount > 0;
              return (
                <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                  <span className="text-xl w-8 text-center flex-shrink-0">
                    {SOURCE_ICON[t.source] ?? "📌"}
                  </span>
                  <span className="flex-1 text-sm text-slate-700 truncate">{t.description}</span>
                  <span className={`text-sm font-bold flex-shrink-0 ${isPositive ? "text-green-600" : "text-red-500"}`}>
                    {isPositive ? "+" : ""}{t.amount} pts
                  </span>
                  <span className="text-xs text-slate-400 flex-shrink-0 hidden md:block">
                    {formatDate(t.created_at)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
