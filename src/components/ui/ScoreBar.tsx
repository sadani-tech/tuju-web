interface ScoreBarProps {
  score: number; // 0-100
  showPercent?: boolean;
}

export function ScoreBar({ score, showPercent = true }: ScoreBarProps) {
  const color =
    score >= 80
      ? "bg-green-500"
      : score >= 60
      ? "bg-blue-500"
      : score >= 40
      ? "bg-amber-500"
      : "bg-slate-300";

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={`${color} h-2 rounded-full transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
      {showPercent && (
        <span
          className={`text-sm font-semibold w-12 text-right ${
            score >= 80
              ? "text-green-600"
              : score >= 60
              ? "text-blue-600"
              : "text-slate-500"
          }`}
        >
          {score.toFixed(1)}%
        </span>
      )}
    </div>
  );
}
