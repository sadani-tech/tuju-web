"use client";
import { create } from "zustand";
import type { PointsBalance } from "@/types";

interface Level { name: string; min: number; stars: number; }

export const LEVELS: Level[] = [
  { name: "Pemula",            min: 0,    stars: 1 },
  { name: "Penjelajah",        min: 200,  stars: 2 },
  { name: "Pencari Jati Diri", min: 500,  stars: 3 },
  { name: "Pejuang Impian",    min: 1000, stars: 4 },
  { name: "Arsitek Hidupku",   min: 2000, stars: 5 },
];

export function getStarsForLevel(levelName: string): number {
  return LEVELS.find((l) => l.name === levelName)?.stars ?? 1;
}

export function getLevelInfo(pts: number) {
  let current: Level = LEVELS[0];
  for (const lvl of LEVELS) {
    if (pts >= lvl.min) current = lvl;
  }
  const currentIdx = LEVELS.findIndex((l) => l.name === current.name);
  const next = currentIdx < LEVELS.length - 1 ? LEVELS[currentIdx + 1] : null;
  const progress = next
    ? Math.min(100, Math.max(0, ((pts - current.min) / (next.min - current.min)) * 100))
    : 100;
  return {
    name:     current.name,
    stars:    current.stars,
    progress,
    nextName: next?.name ?? null,
    nextMin:  next?.min  ?? null,
  };
}

interface PointsState {
  totalPoints:    number;
  currentLevel:   string;
  currentStreak:  number;
  nextLevel:      string | null;
  pointsToNext:   number;
  progressToNext: number;
  setPoints:  (data: PointsBalance) => void;
  addPoints:  (amount: number) => void;
}

export const usePointsStore = create<PointsState>((set) => ({
  totalPoints:    0,
  currentLevel:   "Pemula",
  currentStreak:  0,
  nextLevel:      null,
  pointsToNext:   0,
  progressToNext: 0,
  setPoints: (data) =>
    set({
      totalPoints:    data.total_points,
      currentLevel:   data.current_level,
      currentStreak:  data.current_streak,
      nextLevel:      data.next_level,
      pointsToNext:   data.points_to_next_level,
      progressToNext: data.progress_to_next_pct,
    }),
  addPoints: (amount) =>
    set((s) => ({ totalPoints: s.totalPoints + amount })),
}));
