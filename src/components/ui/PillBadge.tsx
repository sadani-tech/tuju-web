import React from "react";

type PillVariant = "green" | "amber" | "blue" | "slate" | "indigo" | "red";

interface PillBadgeProps {
  children: React.ReactNode;
  variant?: PillVariant;
}

const variantClasses: Record<PillVariant, string> = {
  green: "bg-green-100 text-green-700",
  amber: "bg-amber-100 text-amber-700",
  blue: "bg-blue-100 text-blue-700",
  slate: "bg-slate-100 text-slate-600",
  indigo: "bg-indigo-100 text-indigo-700",
  red: "bg-red-100 text-red-600",
};

export function PillBadge({ children, variant = "slate" }: PillBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}
