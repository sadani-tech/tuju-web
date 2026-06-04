interface ProgressBarProps {
  value: number; // 0-100
  color?: string; // tailwind bg class
  showLabel?: boolean;
  height?: string; // e.g. "h-2" or "h-3"
}

export function ProgressBar({
  value,
  color = "bg-blue-500",
  showLabel = false,
  height = "h-2",
}: ProgressBarProps) {
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Progress</span>
          <span>{value}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full ${height} overflow-hidden`}>
        <div
          className={`${color} ${height} rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}
