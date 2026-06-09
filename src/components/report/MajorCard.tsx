import { MajorResult } from "@/types";
import { ScoreBar } from "@/components/ui/ScoreBar";

export function MajorCard({ item, rank }: { item: MajorResult; rank: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-blue-300 transition">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-slate-400">#{rank}</span>
            <h3 className="font-semibold text-slate-900 text-sm">
              {item.major_name}
            </h3>
          </div>
          {item.faculty && (
            <p className="text-xs text-slate-500">{item.faculty}</p>
          )}
        </div>
        <span className="text-base font-bold text-blue-600">
          {item.score.toFixed(1)}%
        </span>
      </div>
      <ScoreBar score={item.score} showPercent={false} />
    </div>
  );
}
