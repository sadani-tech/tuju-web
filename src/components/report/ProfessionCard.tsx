import Link from "next/link";
import { MessageSquare, ArrowRight } from "lucide-react";
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
  const strip = rank === 1 ? "accent-strip-teal" : rank === 2 ? "accent-strip-blue" : "accent-strip-purple";

  return (
    <div className={`glass-card ${strip} rounded-lg p-5 shadow-navy-sm hover:shadow-navy transition-shadow`}>
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-surface-container-high rounded-md flex items-center justify-center text-xl shrink-0">
            {emoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label text-label-sm text-outline">#{rank}</span>
              <h3 className="font-semibold text-primary">{item.profession_name}</h3>
            </div>
            <PillBadge variant="slate">{item.category}</PillBadge>
          </div>
        </div>
        <span className="bg-tertiary-fixed-dim/20 text-on-tertiary-fixed-variant font-label text-label-sm px-2.5 py-1 rounded-full font-bold whitespace-nowrap">
          {item.score.toFixed(0)}% Match
        </span>
      </div>

      <ScoreBar score={item.score} showPercent={false} />

      {bd && (
        <div className="mt-3 bg-surface-container-low rounded-md p-3">
          <p className="font-label text-label-sm uppercase text-on-surface-variant mb-1.5">Rincian Skor</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {[
              { label: "RIASEC", val: bd.riasec },
              { label: "Work Style", val: bd.work_style },
              { label: "Minat", val: bd.interests },
              { label: "Akademik", val: bd.academic },
            ].map((b) => (
              <span key={b.label} className="text-xs text-on-surface-variant">
                {b.label}:{" "}
                <span className="font-semibold text-on-surface">
                  {b.val?.toFixed(0)}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {item.profession_slug && (
        <div className="mt-3 pt-3 border-t border-outline-variant/30">
          <Link
            href={`/chat/${item.profession_slug}`}
            className="flex items-center justify-center gap-1.5 font-label text-label-sm text-secondary hover:text-primary py-2 border border-secondary/40 hover:border-secondary rounded-md transition w-full"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Chat dengan AI Expert <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
