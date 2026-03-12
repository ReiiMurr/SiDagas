"use client";

import { useEffect, useState } from "react";
import { Search, MapPin, Package, Clock, Loader2, Navigation, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

// Move Map to separate component for SSR: false
const GasMap = dynamic(() => import("@/components/GasMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-neutral-100 animate-pulse rounded-[2.5rem] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <MapPin className="w-12 h-12 text-neutral-300 animate-bounce" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Sinkronisasi Satelit...</p>
      </div>
    </div>
  ),
});

interface GasLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  stock: number;
  operating_hours: string;
  address: string;
  updated_at: string;
  profiles?: {
    full_name: string;
  };
}

export default function GasExploration() {
  const [locations, setLocations] = useState<GasLocation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    fetchLocations();
    
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  // Helper for distance calc (Haversine)
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  async function fetchLocations() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('gas_locations')
        .select(`
          *,
          profiles(full_name)
        `)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      setLocations(data || []);
    } catch (err: any) {
      console.error("Fetch Error:", err.message || err);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLocationSelect = (id: string) => {
    setActiveLocationId(id);
    // Scroll to top of map if needed, but the MapController handles panning
    const mapElement = document.getElementById('interactive-map');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-12 py-10">
      {/* Search Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4 max-w-xl">
          <h2 className="text-4xl lg:text-5xl font-medium text-neutral-900 tracking-tight">Ketersediaan <span className="text-primary-600 italic font-bold">LPG 3kg</span></h2>
          <p className="text-neutral-500 font-medium text-lg leading-relaxed">Temukan pangkalan resmi terdekat dengan transparansi stok harian dan harga yang diawasi pemerintah.</p>
        </div>
        
        <div className="relative flex-1 max-w-xl group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary-600 transition-all" />
          <input 
            type="text" 
            placeholder="Cari pangkalan, kecamatan, atau alamat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-neutral-100 pl-14 pr-8 py-5 rounded-3xl outline-none focus:ring-8 focus:ring-primary-500/5 focus:border-primary-500 transition-all font-medium shadow-soft text-neutral-900"
          />
        </div>
      </div>

      {/* Map Container */}
      <div 
        id="interactive-map"
        className="w-full h-[500px] lg:h-[700px] rounded-[3.5rem] overflow-hidden border border-neutral-100 shadow-2xl bg-neutral-50 relative group ring-1 ring-neutral-200/50"
      >
         <GasMap 
          locations={filteredLocations} 
          activeLocationId={activeLocationId}
          onMarkerClick={(id) => setActiveLocationId(id)}
          userLocation={userLocation}
         />
         {!activeLocationId && (
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="absolute top-8 left-1/2 -translate-x-1/2 z-20 bg-neutral-900/90 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-2xl pointer-events-none transition-opacity group-hover:opacity-0"
            >
               <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white whitespace-nowrap">Navigasi Peta Interaktif</p>
            </motion.div>
         )}
      </div>

      {/* List Container */}
      <div className="space-y-12 pt-10">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-100 pb-10">
            <div className="flex items-center gap-5">
                <div className="bg-primary-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                    <Navigation className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-neutral-900 tracking-tight">Eksplorasi Pangkalan</h3>
                    <p className="text-sm font-medium text-neutral-400">Menampilkan {filteredLocations.length} distribusi terverifikasi</p>
                </div>
            </div>
            <div className="flex items-center gap-2 px-5 py-2.5 bg-neutral-50 rounded-2xl border border-neutral-100 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest">Sinkronisasi Server</span>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
               Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-64 w-full bg-neutral-50 animate-pulse rounded-[2.5rem] border border-neutral-100" />
               ))
            ) : filteredLocations.length === 0 ? (
              <div className="col-span-full text-center py-40 bg-neutral-50 rounded-[3.5rem] border-2 border-dashed border-neutral-200/60">
                 <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <MapPin className="w-10 h-10 text-neutral-200" />
                 </div>
                 <h4 className="text-xl font-bold text-neutral-900 mb-2">Lokasi Tidak Ditemukan</h4>
                 <p className="text-neutral-400 font-medium max-w-xs mx-auto">Coba gunakan kata kunci lain atau perluas pencarian Anda.</p>
              </div>
            ) : (
              filteredLocations.map((loc) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -10 }}
                  key={loc.id} 
                  onClick={() => handleLocationSelect(loc.id)}
                  className={`p-10 rounded-[2.5rem] border transition-all relative cursor-pointer flex flex-col justify-between h-full group overflow-hidden ${
                    activeLocationId === loc.id 
                    ? "border-primary-500 bg-primary-50/20 shadow-2xl ring-4 ring-primary-500/5" 
                    : "border-neutral-100 bg-white hover:border-primary-200 hover:shadow-2xl"
                  }`}
                >
                  <div className="space-y-6 relative z-10">
                     <div className="flex justify-between items-start gap-4">
                        <div className="space-y-2">
                           <h4 className={`font-bold text-xl leading-tight transition-colors ${
                                activeLocationId === loc.id ? "text-primary-700 font-black" : "text-neutral-900 group-hover:text-primary-700"
                           }`}>
                                {loc.name}
                           </h4>
                           <p className="text-sm text-neutral-400 font-medium line-clamp-2 leading-relaxed">
                                {loc.address}
                           </p>
                        </div>
                        <div className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md transition-all ${
                          loc.stock > 0 
                          ? "bg-primary-600 text-white shadow-primary-500/20" 
                          : "bg-red-500 text-white shadow-red-500/20"
                        }`}>
                          {loc.stock > 0 ? "Tersedia" : "Habis"}
                        </div>
                     </div>
                     
                     <div className="bg-neutral-50/80 backdrop-blur-sm px-5 py-4 rounded-[1.5rem] flex items-center justify-between border border-neutral-100 group-hover:bg-white transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden">
                                {loc.profiles?.full_name ? (
                                    <span className="text-[10px] font-black text-neutral-400">{loc.profiles.full_name.charAt(0)}</span>
                                ) : (
                                    <User className="w-4 h-4 text-neutral-400" />
                                )}
                            </div>
                            <span className="text-xs font-bold text-neutral-700 tracking-tight truncate max-w-[120px]">
                                {loc.profiles?.full_name || "Mitra Resmi"}
                            </span>
                        </div>
                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-100">Agen</span>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-6 mt-10 pt-8 border-t border-neutral-50 group-hover:border-primary-100 transition-colors relative z-10">
                     <div className="flex items-center gap-2 text-[11px] font-bold text-neutral-400 transition-colors group-hover:text-neutral-600">
                        <Navigation className="w-4 h-4 text-neutral-300 group-hover:text-primary-400" />
                        {userLocation 
                          ? `${getDistance(userLocation.lat, userLocation.lng, loc.latitude, loc.longitude).toFixed(1)} km` 
                          : "Lokasi"}
                     </div>
                     <div className="flex items-center gap-2 text-[11px] font-bold text-neutral-400 transition-colors group-hover:text-neutral-600">
                        <Clock className="w-4 h-4 text-neutral-300 group-hover:text-primary-400" />
                        {new Date(loc.updated_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                     </div>
                     <div className="flex items-center gap-2 text-[11px] font-bold text-neutral-400 transition-colors group-hover:text-neutral-600">
                        <Package className="w-4 h-4 text-neutral-300 group-hover:text-primary-400" />
                        {loc.stock} Unit
                     </div>
                  </div>

                  {activeLocationId === loc.id && (
                     <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 -mr-16 -mt-16 rounded-full blur-3xl z-0" />
                  )}
                </motion.div>
              ))
            )}
         </div>
      </div>
    </div>

  );
}
