interface ScoreBarProps {
  score: number; // 0-100
  showPercent?: boolean;
}

export function ScoreBar({ score, showPercent = true }: ScoreBarProps) {
  const color =
    score >= 80
      ? "bg-tertiary-fixed-dim"
      : score >= 60
      ? "bg-secondary"
      : score >= 40
      ? "bg-amber-400"
      : "bg-outline-variant";

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-surface-container-highest rounded-full h-2 overflow-hidden">
        <div
          className={`${color} h-2 rounded-full transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
      {showPercent && (
        <span
          className={`text-sm font-semibold w-12 text-right ${
            score >= 80
              ? "text-on-tertiary-container"
              : score >= 60
              ? "text-secondary"
              : "text-on-surface-variant"
          }`}
        >
          {score.toFixed(1)}%
        </span>
      )}
    </div>
  );
}
