"use client";

import { useEffect, useState } from "react";
import { Location } from "@/lib/types";
import { useFavorites } from "@/lib/useFavorites";
import { formatDistance, haversineDistance } from "@/lib/distance";

interface Props {
  location: Location | null;
  onClose: () => void;
  userPosition?: { lat: number; lng: number } | null;
}

export default function LocationPanel({ location, onClose, userPosition }: Props) {
  const isOpen = location !== null;
  const { favorites, toggle: toggleFavorite } = useFavorites();
  const [photoIndex, setPhotoIndex] = useState(0);

  // Reset photo index when location changes
  useEffect(() => {
    setPhotoIndex(0);
  }, [location?.id]);

  const photos = location
    ? [location.photo_url, ...(location.photos ?? [])].filter(Boolean) as string[]
    : [];

  const isFav = location ? favorites.has(location.id) : false;

  const distance =
    location && userPosition
      ? formatDistance(
          haversineDistance(userPosition.lat, userPosition.lng, location.lat, location.lng)
        )
      : null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="absolute inset-0 z-[400] bg-black/20 backdrop-blur-[1px]"
          onClick={onClose}
        />
      )}

      {/*
        Panel:
        - Mobile (default): bottom sheet, slides up from bottom
        - Desktop (md+): side panel, slides in from right
      */}
      <div
        className={`
          absolute z-[500] bg-white shadow-2xl flex flex-col
          transition-transform duration-300 ease-in-out
          bottom-0 left-0 right-0 h-[78vh] rounded-t-2xl
          md:top-0 md:right-0 md:left-auto md:bottom-auto md:h-full md:w-96 md:rounded-none
          ${isOpen
            ? "translate-y-0 md:translate-y-0 md:translate-x-0"
            : "translate-y-full md:translate-y-0 md:translate-x-full"
          }
        `}
      >
        {location && (
          <>
            {/* Mobile drag handle */}
            <div className="md:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Hero / Photo gallery */}
            <div className="relative flex-shrink-0">
              {photos.length > 0 ? (
                <>
                  <img
                    src={photos[photoIndex]}
                    alt={location.name}
                    className="w-full h-48 md:h-52 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Gallery nav */}
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPhotoIndex((i) => (i - 1 + photos.length) % photos.length);
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/60 transition-colors text-lg"
                        aria-label="Previous photo"
                      >
                        ‹
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPhotoIndex((i) => (i + 1) % photos.length);
                        }}
                        className="absolute right-10 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/60 transition-colors text-lg"
                        aria-label="Next photo"
                      >
                        ›
                      </button>
                      {/* Dots */}
                      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1">
                        {photos.map((_, i) => (
                          <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); setPhotoIndex(i); }}
                            className={`w-1.5 h-1.5 rounded-full transition-opacity ${
                              i === photoIndex ? "bg-white" : "bg-white/50"
                            }`}
                            aria-label={`Photo ${i + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="inline-block bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full mb-1.5">
                      {location.category}
                    </span>
                    <h2 className="font-bold text-white text-xl leading-snug drop-shadow-sm">
                      {location.name}
                    </h2>
                  </div>
                </>
              ) : (
                <div className="h-28 bg-gradient-to-br from-green-800 to-green-600 flex items-end p-4">
                  <div>
                    <span className="inline-block bg-white/20 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full mb-1.5">
                      {location.category}
                    </span>
                    <h2 className="font-bold text-white text-xl leading-snug">
                      {location.name}
                    </h2>
                  </div>
                </div>
              )}

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-10 bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                aria-label="Close panel"
              >
                ✕
              </button>

              {/* Favourite button */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(location.id); }}
                className={`absolute top-3 right-14 z-10 rounded-full w-8 h-8 flex items-center justify-center transition-all ${
                  isFav
                    ? "bg-rose-500 text-white"
                    : "bg-black/30 backdrop-blur-sm text-white hover:bg-rose-500"
                }`}
                aria-label={isFav ? "Remove from saved" : "Save location"}
              >
                {isFav ? "♥" : "♡"}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* Distance badge */}
              {distance && (
                <div className="flex items-center gap-1.5 text-blue-600 text-xs font-medium mb-3">
                  <span>📍</span>
                  <span>{distance}</span>
                </div>
              )}

              <p className="text-gray-600 text-sm leading-relaxed mb-5">
                {location.description}
              </p>

              {(location.entry_fee || location.hours) && (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-3 mb-5">
                  {location.entry_fee && (
                    <div className="flex items-start gap-3">
                      <span className="text-base mt-0.5">🎫</span>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Entry Fee
                        </p>
                        <p className="text-sm text-gray-700 mt-0.5">{location.entry_fee}</p>
                      </div>
                    </div>
                  )}
                  {location.hours && (
                    <div className="flex items-start gap-3">
                      <span className="text-base mt-0.5">🕐</span>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Hours
                        </p>
                        <p className="text-sm text-gray-700 mt-0.5">{location.hours}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-green-700 text-white text-sm font-semibold py-3 rounded-xl hover:bg-green-800 active:bg-green-900 transition-colors mb-3"
              >
                <span>Get Directions</span>
                <span>→</span>
              </a>

              <button
                onClick={() => {
                  const url = `${window.location.origin}?location=${location.id}`;
                  navigator.clipboard
                    .writeText(url)
                    .then(() => alert("Link copied to clipboard!"))
                    .catch(() => {});
                }}
                className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <span>🔗</span>
                <span>Copy link</span>
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
