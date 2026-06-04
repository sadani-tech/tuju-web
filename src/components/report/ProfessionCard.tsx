import { RecommendationItem } from "@/types";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { PillBadge } from "@/components/ui/PillBadge";

const EMOJI_MAP: Record<string, string> = {
  "Teknologi & Digital": "💻",
  "Kesehatan & Sains": "🏥",
  "Bisnis & Manajemen": "💼",
  "Pendidikan & Sosial": "📚",
  "Kreatif & Seni": "🎨",
  "Olahraga & Lifestyle": "⚽",
  "Layanan Publik & Kedinasan": "🏛️",
};

interface ProfessionCardProps {
  item: RecommendationItem;
  rank: number;
}

export function ProfessionCard({ item, rank }: ProfessionCardProps) {
  const emoji = EMOJI_MAP[item.category] || "🎯";
  const bd = item.breakdown;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-sm transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl">
            {emoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">#{rank}</span>
              <h3 className="font-semibold text-slate-900">{item.profession_name}</h3>
            </div>
            <PillBadge variant="slate">{item.category}</PillBadge>
          </div>
        </div>
        <span
          className={`text-xl font-bold ${
            item.score >= 80
              ? "text-green-600"
              : item.score >= 60
              ? "text-blue-600"
              : "text-slate-500"
          }`}
        >
          {item.score.toFixed(1)}%
        </span>
      </div>

      <ScoreBar score={item.score} showPercent={false} />

      {bd && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {[
            { label: "RIASEC", val: bd.riasec },
            { label: "Work Style", val: bd.work_style },
            { label: "Minat", val: bd.interests },
            { label: "Akademik", val: bd.academic },
          ].map((b) => (
            <span key={b.label} className="text-xs text-slate-500">
              {b.label}:{" "}
              <span className="font-semibold text-slate-700">
                {b.val?.toFixed(0)}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
