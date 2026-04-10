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
          className="absolute inset-0 z-[400]"
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
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow text-gray-500 hover:text-gray-800 transition-colors"
              aria-label="Close panel"
            >
              ✕
            </button>

            {/* Photo */}
            {location.photo_url && (
              <div className="flex-shrink-0">
                <img
                  src={location.photo_url}
                  alt={location.name}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full mb-2">
                {location.category}
              </span>
              <h2 className="font-bold text-gray-900 text-xl leading-snug mb-3">
                {location.name}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {location.description}
              </p>

              <div className="flex flex-col gap-2 text-sm text-gray-600 mb-6">
                {location.entry_fee && (
                  <div className="flex gap-2">
                    <span className="font-medium text-gray-800 w-16 flex-shrink-0">Entry</span>
                    <span>{location.entry_fee}</span>
                  </div>
                )}
                {location.hours && (
                  <div className="flex gap-2">
                    <span className="font-medium text-gray-800 w-16 flex-shrink-0">Hours</span>
                    <span>{location.hours}</span>
                  </div>
                )}
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-green-700 text-white text-sm font-semibold py-3 rounded-lg hover:bg-green-800 transition-colors"
              >
                Get Directions
              </a>
            </div>
          </>
        )}
      </div>
    </>
  );
}
