"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Search, 
  Package, 
  Clock, 
  Loader2,
  ExternalLink,
  User,
  AlertTriangle
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Location {
  id: string;
  name: string;
  address: string;
  stock: number;
  operating_hours: string;
  agen_id: string;
  profiles?: {
    full_name: string;
  };
}

export default function AdminLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLocations();
  }, []);

  async function fetchLocations() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('gas_locations')
        .select(`
          *,
          profiles(full_name)
        `)
        .order('name');

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (loc.profiles?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10">
      {/* Header - 12 Column */}
      <div className="grid grid-cols-12 gap-6 items-end">
        <div className="col-span-12 md:col-span-8">
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Eksplorasi Jaringan Distribusi</h1>
          <p className="text-neutral-500 font-medium italic mt-1">Pantau kesiapan stok di seluruh pangkalan LPG 3kg secara real-time.</p>
        </div>
        <div className="col-span-12 md:col-span-4 flex md:justify-end">
          <div className="bg-white px-4 py-2 rounded-xl border border-neutral-200 flex items-center gap-2 text-xs font-bold text-neutral-500 shadow-soft">
             <div className="w-2 h-2 bg-primary-500 rounded-full animate-ping" />
             Sinkronisasi Aktif
          </div>
        </div>
      </div>

      {/* Filter & Search - 12 Column */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-6 lg:col-span-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-primary-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Cari lokasi, alamat, atau agen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-neutral-200 pl-11 pr-4 py-3.5 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm font-medium shadow-sm"
              />
           </div>
        </div>
      </div>

      {/* Data Section */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-32 gap-4">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
          <p className="text-neutral-400 text-sm font-bold uppercase tracking-widest text-center">Menghubungkan ke Satelit...</p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-8">
          {filteredLocations.length === 0 ? (
            <div className="col-span-12 flex flex-col items-center justify-center p-32 text-center space-y-4">
               <div className="bg-neutral-50 p-6 rounded-full">
                 <AlertTriangle className="w-12 h-12 text-neutral-200" />
               </div>
               <p className="text-neutral-400 font-bold uppercase tracking-widest">Tidak ada pangkalan ditemukan</p>
            </div>
          ) : (
            filteredLocations.map((loc, idx) => (
              <motion.div
                key={loc.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="col-span-12 md:col-span-6 lg:col-span-4 bg-white rounded-[2rem] border border-neutral-200 shadow-soft overflow-hidden flex flex-col group hover:border-primary-200 transition-all hover:shadow-strong"
              >
                <div className="p-8 flex-1 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100 group-hover:bg-primary-50 group-hover:border-primary-100 transition-colors">
                      <MapPin className="w-6 h-6 text-neutral-400 group-hover:text-primary-600 transition-colors" />
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                      loc.stock > 20 ? 'bg-primary-50 text-primary-700 border border-primary-100' : 
                      loc.stock > 0 ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {loc.stock > 20 ? 'Stok Terjamin' : loc.stock > 0 ? 'Waspada Kelangkaan' : 'Kehabisan Pasokan'}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-black text-neutral-900 tracking-tight leading-none group-hover:text-primary-700 transition-colors">{loc.name}</h3>
                    <p className="text-sm text-neutral-400 font-medium mt-3 line-clamp-2 leading-relaxed italic">{loc.address}</p>
                  </div>
                  
                  <div className="space-y-4 pt-6 border-t border-neutral-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                        <Package className="w-3.5 h-3.5" /> Volume Saat Ini
                      </span>
                      <span className="font-black text-neutral-900 text-lg tracking-tighter">{loc.stock} <span className="text-xs font-bold text-neutral-400 ml-1 italic">Tabung</span></span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                        <User className="w-3.5 h-3.5" /> Penanggung Jawab
                      </span>
                      <span className="text-sm font-bold text-neutral-700 truncate max-w-[150px]">{loc.profiles?.full_name || 'Mitra LBN'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" /> Jam Aktif
                      </span>
                      <span className="text-xs font-bold text-neutral-500 italic">{loc.operating_hours || '08:00 - 17:00'}</span>
                    </div>
                  </div>
                </div>
                
                <button className="w-full py-5 bg-neutral-50 border-t border-neutral-100 group-hover:bg-neutral-900 group-hover:text-white transition-all text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                  Arahkan ke Lokasi <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                </button>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
