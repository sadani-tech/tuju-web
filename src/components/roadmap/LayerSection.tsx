"use client";
import type { RoadmapLayer } from "@/types";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TaskCard } from "./TaskCard";

interface LayerSectionProps {
  layer: RoadmapLayer;
  onCompleteTask: (id: string) => void;
  completingId?: string | null;
}

const COLOR_MAP: Record<string, { dot: string; text: string; bar: string }> = {
  blue:   { dot: "bg-blue-600",  text: "text-blue-700",  bar: "bg-blue-500"  },
  yellow: { dot: "bg-amber-500", text: "text-amber-700", bar: "bg-amber-400" },
  red:    { dot: "bg-red-500",   text: "text-red-700",   bar: "bg-red-400"   },
};
const FALLBACK_BY_LAYER: Record<number, string> = { 1: "blue", 2: "yellow", 3: "red" };

export function LayerSection({ layer, onCompleteTask, completingId }: LayerSectionProps) {
  const colorKey = layer.color in COLOR_MAP ? layer.color : (FALLBACK_BY_LAYER[layer.layer] ?? "blue");
  const c        = COLOR_MAP[colorKey];
  const progressPct = layer.progress.total > 0
    ? (layer.progress.completed / layer.progress.total) * 100
    : 0;

  return (
    <div className="space-y-3">
      {/* Layer header */}
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${c.dot}`} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className={`font-semibold text-sm ${c.text}`}>
              Layer {layer.layer} — {layer.label}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">
                {layer.progress.completed}/{layer.progress.total} selesai
              </span>
              {layer.locked && <span className="text-slate-400 text-sm">🔒</span>}
            </div>
          </div>
          <ProgressBar value={progressPct} color={c.bar} height="h-1.5" />
        </div>
      </div>

      {layer.locked ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 text-center ml-6">
          <p className="text-sm text-slate-500">
            🔒 Selesaikan 50% Layer {layer.layer - 1} untuk membuka layer ini
          </p>
        </div>
      ) : (
        <div className="space-y-2 pl-6">
          {layer.tasks.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-2">Tidak ada task di layer ini</p>
          ) : (
            layer.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={onCompleteTask}
                completing={completingId === task.id}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
