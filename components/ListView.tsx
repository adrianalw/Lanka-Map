"use client";

import { Location } from "@/lib/types";
import { useFavorites } from "@/lib/useFavorites";

const CATEGORY_EMOJI: Record<string, string> = {
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
  locations: Location[];
  onLocationSelect: (loc: Location) => void;
  userPosition?: { lat: number; lng: number } | null;
}

function getDistance(
  userPos: { lat: number; lng: number },
  loc: Location
): number {
  const R = 6371;
  const dLat = ((loc.lat - userPos.lat) * Math.PI) / 180;
  const dLng = ((loc.lng - userPos.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((userPos.lat * Math.PI) / 180) *
      Math.cos((loc.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function ListView({ locations, onLocationSelect, userPosition }: Props) {
  const { favorites } = useFavorites();

  const sorted = userPosition
    ? [...locations].sort(
        (a, b) =>
          getDistance(userPosition, a) - getDistance(userPosition, b)
      )
    : locations;

  if (sorted.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
        <span className="text-4xl mb-3">🔍</span>
        <p className="font-medium">No locations found</p>
        <p className="text-sm mt-1">Try adjusting your filters or search</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
        {sorted.map((loc) => {
          const dist = userPosition ? getDistance(userPosition, loc) : null;
          const isFav = favorites.has(loc.id);

          return (
            <button
              key={loc.id}
              onClick={() => onLocationSelect(loc)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:border-green-200 transition-all duration-200 text-left group"
            >
              {/* Image */}
              <div className="relative">
                {loc.photo_url ? (
                  <img
                    src={loc.photo_url}
                    alt={loc.name}
                    className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-36 bg-gradient-to-br from-green-800 to-green-600 flex items-center justify-center text-4xl">
                    {CATEGORY_EMOJI[loc.category] ?? "📍"}
                  </div>
                )}
                <span className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
                  {CATEGORY_EMOJI[loc.category]} {loc.category}
                </span>
                {isFav && (
                  <span className="absolute top-2 right-2 text-rose-500 text-lg drop-shadow">
                    ♥
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-3">
                <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-1">
                  {loc.name}
                </h3>
                <p className="text-gray-500 text-xs mt-0.5 line-clamp-2 leading-relaxed">
                  {loc.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-green-700 font-medium">
                    {loc.entry_fee || "Free"}
                  </span>
                  {dist !== null && (
                    <span className="text-xs text-gray-400">
                      {dist < 1
                        ? `${Math.round(dist * 1000)} m`
                        : `${dist.toFixed(1)} km`}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
