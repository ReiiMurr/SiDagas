"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, MapPin, Navigation } from "lucide-react";

// Fix for default marker icon in Leaflet + Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  initialLat?: number;
  initialLng?: number;
}

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={icon} />
  );
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

export default function MapPicker({ onLocationSelect, initialLat = -6.2000, initialLng = 106.8166 }: MapPickerProps) {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<L.LatLng | null>(
    new L.LatLng(initialLat, initialLng)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [center, setCenter] = useState<[number, number]>([initialLat, initialLng]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (position) {
      onLocationSelect(position.lat, position.lng);
    }
  }, [position]);

  if (!mounted) return <div className="h-[300px] w-full bg-neutral-50 rounded-2xl animate-pulse border border-neutral-100 flex items-center justify-center font-bold text-neutral-400">Menyiapkan Peta Terenkripsi...</div>;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newPos = new L.LatLng(parseFloat(lat), parseFloat(lon));
        setPosition(newPos);
        setCenter([parseFloat(lat), parseFloat(lon)]);
        onLocationSelect(parseFloat(lat), parseFloat(lon), display_name);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const useCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const newPos = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
        setPosition(newPos);
        setCenter([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-primary-600 transition-colors" />
        <div className="flex items-center">
          <input 
            type="text" 
            id="map-search"
            name="map-search"
            placeholder="Cari alamat atau koordinat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
            className="w-full bg-white border border-neutral-200 pl-11 pr-32 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm font-medium shadow-sm"
          />
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            disabled={isSearching}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-50 transition-all z-10"
          >
            {isSearching ? "Mencari..." : "Koordinasikan"}
          </button>
        </div>
      </div>

      <div className="relative h-[300px] w-full rounded-2xl overflow-hidden border border-neutral-200 shadow-inner">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
          <MapUpdater center={center} />
        </MapContainer>
        
        <button 
          onClick={useCurrentLocation}
          className="absolute bottom-4 right-4 z-[1000] p-3 bg-white border border-neutral-200 rounded-xl shadow-strong text-neutral-600 hover:text-primary-600 transition-all"
          title="Gunakan Lokasi Saya"
        >
          <Navigation className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex gap-4 p-4 bg-primary-50/50 rounded-2xl border border-primary-100/50">
        <div className="flex-1">
          <p className="text-[10px] font-black text-primary-900/40 uppercase tracking-widest leading-none mb-1">Latitude</p>
          <p className="text-sm font-bold text-primary-900 font-mono tracking-tighter">
            {position?.lat.toFixed(6) || "---"}
          </p>
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black text-primary-900/40 uppercase tracking-widest leading-none mb-1">Longitude</p>
          <p className="text-sm font-bold text-primary-900 font-mono tracking-tighter">
            {position?.lng.toFixed(6) || "---"}
          </p>
        </div>
        <div className="flex items-center">
          <div className="bg-primary-600 p-2 rounded-lg">
             <MapPin className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
