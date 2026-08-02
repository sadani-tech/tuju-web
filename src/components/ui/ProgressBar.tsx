interface ProgressBarProps {
  value: number; // 0-100
  color?: string; // tailwind bg class
  showLabel?: boolean;
  height?: string; // e.g. "h-2" or "h-3"
}

export function ProgressBar({
  value,
  color = "bg-secondary",
  showLabel = false,
  height = "h-2",
}: ProgressBarProps) {
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-on-surface-variant mb-1">
          <span>Progress</span>
          <span>{value}%</span>
        </div>
      )}
      <div className={`w-full bg-surface-container-highest rounded-full ${height} overflow-hidden`}>
        <div
          className={`${color} ${height} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}
