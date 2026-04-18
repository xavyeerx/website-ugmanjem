"use client";

import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Navigation } from "lucide-react";

// Fix for default Leaflet icon paths in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationInfo {
  name: string;
  lat: number;
  lon: number;
}

interface MapRoutingProps {
  onDistanceFound: (distanceKm: string) => void;
}

// UGM Coordinates
const DEFAULT_CENTER: [number, number] = [-7.7663249, 110.3704283];

// Helper to fit bounds when markers change
function BoundsTracker({ pickup, dropoff }: { pickup: LocationInfo | null; dropoff: LocationInfo | null }) {
  const map = useMap();
  useEffect(() => {
    if (pickup && dropoff) {
      const bounds = L.latLngBounds(
        [pickup.lat, pickup.lon],
        [dropoff.lat, dropoff.lon]
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else if (pickup) {
      map.flyTo([pickup.lat, pickup.lon], 16);
    } else if (dropoff) {
      map.flyTo([dropoff.lat, dropoff.lon], 16);
    } else {
      map.flyTo(DEFAULT_CENTER, 14);
    }
  }, [pickup, dropoff, map]);
  return null;
}

export default function MapRouting({ onDistanceFound }: MapRoutingProps) {
  const [pickup, setPickup] = useState<LocationInfo | null>(null);
  const [dropoff, setDropoff] = useState<LocationInfo | null>(null);
  const [routeLine, setRouteLine] = useState<[number, number][]>([]);

  // Stable ref so the callback never needs to be in dependency arrays
  const onDistanceFoundRef = useRef(onDistanceFound);
  useLayoutEffect(() => {
    onDistanceFoundRef.current = onDistanceFound;
  });

  // Search States
  const [activeInput, setActiveInput] = useState<"pickup" | "dropoff" | null>(null);
  const [pickupQuery, setPickupQuery] = useState("");
  const [dropoffQuery, setDropoffQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchNominatim = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      // Menggunakan Photon API dengan filter bbox untuk area Pulau Jawa
      // Bounding Box Jawa: minLon 105.0, minLat -8.8, maxLon 114.6, maxLat -5.8
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=${DEFAULT_CENTER[0]}&lon=${DEFAULT_CENTER[1]}&limit=5&bbox=105.0,-8.8,114.6,-5.8`
      );
      const data = await res.json();
      if (data.features) {
        setSearchResults(
          data.features.map((f: any) => {
            const props = f.properties;
            const nameArr = [props.name, props.street, props.district, props.city].filter(Boolean);
            const displayName = Array.from(new Set(nameArr)).join(", ");
            return {
              name: displayName || "Lokasi tidak bernama",
              lat: f.geometry.coordinates[1],
              lon: f.geometry.coordinates[0],
            };
          })
        );
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Photon search error", err);
      // Fallback ke nominatim dengan batasan viewbox Pulau Jawa
      try {
        const fallRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&viewbox=105.0,-5.8,114.6,-8.8&bounded=1`,
          { headers: { "User-Agent": "UGM_Anjem_App" } }
        );
        const fallData = await fallRes.json();
        setSearchResults(
          fallData.map((item: any) => ({
            name: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
          }))
        );
      } catch (fallbackErr) {
        setSearchResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (type: "pickup" | "dropoff", val: string) => {
    if (type === "pickup") {
      setPickupQuery(val);
      if (pickup && val !== pickup.name) setPickup(null);
    } else {
      setDropoffQuery(val);
      if (dropoff && val !== dropoff.name) setDropoff(null);
    }
    
    setActiveInput(type);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    // Debounce 600ms
    searchTimeout.current = setTimeout(() => {
      fetchNominatim(val);
    }, 600);
  };

  const selectLocation = (loc: LocationInfo) => {
    if (activeInput === "pickup") {
      setPickup(loc);
      setPickupQuery(loc.name.split(",")[0]);
    } else {
      setDropoff(loc);
      setDropoffQuery(loc.name.split(",")[0]);
    }
    setSearchResults([]);
    setActiveInput(null);
  };

  const calculateRoute = useCallback(async () => {
    if (!pickup || !dropoff) {
      setRouteLine([]);
      return;
    }
    try {
      // OSRM expects: lon,lat
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${pickup.lon},${pickup.lat};${dropoff.lon},${dropoff.lat}?overview=full&geometries=geojson`
      );
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distKm = (route.distance / 1000).toFixed(1);
        onDistanceFoundRef.current(distKm);

        // GeoJSON uses [lon, lat], Leaflet uses [lat, lon]
        const coords = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
        setRouteLine(coords);
      }
    } catch (err) {
      console.error("OSRM routing error", err);
    }
  }, [pickup, dropoff]);

  useEffect(() => {
    if (pickup && dropoff) {
      calculateRoute();
    } else {
      setRouteLine([]);
      if (!pickup && !dropoff) {
        onDistanceFoundRef.current("");
      }
    }
  }, [pickup, dropoff, calculateRoute]);

  return (
    <div className="flex flex-col gap-4">
      {/* Search Forms */}
      <div className="relative flex flex-col gap-3 bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-accent">
            <MapPin size={18} />
          </div>
          <input
            type="text"
            placeholder="Cari titik jemput..."
            value={pickupQuery}
            onChange={(e) => handleSearchChange("pickup", e.target.value)}
            onFocus={() => setActiveInput("pickup")}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-accent focus:outline-none text-sm"
          />
        </div>
        
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#32cd32]">
            <Navigation size={18} />
          </div>
          <input
            type="text"
            placeholder="Cari titik antar..."
            value={dropoffQuery}
            onChange={(e) => handleSearchChange("dropoff", e.target.value)}
            onFocus={() => setActiveInput("dropoff")}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-accent focus:outline-none text-sm"
          />
        </div>

        {/* Search Results Dropdown */}
        {activeInput && searchResults.length > 0 && (
          <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-popover border shadow-lg rounded-lg max-h-60 overflow-y-auto w-full">
            {searchResults.map((loc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectLocation(loc)}
                className="w-full text-left px-4 py-3 hover:bg-muted border-b last:border-0 transition-colors flex items-start gap-3"
              >
                <Search size={16} className="text-muted-foreground mt-1 shrink-0" />
                <span className="text-sm text-foreground truncate block">{loc.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map View */}
      <div className="relative w-full h-[300px] border rounded-xl overflow-hidden shadow-inner z-0">
        <MapContainer center={DEFAULT_CENTER} zoom={14} scrollWheelZoom={true} className="w-full h-full z-0">
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors, OSRM'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {pickup && <Marker position={[pickup.lat, pickup.lon]} />}
          {dropoff && <Marker position={[dropoff.lat, dropoff.lon]} />}
          {routeLine.length > 0 && <Polyline positions={routeLine} color="#007aff" weight={5} opacity={0.8} />}
          <BoundsTracker pickup={pickup} dropoff={dropoff} />
        </MapContainer>
      </div>
    </div>
  );
}
