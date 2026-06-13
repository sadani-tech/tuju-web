import { Lock, Check } from "lucide-react";
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
      className={`glass-card rounded-md p-4 transition ${
        isCompleted
          ? "opacity-70"
          : isLocked
          ? "opacity-40 cursor-not-allowed"
          : "shadow-navy-sm hover:shadow-navy"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => !isCompleted && !isLocked && onComplete(task.id)}
          disabled={isCompleted || isLocked || completing}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${
            isCompleted
              ? "bg-tertiary-fixed-dim border-tertiary-fixed-dim"
              : completing
              ? "border-secondary/50 bg-primary-fixed/40 cursor-wait"
              : isLocked
              ? "border-outline-variant cursor-not-allowed"
              : "border-outline hover:border-secondary"
          }`}
        >
          {isLocked && <Lock className="w-2.5 h-2.5 text-outline" />}
          {(isCompleted || completing) && (
            <Check className={`w-3 h-3 ${isCompleted ? "text-on-tertiary-fixed" : "text-secondary"}`} />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-sm font-medium leading-snug ${
                isCompleted ? "line-through text-outline" : "text-on-surface"
              }`}
            >
              {task.title}
            </p>
            <span
              className={`font-label text-label-sm font-bold px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap ${
                isCompleted
                  ? "bg-tertiary-fixed-dim/20 text-on-tertiary-fixed-variant"
                  : "bg-primary-fixed text-on-primary-fixed-variant"
              }`}
            >
              {isCompleted ? "Selesai " : ""}+{task.points_reward} XP
            </span>
          </div>
          {task.description && (
            <p className={`text-xs mt-1 ${isCompleted ? "text-outline" : "text-on-surface-variant"}`}>
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
