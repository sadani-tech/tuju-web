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
          <span className="font-semibold text-slate-900 text-sm">
            {code} — {label}
          </span>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        <span className="text-lg font-bold text-blue-600 w-12 text-right">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-600 h-2 rounded-full"
      />
      <div className="flex justify-between text-xs text-slate-400">
        <span>Rendah</span>
        <span>Tinggi</span>
      </div>
    </div>
  );
}
