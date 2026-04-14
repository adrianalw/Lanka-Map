"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { Location } from "@/lib/types";

// Fix Leaflet default icon paths broken by webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Props {
  locations: Location[];
  onLocationSelect: (location: Location) => void;
  userPosition?: { lat: number; lng: number } | null;
  onLocate?: (pos: { lat: number; lng: number }) => void;
}

export default function Map({ locations, onLocationSelect, userPosition, onLocate }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const locatingRef = useRef(false);

  // Initialise map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      center: [7.8731, 80.7718],
      zoom: 8,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when locations change
  useEffect(() => {
    if (!mapRef.current) return;

    import("leaflet.markercluster").then(() => {
      if (!mapRef.current) return;

      if (clusterRef.current) {
        mapRef.current.removeLayer(clusterRef.current);
      }

      const cluster = (
        L as unknown as {
          markerClusterGroup: (options?: L.MarkerClusterGroupOptions) => L.MarkerClusterGroup;
        }
      ).markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 60,
        showCoverageOnHover: false,
      });

      locations.forEach((loc) => {
        const marker = L.marker([loc.lat, loc.lng]);
        marker.on("click", () => onLocationSelect(loc));
        cluster.addLayer(marker);
      });

      mapRef.current.addLayer(cluster);
      clusterRef.current = cluster;
    });
  }, [locations]);

  // Update user position marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (userMarkerRef.current) {
      mapRef.current.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    if (userPosition) {
      userMarkerRef.current = L.circleMarker([userPosition.lat, userPosition.lng], {
        radius: 10,
        color: "#2563eb",
        fillColor: "#3b82f6",
        fillOpacity: 0.9,
        weight: 3,
      })
        .bindPopup("You are here")
        .addTo(mapRef.current);
    }
  }, [userPosition]);

  function handleLocate() {
    if (locatingRef.current) return;
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    locatingRef.current = true;
    const btn = document.getElementById("locate-btn");
    if (btn) btn.textContent = "…";

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        locatingRef.current = false;
        if (btn) btn.textContent = "◎";
        const { latitude, longitude } = pos.coords;
        const position = { lat: latitude, lng: longitude };
        onLocate?.(position);
        mapRef.current?.setView([latitude, longitude], 13);
      },
      () => {
        locatingRef.current = false;
        if (btn) btn.textContent = "◎";
        alert("Unable to determine your location. Please allow location access.");
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* Find Me button */}
      <button
        id="locate-btn"
        onClick={handleLocate}
        title="Find my location"
        className="absolute bottom-8 right-3 z-[1000] w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors font-bold text-lg"
        style={{ lineHeight: 1 }}
      >
        ◎
      </button>
    </div>
  );
}
