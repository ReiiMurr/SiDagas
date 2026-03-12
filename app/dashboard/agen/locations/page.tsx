"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Plus, 
  FileSpreadsheet, 
  Search, 
  MapPin, 
  Clock, 
  Package, 
  Trash2, 
  Download, 
  Upload, 
  X,
  Loader2,
  AlertCircle,
  HelpCircle,
  ChevronRight
} from "lucide-react";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface Location {
  id: string;
  name: string;
  address: string;
  stock: number;
  latitude: number;
  longitude: number;
  operating_hours: string;
}

import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-neutral-50 animate-pulse rounded-2xl border border-neutral-100 flex items-center justify-center font-bold text-neutral-400">Memuat Pemetaan...</div>
});

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State for new location
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    stock: 0,
    operating_hours: "08:00 - 17:00",
    latitude: -6.2000,
    longitude: 106.8166
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  async function fetchLocations() {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('gas_locations')
        .select('*')
        .eq('agen_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          alert("Sesi tidak valid.");
          return;
        }

        const newLocations = data.map((item) => ({
          name: item.Nama || item.name || "Unknown",
          address: item.Alamat || item.address || "-",
          stock: parseInt(item.Stok || item.stock || "0"),
          operating_hours: item.Jam || item.hours || "08:00 - 17:00",
          latitude: parseFloat(item.Latitude) || -6.2,
          longitude: parseFloat(item.Longitude) || 106.8,
          agen_id: session.user.id
        }));

        const { error } = await supabase.from('gas_locations').insert(newLocations);
        if (error) throw error;

        fetchLocations();
        setIsImportModalOpen(false);
      } catch (err) {
        alert("Gagal mengimpor file. Periksa format kolom.");
      } finally {
        setImporting(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Sesi Anda telah berakhir. Silakan login kembali.");
        window.location.href = "/login";
        return;
      }

      const { error } = await supabase.from('gas_locations').insert([{
        ...formData,
        agen_id: session.user.id
      }]);

      if (error) throw error;
      setIsFormModalOpen(false);
      // Reset form
      setFormData({
        name: "",
        address: "",
        stock: 0,
        operating_hours: "08:00 - 17:00",
        latitude: -6.2000,
        longitude: 106.8166
      });
      fetchLocations();
    } catch (error) {
      alert("Gagal menambah lokasi.");
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus lokasi pangkalan ini secara permanen?")) return;
    
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Sesi berakhir. Silakan login kembali.");
        return;
      }

      const { error } = await supabase
        .from('gas_locations')
        .delete()
        .eq('id', id)
        .eq('agen_id', session.user.id); // Security double-check

      if (error) throw error;
      
      // Update local state for immediate feedback
      setLocations(prev => prev.filter(loc => loc.id !== id));
      alert("Lokasi berhasil dihapus.");
    } catch (err: any) {
      console.error("Delete Error:", err);
      alert("Gagal menghapus: " + (err.message || "Izin ditolak"));
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      { Nama: "Pangkalan Contoh", Alamat: "Jl. Merdeka No. 10", Stok: 50, Jam: "08:00 - 17:00", Latitude: -6.2, Longitude: 106.8 },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Template_Pangkalan.xlsx");
  };

  const filteredLocations = locations.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* Header Cluster */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4 max-w-2xl">
           <h1 className="text-4xl lg:text-5xl font-medium text-neutral-900 tracking-tight leading-[0.9]">
             Kelola <span className="text-primary-600 font-bold italic">Infrastruktur.</span>
           </h1>
           <p className="text-neutral-500 font-medium text-lg leading-relaxed">Kelola basis data titik distribusi gas subsidi Anda secara mandiri untuk akurasi informasi publik.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-3 px-8 py-4 bg-white border border-neutral-200 text-neutral-900 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-neutral-50 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-5 h-5 text-primary-600" />
            Import XLSX
          </button>
          <button 
            onClick={() => setIsFormModalOpen(true)}
            className="flex items-center gap-3 px-8 py-4 bg-neutral-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl shadow-neutral-200 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Tambah Manual
          </button>
        </div>
      </div>

      {/* Tools Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative group w-full max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Cari pangkalan atau alamat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-neutral-200 pl-14 pr-6 py-4 rounded-2xl outline-none focus:ring-8 focus:ring-primary-500/5 focus:border-primary-500 transition-all text-sm font-medium shadow-sm"
            />
        </div>
        <div className="flex items-center gap-2 px-5 py-2.5 bg-neutral-50 rounded-2xl border border-neutral-100 italic font-medium text-neutral-400 text-xs">
            Menampilkan {filteredLocations.length} dari {locations.length} pangkalan terdaftar
        </div>
      </div>

      {/* Main Table Segment */}
      <div className="bg-white rounded-[3rem] border border-neutral-200/60 shadow-xl overflow-hidden relative min-h-[500px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-32 gap-8">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center border border-primary-100">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
            <p className="text-neutral-400 font-bold uppercase tracking-[0.3em] text-[10px]">Sinkronisasi Otoritas...</p>
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-40 text-center space-y-8">
            <div className="bg-neutral-50 w-24 h-24 rounded-full border border-neutral-100 flex items-center justify-center shadow-inner">
               <MapPin className="w-10 h-10 text-neutral-200" />
            </div>
            <div className="space-y-3">
               <h3 className="text-2xl font-bold text-neutral-900">Belum Ada Lokasi</h3>
               <p className="text-neutral-400 text-sm font-medium max-w-xs mx-auto leading-relaxed">Gunakan integrasi spreadsheet untuk mengelola infrastruktur skala besar dengan cepat.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/50 border-b border-neutral-100">
                  <th className="px-10 py-6 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Pangkalan</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Volume Stok</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Detail Operasional</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredLocations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-neutral-50/30 transition-all group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="bg-white w-12 h-12 rounded-xl border border-neutral-200 flex items-center justify-center shadow-sm group-hover:border-primary-200 transition-colors">
                           <MapPin className="w-5 h-5 text-neutral-400 group-hover:text-primary-600" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <p className="font-bold text-neutral-900 text-lg group-hover:text-primary-700 transition-colors truncate">{loc.name}</p>
                          <p className="text-sm text-neutral-400 font-medium truncate max-w-xs">{loc.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-end gap-2">
                         <span className="text-3xl font-bold text-neutral-900 tracking-tighter">{loc.stock}</span>
                         <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">Tabung</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-neutral-600">
                             <Clock className="w-4 h-4 text-primary-500" />
                             {loc.operating_hours}
                          </div>
                          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                             ID: {loc.id.split('-')[0]}
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                           <button 
                             onClick={() => handleDelete(loc.id)}
                             disabled={isLoading}
                             className="p-3.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-neutral-100 hover:border-red-200 shadow-sm"
                           >
                             <Trash2 className="w-5 h-5" />
                           </button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Creation Modal */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsFormModalOpen(false)}
              className="fixed inset-0 bg-neutral-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-3xl rounded-[3.5rem] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="px-12 pt-12 pb-8 flex justify-between items-start">
                <div className="space-y-3">
                  <h3 className="text-3xl font-bold text-neutral-900 tracking-tight leading-none">Registrasi Pangkalan</h3>
                  <p className="text-lg text-neutral-500 font-medium">Lengkapi spesifikasi teknis infrastruktur baru Anda.</p>
                </div>
                <button onClick={() => setIsFormModalOpen(false)} className="p-3 bg-neutral-50 hover:bg-neutral-100 rounded-2xl text-neutral-400 hover:text-neutral-900 transition-all"><X /></button>
              </div>
              <form onSubmit={handleAddLocation} className="px-12 pb-12 space-y-10">
                <div className="grid grid-cols-2 gap-8">
                  <div className="col-span-2 space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">Label Entitas</label>
                    <input 
                      required 
                      placeholder="Masukkan nama resmi pangkalan..." 
                      className="w-full px-8 py-5 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:ring-8 focus:ring-primary-500/5 focus:border-primary-500 transition-all font-bold text-neutral-900 shadow-inner" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                  
                  <div className="col-span-2 space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">Alamat Fisik Lengkap</label>
                    <textarea 
                      required 
                      placeholder="Detail alamat domisili pangkalan..." 
                      className="w-full px-8 py-5 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:ring-8 focus:ring-primary-500/5 focus:border-primary-500 transition-all font-bold text-neutral-900 shadow-inner resize-none h-32" 
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})} 
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">Volume Stok Awal</label>
                    <input 
                      type="number" 
                      required 
                      className="w-full px-8 py-5 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:ring-8 focus:ring-primary-500/5 focus:border-primary-500 transition-all font-bold text-primary-600 shadow-inner" 
                      value={formData.stock}
                      onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} 
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 ml-1">Sesi Operasional</label>
                    <input 
                      required 
                      className="w-full px-8 py-5 bg-neutral-50 border border-neutral-100 rounded-2xl outline-none focus:ring-8 focus:ring-primary-500/5 focus:border-primary-500 transition-all font-bold text-neutral-900 shadow-inner" 
                      value={formData.operating_hours}
                      onChange={e => setFormData({...formData, operating_hours: e.target.value})} 
                    />
                  </div>
                </div>
                <button className="w-full bg-neutral-900 text-white py-6 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl shadow-neutral-200 active:scale-95">
                  Simpan Permanen
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Import Modal */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsImportModalOpen(false)}
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[4rem] shadow-2xl relative z-10 p-16 text-center overflow-hidden"
            >
              <div className="bg-primary-50 w-28 h-28 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-primary-100 shadow-inner">
                <FileSpreadsheet className="w-12 h-12 text-primary-600" />
              </div>
              <h3 className="text-3xl font-bold text-neutral-900 tracking-tight uppercase mb-4">Migrasi Cloud</h3>
              <p className="text-neutral-500 mb-12 text-lg font-medium leading-relaxed italic">Hubungkan basis data offline Anda dengan sistem sinkronisasi massal XLSX.</p>
              
              <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx,.xls" />
              
              <div className="space-y-6">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                  className="w-full bg-neutral-900 text-white py-6 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-200 flex items-center justify-center gap-3"
                >
                  {importing ? <Loader2 className="animate-spin" /> : "Pilih Dokumen Spreadsheet"}
                </button>
                <button onClick={downloadTemplate} className="inline-flex items-center gap-3 text-primary-600 font-bold text-xs uppercase tracking-widest hover:text-primary-700 transition-colors bg-primary-50 px-6 py-3 rounded-xl border border-primary-100">
                  <Download className="w-4 h-4" /> Ambil Template Struktur
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
