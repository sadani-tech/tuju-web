"use client";
import { Lock, Flag } from "lucide-react";
import type { RoadmapLayer } from "@/types";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TaskCard } from "./TaskCard";

interface LayerSectionProps {
  layer: RoadmapLayer;
  onCompleteTask: (id: string) => void;
  completingId?: string | null;
}

export function LayerSection({ layer, onCompleteTask, completingId }: LayerSectionProps) {
  const progressPct = layer.progress.total > 0
    ? (layer.progress.completed / layer.progress.total) * 100
    : 0;
  const isDone = layer.progress.total > 0 && layer.progress.completed === layer.progress.total;

  return (
    <div className={`relative pl-12 ${layer.locked ? "opacity-60" : ""}`}>
      {/* Phase node on the pathway line */}
      <div
        className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-background ${
          layer.locked
            ? "bg-surface-variant text-outline"
            : isDone
            ? "bg-tertiary-fixed-dim text-on-tertiary-fixed"
            : "bg-secondary text-on-secondary shadow-navy"
        }`}
      >
        {layer.locked ? <Lock className="w-4 h-4" /> : <Flag className="w-4 h-4" />}
      </div>

      <div className="space-y-4">
        {/* Phase header */}
        <div>
          <div className="flex items-center justify-between mb-1 gap-2">
            <h2 className={`text-headline-md ${layer.locked ? "text-outline" : "text-primary"}`}>
              Fase {layer.layer}: {layer.label}
            </h2>
            <span className="font-label text-label-sm text-on-surface-variant whitespace-nowrap">
              {layer.progress.completed}/{layer.progress.total} selesai
            </span>
          </div>
          <ProgressBar
            value={progressPct}
            color={layer.locked ? "bg-outline-variant" : "bg-tertiary-fixed-dim"}
            height="h-1.5"
          />
        </div>

        {layer.locked ? (
          <div className="bg-surface-container-low border border-dashed border-outline-variant rounded-md p-4 text-center">
            <p className="text-sm text-on-surface-variant inline-flex items-center gap-2">
              <Lock className="w-4 h-4" /> Selesaikan 50% Fase {layer.layer - 1} untuk membuka fase ini
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {layer.tasks.length === 0 ? (
              <p className="text-sm text-outline text-center py-2 md:col-span-2">
                Tidak ada task di fase ini
              </p>
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
    </div>
  );
}
