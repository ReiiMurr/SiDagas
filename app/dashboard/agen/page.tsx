"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Package, 
  MapPin, 
  TrendingUp, 
  AlertTriangle,
  Flame,
  Clock,
  ExternalLink,
  Loader2,
  ChevronRight,
  Zap,
  FileSpreadsheet,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AgenDashboard() {
  const [stats, setStats] = useState([
    { name: "Total Titik", value: "0", icon: MapPin, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Total Stok", value: "0", icon: Package, color: "text-primary-600", bg: "bg-primary-50" },
    { name: "Stok Kritis", value: "0", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  ]);
  const [recentLocations, setRecentLocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchAgenData();
  }, []);

  async function fetchAgenData() {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        window.location.href = "/login";
        return;
      }

      const userId = session.user.id;
      
      // Fetch profile and locations in parallel
      const [{ data: profileData }, { data: locations, error }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('gas_locations')
          .select('*')
          .eq('agen_id', userId)
          .order('updated_at', { ascending: false })
      ]);

      if (profileData) setProfile(profileData);
      if (error) throw error;

      const totalStok = locations?.reduce((acc, curr) => acc + (curr.stock || 0), 0) || 0;
      const stokTipis = locations?.filter(l => l.stock < 10).length || 0;

      setStats([
        { name: "Total Titik", value: (locations?.length || 0).toString(), icon: MapPin, color: "text-blue-600", bg: "bg-blue-50" },
        { name: "Total Stok", value: totalStok.toString(), icon: Package, color: "text-primary-600", bg: "bg-primary-50" },
        { name: "Stok Kritis", value: stokTipis.toString(), icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
      ]);

      setRecentLocations(locations || []);
    } catch (error: any) {
      console.error("Error fetching agen data:", error.message || error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-16">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
           <h1 className="text-4xl lg:text-5xl font-medium text-neutral-900 tracking-tight leading-none">
             Dashboard <span className="text-primary-600 font-bold italic">Agen.</span>
           </h1>
           <p className="text-neutral-500 font-medium text-lg">Selamat datang kembali, {profile?.full_name?.split(' ')[0] || "Rekan"}. Berikut ringkasan operasional Anda.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-white border border-neutral-200 px-6 py-3 rounded-2xl flex items-center gap-3 text-sm font-bold text-neutral-700 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              Sistem Aktif
           </div>
           <div className="bg-neutral-900 text-white px-6 py-3 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-xl shadow-neutral-200">
              <Clock className="w-4 h-4 text-primary-400" />
              {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
           </div>
        </div>
      </div>

      {/* Stats Cluster */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="bg-white p-10 rounded-[2.5rem] border border-neutral-200/60 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative"
          >
            <div className="flex items-center justify-between mb-8 relative z-10">
               <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm`}>
                 <stat.icon className="w-7 h-7" />
               </div>
               <div className="bg-neutral-50 p-2 rounded-lg group-hover:bg-primary-50 transition-colors">
                 <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-primary-600" />
               </div>
            </div>
            <div className="relative z-10">
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-[0.2em] mb-3">{stat.name}</p>
              {isLoading ? (
                <div className="h-12 w-32 bg-neutral-50 animate-pulse rounded-xl mt-2" />
              ) : (
                <div className="flex items-end gap-3">
                  <h3 className="text-5xl font-bold text-neutral-900 tracking-tighter">{stat.value}</h3>
                  <span className="text-sm font-bold text-neutral-400 mb-1.5 uppercase tracking-widest">{stat.name.split(' ')[1] || "Unit"}</span>
                </div>
              )}
            </div>
            {/* Background Decorative Element */}
            <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity ${stat.bg}`} />
          </motion.div>
        ))}
      </div>

      <div className="pt-8">
        {/* Dynamic List */}
        <div className="space-y-10">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-8">
            <div className="flex items-center gap-5">
              <div className="bg-primary-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Status Pangkalan</h2>
                <p className="text-sm font-medium text-neutral-400">Monitoring pergerakan stok real-time</p>
              </div>
            </div>
            <button 
              onClick={fetchAgenData} 
              className="px-5 py-2.5 bg-neutral-50 hover:bg-white border border-neutral-100 hover:border-primary-200 rounded-xl text-[10px] font-bold text-neutral-500 hover:text-primary-600 uppercase tracking-[0.15em] transition-all flex items-center gap-2"
            >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                Refresh Data
            </button>
          </div>
          
          <div className="space-y-5">
            {recentLocations.slice(0, 5).map((loc) => (
              <motion.div 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={loc.id} 
                className="bg-white p-8 rounded-[2rem] border border-neutral-100 hover:border-primary-200 flex flex-col sm:flex-row items-center justify-between gap-6 group transition-all shadow-sm hover:shadow-xl"
              >
                <div className="flex items-center gap-6 w-full">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-sm shrink-0 transition-transform group-hover:scale-105 ${
                    loc.stock > 20 ? "bg-primary-50 border-primary-100 text-primary-600" :
                    loc.stock > 0 ? "bg-amber-50 border-amber-100 text-amber-600" :
                    "bg-red-50 border-red-100 text-red-600"
                  }`}>
                    <Package className="w-7 h-7" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-neutral-900 text-xl group-hover:text-primary-700 transition-colors truncate">{loc.name}</h4>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                        <span className="flex items-center gap-2 text-neutral-400 font-bold text-xs uppercase tracking-wider">
                          <MapPin className="w-4 h-4 text-neutral-300" />
                          {loc.address.split(',')[0]}
                        </span>
                        <span className="flex items-center gap-2 text-neutral-400 font-bold text-xs uppercase tracking-wider">
                          <Clock className="w-4 h-4 text-neutral-300" />
                          Upd: {new Date(loc.updated_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-neutral-50 pt-6 sm:pt-0">
                  <div className="text-right">
                    <p className="text-3xl font-bold text-neutral-900 tracking-tighter">{loc.stock}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Tersedia</p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${
                      loc.stock > 20 ? "bg-primary-50 text-primary-700 border-primary-100" :
                      loc.stock > 0 ? "bg-amber-50 text-amber-700 border-amber-100" :
                      "bg-red-50 text-red-700 border-red-100"
                  }`}>
                      {loc.stock > 20 ? "Aman" : loc.stock > 0 ? "Waspada" : "Habis"}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {recentLocations.length > 5 && (
              <Link 
                href="/dashboard/agen/locations"
                className="flex items-center justify-center gap-3 w-full py-5 bg-neutral-50 hover:bg-white border border-neutral-100 rounded-2xl text-sm font-bold text-neutral-500 hover:text-primary-600 transition-all group"
              >
                Lihat Semua Lokasi ({recentLocations.length}) <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
