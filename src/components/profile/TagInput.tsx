"use client";
import { useState, KeyboardEvent } from "react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({
  value,
  onChange,
  placeholder = "Ketik lalu Enter...",
}: TagInputProps) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const tag = input.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInput("");
  };

  const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag));

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="border border-outline-variant rounded-md px-3 py-2 flex flex-wrap gap-2 focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20 bg-surface-container-lowest min-h-[44px] transition-all">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 bg-primary-fixed text-on-primary-fixed-variant text-xs font-medium px-2.5 py-1 rounded-full"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="text-on-primary-fixed-variant/70 hover:text-on-primary-fixed ml-0.5"
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={addTag}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] outline-none text-sm text-on-surface bg-transparent placeholder:text-outline/60"
      />
    </div>
  );
}
