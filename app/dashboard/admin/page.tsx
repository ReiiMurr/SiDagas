"use client";

import { useEffect, useState } from "react";
import { Users, MapPin, Package, Loader2, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

export default function AdminOverview() {
  const [stats, setStats] = useState({ agents: 0, locations: 0, stock: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const { count: agentsCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'agen');
        const { data: locData } = await supabase.from('gas_locations').select('stock');
        
        const totalStock = locData?.reduce((acc, curr) => acc + curr.stock, 0) || 0;
        setStats({
          agents: agentsCount || 0,
          locations: locData?.length || 0,
          stock: totalStock
        });

        const { data: recent } = await supabase
          .from('gas_locations')
          .select('*, profiles(full_name)')
          .order('updated_at', { ascending: false })
          .limit(5);
        setActivities(recent || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Ringkasan Sistem</h1>
          <p className="text-neutral-500 mt-1 font-medium italic">Pantau performa distribusi gas subsidi hari ini.</p>
        </div>
        <div className="bg-white border border-neutral-200 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold text-neutral-600 shadow-soft">
           <Clock className="w-4 h-4 text-neutral-400" />
           Data terakhir: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </header>

      {/* Stats Grid - 12 Column */}
      <div className="grid grid-cols-12 gap-6">
        {[
          { label: "Total Agen", value: stats.agents, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Titik Distribusi", value: stats.locations, icon: MapPin, color: "text-primary-600", bg: "bg-primary-50" },
          { label: "Volume Stok", value: stats.stock, icon: Package, color: "text-amber-600", bg: "bg-amber-50" }
        ].map((stat, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx} 
            className="col-span-12 md:col-span-4 bg-white p-8 rounded-3xl border border-neutral-200 shadow-soft group hover:border-primary-200 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
               <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                 <stat.icon className="w-6 h-6" />
               </div>
               <TrendingUp className="w-5 h-5 text-neutral-200 group-hover:text-primary-400" />
            </div>
            <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <h2 className="text-4xl font-black text-neutral-900 tracking-tighter">{stat.value}</h2>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Recent Activity */}
        <div className="col-span-12 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
             <h3 className="text-xl font-bold text-neutral-900">Aktivitas Terbaru</h3>
             <button className="text-primary-600 text-sm font-bold hover:underline">Lihat Semua</button>
          </div>
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-soft overflow-hidden">
             {activities.length === 0 ? (
               <p className="p-12 text-center text-neutral-400 italic">Belum ada aktivitas tercatat.</p>
             ) : (
               <div className="divide-y divide-neutral-100">
                 {activities.map((act) => (
                   <div key={act.id} className="p-6 flex items-center justify-between hover:bg-neutral-50 transition-all">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center font-bold text-neutral-500 uppercase text-xs">{(act.profiles?.full_name || 'A')[0]}</div>
                         <div>
                            <p className="font-bold text-neutral-900 leading-none">{act.profiles?.full_name || "Seseorang"}</p>
                            <p className="text-xs text-neutral-500 font-medium mt-1">{act.name} • <span className="text-primary-600">Terupdate {act.stock} unit</span></p>
                         </div>
                      </div>
                      <span className="text-xs font-bold text-neutral-400">{new Date(act.updated_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
