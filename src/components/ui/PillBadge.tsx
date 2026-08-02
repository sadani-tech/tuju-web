import React from "react";

type PillVariant = "green" | "amber" | "blue" | "slate" | "indigo" | "red";

interface PillBadgeProps {
  children: React.ReactNode;
  variant?: PillVariant;
}

const variantClasses: Record<PillVariant, string> = {
  green: "bg-tertiary-fixed-dim/20 text-on-tertiary-fixed-variant",
  amber: "bg-amber-100 text-amber-700",
  blue: "bg-primary-fixed text-on-primary-fixed-variant",
  slate: "bg-surface-variant text-on-surface-variant",
  indigo: "bg-accent-purple/10 text-accent-purple",
  red: "bg-error-container text-on-error-container",
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
