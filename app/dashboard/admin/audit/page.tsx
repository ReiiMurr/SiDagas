"use client";

import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  History, 
  User, 
  Clock, 
  FileText,
  AlertCircle
} from "lucide-react";

export default function AuditLog() {
  const logs = [
    { id: 1, user: "sidagas.service@gmail.com", action: "Otorisasi Masuk", target: "Infrastruktur Pusat", time: "Hari ini, 10:24", status: "Success" },
    { id: 2, user: "solarity1405@gmail.com", action: "Sinkronisasi Stok", target: "Pangkalan Sejahtera", time: "Hari ini, 09:12", status: "Success" },
    { id: 3, user: "sidagas.service@gmail.com", action: "Registrasi Mitra", target: "Agen LPG Mandiri", time: "Kemarin, 15:30", status: "Pending" },
    { id: 4, user: "solarity1405@gmail.com", action: "Batch Import", target: "Data Excel Tahunan", time: "Kemarin, 14:20", status: "Success" },
  ];

  return (
    <div className="space-y-10">
      <header className="grid grid-cols-12 gap-6 items-end">
        <div className="col-span-12 md:col-span-8">
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Log Integritas Sistem</h1>
          <p className="text-neutral-500 font-medium italic mt-1">Rekaman jejak aktivitas digital untuk menjamin transparansi data.</p>
        </div>
        <div className="col-span-12 md:col-span-4 flex md:justify-end">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-neutral-200 text-neutral-900 rounded-xl font-bold hover:bg-neutral-50 transition-all shadow-soft text-sm">
            <History className="w-4 h-4 text-primary-600" />
            Eksport Log
          </button>
        </div>
      </header>

      <div className="bg-neutral-900 text-white p-8 rounded-[2.5rem] shadow-strong flex flex-col md:flex-row gap-6 items-start relative overflow-hidden">
        <div className="bg-primary-600/20 p-4 rounded-2xl relative z-10 border border-primary-500/20">
          <ShieldCheck className="w-8 h-8 text-primary-400" />
        </div>
        <div className="space-y-2 relative z-10 max-w-2xl">
          <h3 className="text-xl font-black tracking-tight">Kepatuhan & Keamanan</h3>
          <p className="text-neutral-400 text-sm leading-relaxed opacity-90 italic">
            Seluruh data di bawah ini dienkripsi dan diikat dengan tanda tangan digital. Riwayat ini bersifat immutable (tidak dapat diubah) untuk keperluan audit berkala oleh kementerian terkait.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
      </div>

      <div className="bg-white rounded-[2rem] border border-neutral-200 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-neutral-50/50 border-b border-neutral-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Operasi Digital</th>
                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Pelaksana</th>
                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Objek Terkait</th>
                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] text-right">Stempel Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-50/30 transition-all group">
                  <td className="px-8 py-7">
                    <div className="flex items-center gap-4">
                      <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 group-hover:bg-white group-hover:border-primary-200 transition-all">
                        <History className="w-4 h-4 text-neutral-400 group-hover:text-primary-600" />
                      </div>
                      <span className="font-bold text-neutral-900 text-base">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-neutral-700">{log.user.split('@')[0]}</span>
                        <span className="text-[10px] text-neutral-400 font-bold tracking-tight italic">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <div className="flex items-center gap-2.5 text-xs font-bold text-neutral-500">
                        <FileText className="w-3.5 h-3.5 opacity-40 text-neutral-900" />
                        {log.target}
                    </div>
                  </td>
                  <td className="px-8 py-7">
                     <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${
                        log.status === 'Success' ? 'bg-primary-50 text-primary-700 border-primary-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                     }`}>
                        {log.status}
                     </span>
                  </td>
                  <td className="px-8 py-7 text-right">
                    <div className="flex items-center justify-end gap-2 text-xs font-black text-neutral-400">
                      <Clock className="w-3.5 h-3.5" />
                      {log.time}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
