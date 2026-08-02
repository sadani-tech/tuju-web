"use client";

interface RIASECSliderProps {
  label: string;
  code: string;
  description: string;
  value: number;
  onChange: (val: number) => void;
}

export function RIASECSlider({
  label,
  code,
  description,
  value,
  onChange,
}: RIASECSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-semibold text-on-surface text-sm">
            {code} — {label}
          </span>
          <p className="text-xs text-on-surface-variant">{description}</p>
        </div>
        <span className="text-lg font-bold text-secondary w-12 text-right">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-secondary h-2 rounded-full"
      />
      <div className="flex justify-between font-label text-label-sm text-outline">
        <span>Rendah</span>
        <span>Tinggi</span>
      </div>
    </div>
  );
}
