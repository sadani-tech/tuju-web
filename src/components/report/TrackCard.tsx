import { TrackResult } from "@/types";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { PillBadge } from "@/components/ui/PillBadge";

export function TrackCard({ item, rank }: { item: TrackResult; rank: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-blue-300 transition">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-slate-400">#{rank}</span>
            <h3 className="font-semibold text-slate-900 text-sm">
              {item.track_name}
            </h3>
          </div>
          <PillBadge variant={item.track_type === "smk" ? "amber" : "blue"}>
            {item.track_type === "smk" ? "SMK" : "SMA"}
          </PillBadge>
        </div>
        <span className="text-base font-bold text-blue-600">
          {item.score.toFixed(1)}%
        </span>
      </div>
      <ScoreBar score={item.score} showPercent={false} />
    </div>
  );
}
