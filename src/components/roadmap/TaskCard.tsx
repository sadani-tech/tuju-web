import type { RoadmapTask } from "@/types";
import { PillBadge } from "@/components/ui/PillBadge";

interface TaskCardProps {
  task: RoadmapTask;
  onComplete: (id: string) => void;
  completing?: boolean;
}

type DiffVariant = "green" | "amber" | "red";

const DIFFICULTY: Record<string, { label: string; variant: DiffVariant }> = {
  easy:   { label: "Mudah",    variant: "green" },
  medium: { label: "Menengah", variant: "amber" },
  hard:   { label: "Sulit",    variant: "red"   },
};

export function TaskCard({ task, onComplete, completing }: TaskCardProps) {
  const isCompleted = task.status === "completed";
  const isLocked    = task.status === "locked";
  const diff        = DIFFICULTY[task.difficulty] ?? { label: task.difficulty, variant: "green" as DiffVariant };

  return (
    <div
      className={`bg-white border rounded-xl p-4 transition ${
        isCompleted
          ? "border-blue-200 opacity-60"
          : isLocked
          ? "border-slate-100 opacity-40 cursor-not-allowed"
          : "border-slate-200 hover:border-blue-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => !isCompleted && !isLocked && onComplete(task.id)}
          disabled={isCompleted || isLocked || completing}
          className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition ${
            isCompleted
              ? "bg-blue-500 border-blue-500"
              : completing
              ? "border-blue-300 bg-blue-50 cursor-wait"
              : isLocked
              ? "border-slate-200 cursor-not-allowed"
              : "border-slate-300 hover:border-blue-400"
          }`}
        >
          {(isCompleted || completing) && (
            <span className={`text-xs leading-none ${isCompleted ? "text-white" : "text-blue-400"}`}>
              ✓
            </span>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-sm font-medium leading-snug ${
                isCompleted ? "line-through text-slate-400" : "text-slate-800"
              }`}
            >
              {task.title}
            </p>
            <span className="text-xs font-semibold text-amber-600 flex-shrink-0 mt-0.5">
              +{task.points_reward} pts
            </span>
          </div>
          {task.description && (
            <p className={`text-xs mt-1 ${isCompleted ? "text-slate-400" : "text-slate-500"}`}>
              {task.description}
            </p>
          )}
          <div className="mt-2">
            <PillBadge variant={diff.variant}>{diff.label}</PillBadge>
          </div>
        </div>
      </div>
    </div>
  );
}
