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
  active: Category[];
  showSaved: boolean;
  favoritesCount: number;
  onChange: (cats: Category[]) => void;
  onShowSavedChange: (v: boolean) => void;
}

export default function CategoryFilter({
  active,
  showSaved,
  favoritesCount,
  onChange,
  onShowSavedChange,
}: Props) {
  function toggleCategory(cat: Category) {
    if (active.includes(cat)) {
      onChange(active.filter((c) => c !== cat));
    } else {
      onChange([...active, cat]);
    }
  }

  function clearAll() {
    onChange([]);
    onShowSavedChange(false);
  }

  const isAllActive = active.length === 0 && !showSaved;

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm">
      <div className="flex gap-2 px-4 py-2.5 overflow-x-auto scrollbar-hide">
        {/* All */}
        <button
          onClick={clearAll}
          className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            isAllActive
              ? "bg-green-700 text-white shadow-sm scale-105"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </button>

        {/* Saved */}
        <button
          onClick={() => {
            onShowSavedChange(!showSaved);
            if (!showSaved) onChange([]);
          }}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            showSaved
              ? "bg-rose-600 text-white shadow-sm scale-105"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <span>♥</span>
          <span>Saved{favoritesCount > 0 ? ` (${favoritesCount})` : ""}</span>
        </button>

        {/* Category buttons */}
        {CATEGORIES.map((cat) => {
          const isActive = active.includes(cat);
          return (
            <button
              key={cat}
              onClick={() => {
                onShowSavedChange(false);
                toggleCategory(cat);
              }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-green-700 text-white shadow-sm scale-105"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span>{CATEGORY_EMOJI[cat]}</span>
              <span>{cat}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
