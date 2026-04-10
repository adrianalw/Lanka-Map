"use client";

import { CATEGORIES, Category } from "@/lib/types";

const CATEGORY_EMOJI: Record<Category, string> = {
  Beach: "🏖️",
  Temple: "🛕",
  Wildlife: "🐘",
  Hiking: "🥾",
  Waterfall: "💧",
  Historical: "🏛️",
  Viewpoint: "🔭",
  Museum: "🏛",
  Garden: "🌿",
  Other: "📍",
};

interface Props {
  active: Category | null;
  onChange: (c: Category | null) => void;
}

export default function CategoryFilter({ active, onChange }: Props) {
  return (
    <div className="flex gap-2 px-4 py-2 overflow-x-auto bg-white border-b border-gray-200 shadow-sm">
      <button
        onClick={() => onChange(null)}
        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          active === null
            ? "bg-green-700 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        All
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(active === cat ? null : cat)}
          className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            active === cat
              ? "bg-green-700 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <span>{CATEGORY_EMOJI[cat]}</span>
          <span>{cat}</span>
        </button>
      ))}
    </div>
  );
}
