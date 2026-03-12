"use client";

import { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L, { LatLngExpression } from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import { Flame, MapPin, Clock, Package, Loader2, User, Navigation } from "lucide-react";

// Import Leaflet Routing Machine
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

interface GasLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  stock: number;
  operating_hours: string;
  address: string;
  profiles?: {
    full_name: string;
  };
}

interface GasMapProps {
  locations: GasLocation[];
  activeLocationId: string | null;
  onMarkerClick: (id: string) => void;
  userLocation: { lat: number; lng: number } | null;
}

// Controller to handle automatic flying to user and routing
function MapController({ activeLocation, userLocation }: { activeLocation: GasLocation | null, userLocation: { lat: number, lng: number } | null }) {
  const map = useMap();
  const routingControlRef = useRef<any>(null);
  const userFlyDoneRef = useRef(false);

  // 1. Initial fly to user location when detected
  useEffect(() => {
    if (userLocation && !userFlyDoneRef.current) {
      map.flyTo([userLocation.lat, userLocation.lng], 14, {
        duration: 2
      });
      userFlyDoneRef.current = true;
    }
  }, [userLocation, map]);

  // 2. Fly to active location (pangkalan) and draw route
  useEffect(() => {
    // Fly to location
    if (activeLocation) {
      map.flyTo([activeLocation.latitude, activeLocation.longitude], 15, {
        duration: 1.5
      });
    }

    // Handle routing
    if (userLocation && activeLocation) {
      // Remove old route if exists
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }

      // Create new routing control
      routingControlRef.current = (L.Routing as any).control({
        waypoints: [
          L.latLng(userLocation.lat, userLocation.lng),
          L.latLng(activeLocation.latitude, activeLocation.longitude)
        ],
        lineOptions: {
          styles: [{ color: '#2563eb', weight: 4, opacity: 0.7 }],
          extendToWaypoints: true,
          missingRouteTolerance: 10
        },
        show: false, // Hide instructions list
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: false,
        containerClassName: 'hidden' // Completely hide instructions
      }).addTo(map);

    } else if (!activeLocation && routingControlRef.current) {
        // If no active location selected but route exists, remove it
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
    }
  }, [activeLocation, userLocation, map]);

  return null;
}

export default function GasMap({ locations, activeLocationId, onMarkerClick, userLocation }: GasMapProps) {
  const [mounted, setMounted] = useState(false);
  const [icons, setIcons] = useState<{ default: L.Icon, user: L.DivIcon } | null>(null);

  useEffect(() => {
    const defaultIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    const userIcon = L.divIcon({
      html: `<div class="w-10 h-10 bg-blue-500 rounded-full border-4 border-white shadow-strong flex items-center justify-center relative">
               <div class="w-3 h-3 bg-white rounded-full"></div>
               <div class="absolute inset-0 w-full h-full bg-blue-400 rounded-full animate-ping opacity-30"></div>
             </div>`,
      className: "",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    setIcons({ default: defaultIcon, user: userIcon });
    setMounted(true);
  }, []);

  const activeLocation = locations.find(l => l.id === activeLocationId) || null;

  if (!mounted || !icons) {
    return (
      <div className="h-full w-full bg-neutral-100 animate-pulse rounded-[3rem] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-neutral-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={[-6.2088, 106.8456] as LatLngExpression}
        zoom={12}
        scrollWheelZoom={true}
        className="h-full w-full z-10"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController activeLocation={activeLocation} userLocation={userLocation} />

        {/* User Location Marker */}
        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={icons.user}>
              <Popup>
                <div className="p-2 text-center">
                   <Navigation className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Posisi Anda</p>
                </div>
              </Popup>
            </Marker>
            <Circle 
                center={[userLocation.lat, userLocation.lng]} 
                radius={300}
                pathOptions={{ fillColor: '#3b82f6', fillOpacity: 0.05, color: '#3b82f6', weight: 1, dashArray: '5, 10' }}
            />
          </>
        )}

        {locations.map((loc) => (
          <Marker 
            key={loc.id} 
            position={[loc.latitude, loc.longitude]}
            icon={icons.default}
            eventHandlers={{
              click: () => onMarkerClick(loc.id)
            }}
          >
            <Popup className="custom-popup" minWidth={280}>
              <div className="p-4 space-y-4 font-sans text-neutral-900">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-1">
                      <div className="bg-primary-600 p-1.5 rounded-lg shadow-sm">
                        <Flame className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary-600">Pangkalan Resmi</span>
                  </div>
                  <h3 className="font-bold text-neutral-900 leading-tight m-0 text-lg uppercase tracking-tight">{loc.name}</h3>
                  <p className="text-xs text-neutral-400 font-medium italic m-0 line-clamp-1">{loc.address}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-100">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest leading-none">Status Stok</p>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-neutral-900">
                      <Package className="w-3.5 h-3.5 text-primary-600" />
                      {loc.stock} Unit
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest leading-none">Operasional</p>
                    <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-neutral-900">
                      <Clock className="w-3.5 h-3.5 text-primary-600" />
                      {loc.operating_hours || "08:00 - 17:00"}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100">
                    <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-2 text-center">Agen Penanggung Jawab</p>
                    <div className="bg-neutral-50 px-4 py-3 rounded-xl flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-lg border border-neutral-200">
                                <User className="w-4 h-4 text-neutral-400" />
                            </div>
                            <span className="text-xs font-bold text-neutral-800 uppercase tracking-tight truncate max-w-[120px]">
                                {loc.profiles?.full_name || "Mitra Resmi"}
                            </span>
                        </div>
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                    </div>
                </div>

                <div className={`mt-2 py-2 px-3 rounded-xl text-center text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${
                  loc.stock > 0 ? "bg-primary-600 text-white" : "bg-red-600 text-white"
                }`}>
                  {loc.stock > 0 ? "Tersedia" : "Kosong"}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
