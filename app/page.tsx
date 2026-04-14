"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CategoryFilter from "@/components/CategoryFilter";
import LocationPanel from "@/components/LocationPanel";
import SiteHeader from "@/components/SiteHeader";
import SearchBar from "@/components/SearchBar";
import ListView from "@/components/ListView";
import { useFavorites } from "@/lib/useFavorites";
import { Category, Location } from "@/lib/types";
import { Suspense } from "react";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

function HomePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [locations, setLocations] = useState<Location[]>([]);
  const [activeCategories, setActiveCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSaved, setShowSaved] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"map" | "list">("map");
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);

  const { favorites, ready: favsReady } = useFavorites();

  // Load locations
  useEffect(() => {
    fetch("/api/locations")
      .then((r) => r.json())
      .then((data: Location[]) => {
        setLocations(data);
        setLoading(false);
      });
  }, []);

  // Deep-link: open location panel from ?location=<id>
  useEffect(() => {
    if (loading || locations.length === 0) return;
    const id = searchParams.get("location");
    if (!id) return;
    const found = locations.find((l) => l.id === id);
    if (found) setSelectedLocation(found);
  }, [loading, locations, searchParams]);

  // Deep-link: restore category from ?category=<name>
  useEffect(() => {
    const cat = searchParams.get("category") as Category | null;
    if (cat && locations.length > 0) {
      setActiveCategories([cat]);
    }
  }, [searchParams, locations.length]);

  // Update URL when a location is selected / deselected
  const handleSelectLocation = useCallback(
    (loc: Location | null) => {
      setSelectedLocation(loc);
      if (loc) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("location", loc.id);
        router.replace(`/?${params.toString()}`, { scroll: false });
      } else {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("location");
        const qs = params.toString();
        router.replace(qs ? `/?${qs}` : "/", { scroll: false });
      }
    },
    [router, searchParams]
  );

  // Derived: apply all filters
  const filtered = locations.filter((loc) => {
    if (showSaved && !favorites.has(loc.id)) return false;
    if (activeCategories.length > 0 && !activeCategories.includes(loc.category)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!loc.name.toLowerCase().includes(q) && !loc.description.toLowerCase().includes(q))
        return false;
    }
    return true;
  });

  const locationCountLabel = loading ? "Loading…" : `${filtered.length} locations`;

  return (
    <div className="flex flex-col h-screen">
      <SiteHeader locationCount={locationCountLabel} />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        view={view}
        onViewToggle={() => setView((v) => (v === "map" ? "list" : "map"))}
        resultCount={filtered.length}
      />

      <CategoryFilter
        active={activeCategories}
        showSaved={showSaved}
        favoritesCount={favsReady ? favorites.size : 0}
        onChange={setActiveCategories}
        onShowSavedChange={setShowSaved}
      />

      {/* Main content */}
      <div className="flex-1 relative overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-50">
            <div className="w-10 h-10 border-4 border-green-200 border-t-green-700 rounded-full animate-spin mb-3" />
            <p className="text-green-700 text-sm font-medium">Loading map…</p>
          </div>
        ) : view === "map" ? (
          <>
            <Map
              locations={filtered}
              onLocationSelect={handleSelectLocation}
              userPosition={userPosition}
              onLocate={setUserPosition}
            />
            <LocationPanel
              location={selectedLocation}
              onClose={() => handleSelectLocation(null)}
              userPosition={userPosition}
            />
          </>
        ) : (
          <>
            <ListView
              locations={filtered}
              onLocationSelect={(loc) => {
                handleSelectLocation(loc);
                setView("map");
              }}
              userPosition={userPosition}
            />
            <LocationPanel
              location={selectedLocation}
              onClose={() => handleSelectLocation(null)}
              userPosition={userPosition}
            />
          </>
        )}
      </div>

      <footer className="bg-gray-900 text-gray-500 text-xs text-center py-2">
        Map data © OpenStreetMap contributors · Built with ♥ for Sri Lanka
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomePageInner />
    </Suspense>
  );
}
