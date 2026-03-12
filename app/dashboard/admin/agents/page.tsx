"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Plus, 
  Search, 
  Trash2, 
  Mail,
  MoreVertical,
  X,
  Loader2,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";

import { createAgentAction } from "@/app/actions/agents";

interface Agent {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  locations_count?: number;
}

export default function ManageAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  async function fetchAgents() {
    setIsLoading(true);
    try {
      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'agen');

      if (pError) throw pError;

      const agentsWithCount = await Promise.all((profiles || []).map(async (agent) => {
        try {
          const { count } = await supabase
            .from('gas_locations')
            .select('*', { count: 'exact', head: true })
            .eq('agen_id', agent.id);
          
          return { ...agent, locations_count: count || 0 };
        } catch (e) {
          return { ...agent, locations_count: 0 };
        }
      }));

      setAgents(agentsWithCount);
    } catch (error: any) {
      console.error("Full Fetch Error:", error);
      alert("Error fetching agents: " + (error.message || JSON.stringify(error)));
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert("Password minimal 6 karakter.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createAgentAction({
        email: newEmail,
        fullName: newName,
        password: newPassword
      });

      if (result.success) {
        alert("Agen berhasil didaftarkan! User login dan profil telah dibuat secara otomatis.");
        setIsModalOpen(false);
        setNewEmail("");
        setNewName("");
        setNewPassword("");
        fetchAgents();
      } else {
        alert("Gagal: " + result.error);
      }
    } catch (error: any) {
      console.error("Critical Error:", error);
      alert("Gagal menambah agen: Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (!confirm("Hapus agen ini? Seluruh data pangkalan terkait juga akan terpengaruh.")) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchAgents();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredAgents = agents.filter(a => 
    a.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (a.full_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10">
      {/* Header - 12 Column */}
      <div className="grid grid-cols-12 gap-6 items-end">
        <div className="col-span-12 md:col-span-8">
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Daftar Agen Penyalur</h1>
          <p className="text-neutral-500 font-medium italic mt-1">Otorisasi dan pantau performa seluruh mitra distribusi resmi.</p>
        </div>
        <div className="col-span-12 md:col-span-4 flex md:justify-end">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition-all shadow-soft"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Agen</span>
          </button>
        </div>
      </div>

      {/* Filter Area */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-primary-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Cari berdasarkan nama atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-neutral-200 pl-11 pr-4 py-3.5 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm font-medium shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Data Section */}
      <div className="bg-white rounded-[2rem] border border-neutral-200 shadow-soft overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-32 gap-4">
            <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
            <p className="text-neutral-400 text-sm font-bold uppercase tracking-widest">Sinkronisasi Data...</p>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-32 text-center space-y-4">
            <div className="bg-neutral-50 p-6 rounded-full">
              <Users className="w-12 h-12 text-neutral-200" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-neutral-900">Belum Ada Agen Terdaftar</h3>
               <p className="text-neutral-400 text-sm max-w-xs mx-auto mt-2">Daftarkan mitra agen pertama Anda untuk mulai mengisi basis data sistem SiDagas.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-neutral-50/50 border-b border-neutral-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Profil Mitra</th>
                  <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Informasi Kontak</th>
                  <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Cakupan Wilayah</th>
                  <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Otoritas</th>
                  <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] text-right">Opsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-neutral-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-neutral-100 text-neutral-600 rounded-xl flex items-center justify-center font-black text-lg shadow-sm border border-neutral-200">
                          {(agent.full_name || agent.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 text-base">{agent.full_name || "Agen LBN"}</p>
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">
                            ID: {agent.id.split('-')[0]} • {new Date(agent.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2.5 text-sm text-neutral-600 font-bold">
                          <Mail className="w-4 h-4 text-neutral-300" />
                          {agent.email}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                          <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-lg font-black text-sm border border-primary-100">
                            {agent.locations_count}
                          </div>
                          <span className="text-xs text-neutral-400 font-bold uppercase tracking-tight">Pangkalan</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-neutral-900 uppercase tracking-widest">Active Partner</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleDeleteAgent(agent.id)}
                            className="p-3 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Cabut Akses"
                          >
                              <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="p-3 text-neutral-300 hover:text-neutral-900 rounded-xl transition-all">
                              <MoreVertical className="w-4 h-4" />
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

      {/* Modal - Refined Design */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-strong relative z-10 overflow-hidden"
            >
              <div className="px-8 pt-10 pb-6 flex justify-between items-center bg-neutral-50/50">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-neutral-900 tracking-tight">Tambah Agen Baru</h3>
                  <p className="text-sm text-neutral-500 font-medium">Lengkapi profil agen penyalur resmi.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors"><X /></button>
              </div>
              <form onSubmit={handleAddAgent} className="p-10 space-y-8">
                <div className="grid grid-cols-12 gap-6">
                   <div className="col-span-12 space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 ml-1">Identitas Lengkap</label>
                      <input 
                        type="text" required value={newName} onChange={(e) => setNewName(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 px-5 py-4 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
                        placeholder="Contoh: PT. Sumber Gas Mandiri" 
                      />
                   </div>
                   <div className="col-span-12 space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 ml-1">Email Korespondensi</label>
                      <input 
                        type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 px-5 py-4 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
                        placeholder="kantor@agenlpg.com" 
                      />
                   </div>
                   <div className="col-span-12 space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 ml-1">Kata Sandi Akses</label>
                      <input 
                        type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 px-5 py-4 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium font-sans"
                        placeholder="••••••••" 
                      />
                   </div>
                </div>

                <div className="bg-primary-50/50 p-6 rounded-3xl border border-primary-100 flex gap-4 text-primary-900">
                  <AlertCircle className="w-6 h-6 shrink-0 text-primary-500" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider">Otorisasi Langsung</p>
                    <p className="text-[11px] leading-relaxed font-medium opacity-80">Agen akan langsung memiliki hak akses untuk mengelola pangkalan gas setelah pendaftaran berhasil.</p>
                  </div>
                </div>

                <button 
                  disabled={isSubmitting}
                  className="w-full bg-neutral-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-50 transition-all shadow-soft flex items-center justify-center gap-3"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Proses Pendaftaran"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
