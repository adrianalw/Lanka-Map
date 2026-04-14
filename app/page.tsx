"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import CategoryFilter from "@/components/CategoryFilter";
import LocationPanel from "@/components/LocationPanel";
import SiteHeader from "@/components/SiteHeader";
import { Category, Location } from "@/lib/types";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function HomePage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filtered, setFiltered] = useState<Location[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/locations")
      .then((r) => r.json())
      .then((data) => {
        setLocations(data);
        setFiltered(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (activeCategory) {
      setFiltered(locations.filter((l) => l.category === activeCategory));
    } else {
      setFiltered(locations);
    }
  }, [activeCategory, locations]);

  return (
    <div className="flex flex-col h-screen">
      <SiteHeader locationCount={loading ? "Loading…" : `${filtered.length} locations`} />

      {/* Category filter */}
      <CategoryFilter
        active={activeCategory}
        onChange={setActiveCategory}
      />

      {/* Map */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-50">
            <div className="w-10 h-10 border-4 border-green-200 border-t-green-700 rounded-full animate-spin mb-3" />
            <p className="text-green-700 text-sm font-medium">Loading map…</p>
          </div>
        ) : (
          <Map locations={filtered} onLocationSelect={setSelectedLocation} />
        )}
        <LocationPanel
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
        />
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-500 text-xs text-center py-2">
        Map data © OpenStreetMap contributors · Built with ♥ for Sri Lanka
      </footer>
    </div>
  );
}
