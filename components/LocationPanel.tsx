"use client";

import { Location } from "@/lib/types";

interface Props {
  location: Location | null;
  onClose: () => void;
}

export default function LocationPanel({ location, onClose }: Props) {
  const isOpen = location !== null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="absolute inset-0 z-[400] bg-black/20 backdrop-blur-[1px]"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`absolute top-0 right-0 h-full w-80 bg-white shadow-2xl z-[500] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {location && (
          <>
            {/* Hero / Photo */}
            <div className="relative flex-shrink-0">
              {location.photo_url ? (
                <>
                  <img
                    src={location.photo_url}
                    alt={location.name}
                    className="w-full h-52 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
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
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <p className="text-gray-600 text-sm leading-relaxed mb-5">
                {location.description}
              </p>

              {(location.entry_fee || location.hours) && (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-3 mb-5">
                  {location.entry_fee && (
                    <div className="flex items-start gap-3">
                      <span className="text-base mt-0.5">🎫</span>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Entry Fee</p>
                        <p className="text-sm text-gray-700 mt-0.5">{location.entry_fee}</p>
                      </div>
                    </div>
                  )}
                  {location.hours && (
                    <div className="flex items-start gap-3">
                      <span className="text-base mt-0.5">🕐</span>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Hours</p>
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
                className="flex items-center justify-center gap-2 w-full bg-green-700 text-white text-sm font-semibold py-3 rounded-xl hover:bg-green-800 active:bg-green-900 transition-colors"
              >
                <span>Get Directions</span>
                <span>→</span>
              </a>
            </div>
          </>
        )}
      </div>
    </>
  );
}
