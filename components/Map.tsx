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
}

export default function Map({ locations, onLocationSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);

  // Initialise map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      center: [7.8731, 80.7718], // Sri Lanka center
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

    // Lazy-load markercluster
    import("leaflet.markercluster").then(() => {
      if (!mapRef.current) return;

      // Remove old cluster group
      if (clusterRef.current) {
        mapRef.current.removeLayer(clusterRef.current);
      }

      const cluster = (L as unknown as { markerClusterGroup: () => L.MarkerClusterGroup }).markerClusterGroup({
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

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
