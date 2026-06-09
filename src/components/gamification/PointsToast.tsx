"use client";
import { useEffect, useState } from "react";
import { LevelUpModal } from "./LevelUpModal";

interface ToastItem {
  id: number;
  points: number;
}

interface LevelUpData {
  level: string;
}

let globalShowFn: ((pts: number, levelUp?: LevelUpData) => void) | null = null;

export function showPointsGain(pts: number, levelUp?: LevelUpData) {
  globalShowFn?.(pts, levelUp);
}

export function GamificationLayer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [levelUp, setLevelUp] = useState<LevelUpData | null>(null);

  useEffect(() => {
    globalShowFn = (pts, lu) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, points: pts }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        if (lu) setLevelUp(lu);
      }, 3000);
    };
    return () => {
      globalShowFn = null;
    };
  }, []);

  return (
    <>
      <div className="fixed bottom-20 right-4 md:bottom-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-amber-400 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold animate-slide-up"
          >
            +{t.points} poin 🎉
          </div>
        ))}
      </div>
      {levelUp && (
        <LevelUpModal level={levelUp.level} onClose={() => setLevelUp(null)} />
      )}
    </>
  );
}
