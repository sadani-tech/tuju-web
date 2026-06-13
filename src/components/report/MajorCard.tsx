import { MajorResult } from "@/types";
import { ScoreBar } from "@/components/ui/ScoreBar";

export function MajorCard({ item, rank }: { item: MajorResult; rank: number }) {
  return (
    <div className="glass-card accent-strip-blue rounded-lg p-4 shadow-navy-sm hover:shadow-navy transition-shadow">
      <div className="flex items-start justify-between mb-2 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label text-label-sm text-outline">#{rank}</span>
            <h3 className="font-semibold text-primary text-sm">
              {item.major_name}
            </h3>
          </div>
          {item.faculty && (
            <p className="font-label text-label-sm text-on-surface-variant">{item.faculty}</p>
          )}
        </div>
        <span className="bg-tertiary-fixed-dim/20 text-on-tertiary-fixed-variant font-label text-label-sm px-2.5 py-1 rounded-full font-bold whitespace-nowrap">
          {item.score.toFixed(0)}%
        </span>
      </div>
      <ScoreBar score={item.score} showPercent={false} />
    </div>
  );
}
