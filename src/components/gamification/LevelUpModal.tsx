"use client";
import { useEffect } from "react";
import { getStarsForLevel } from "@/store/pointsStore";

interface LevelUpModalProps {
  level: string;
  onClose: () => void;
}

const CONFETTI = ["⭐", "✨", "🎉", "🌟", "🎊", "🎈"];

export function LevelUpModal({ level, onClose }: LevelUpModalProps) {
  const stars = getStarsForLevel(level);

  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] animate-fade-in">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute text-xl animate-confetti"
            style={{
              left: `${3 + (i * 5.5) % 95}%`,
              bottom: "15%",
              animationDelay: `${(i * 0.12) % 1.8}s`,
              animationDuration: `${1.4 + (i * 0.18) % 1.4}s`,
            }}
          >
            {CONFETTI[i % CONFETTI.length]}
          </span>
        ))}
      </div>
      <div className="glass-card rounded-xl p-8 max-w-sm w-full mx-4 text-center shadow-navy-lg relative z-10">
        <p className="text-5xl mb-3">🎉</p>
        <h2 className="text-headline-md text-primary mb-1">Level Naik!</h2>
        <div className="flex justify-center gap-1 my-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`text-2xl ${i < stars ? "text-amber-400" : "text-surface-container-highest"}`}>
              ★
            </span>
          ))}
        </div>
        <p className="text-on-surface-variant text-sm mb-1">Level baru kamu:</p>
        <p className="text-xl font-bold text-gradient mb-6">{level}</p>
        <button
          onClick={onClose}
          className="w-full bg-secondary hover:bg-secondary-container text-on-secondary text-button rounded-md py-3 transition shadow-navy-sm"
        >
          Lanjutkan
        </button>
        <p className="font-label text-label-sm text-outline mt-3">Tutup otomatis dalam 5 detik</p>
      </div>
    </div>
  );
}
