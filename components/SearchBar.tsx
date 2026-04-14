"use client";

interface Props {
  value: string;
  onChange: (v: string) => void;
  view: "map" | "list";
  onViewToggle: () => void;
  resultCount: number;
}

export default function SearchBar({ value, onChange, view, onViewToggle, resultCount }: Props) {
  return (
    <div className="bg-white border-b border-gray-100 px-3 py-2 flex items-center gap-2">
      {/* Search input */}
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
          🔍
        </span>
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search locations…"
          className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-colors"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Result count on mobile */}
      {value && (
        <span className="text-xs text-gray-500 flex-shrink-0 hidden sm:block">
          {resultCount} result{resultCount !== 1 ? "s" : ""}
        </span>
      )}

      {/* View toggle */}
      <button
        onClick={onViewToggle}
        title={view === "map" ? "Switch to list view" : "Switch to map view"}
        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
      >
        {view === "map" ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span className="hidden sm:inline">List</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span className="hidden sm:inline">Map</span>
          </>
        )}
      </button>
    </div>
  );
}
