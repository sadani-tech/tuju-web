import { TrackResult } from "@/types";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { PillBadge } from "@/components/ui/PillBadge";

export function TrackCard({ item, rank }: { item: TrackResult; rank: number }) {
  return (
    <div className="glass-card accent-strip-teal rounded-lg p-4 shadow-navy-sm hover:shadow-navy transition-shadow">
      <div className="flex items-start justify-between mb-2 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label text-label-sm text-outline">#{rank}</span>
            <h3 className="font-semibold text-primary text-sm">
              {item.track_name}
            </h3>
          </div>
          <PillBadge variant={item.track_type === "smk" ? "amber" : "blue"}>
            {item.track_type === "smk" ? "SMK" : "SMA"}
          </PillBadge>
        </div>
        <span className="bg-tertiary-fixed-dim/20 text-on-tertiary-fixed-variant font-label text-label-sm px-2.5 py-1 rounded-full font-bold whitespace-nowrap">
          {item.score.toFixed(0)}%
        </span>
      </div>
      <ScoreBar score={item.score} showPercent={false} />
    </div>
  );
}
