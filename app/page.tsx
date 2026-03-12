"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { MapPin, ShieldCheck, ArrowRight, Activity, Globe, Zap, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import GasExploration from "@/components/GasExploration";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";


export default function Home() {
  const [locCount, setLocCount] = useState<number | null>(null);

  useEffect(() => {
    async function getCount() {
      const { count } = await supabase.from('gas_locations').select('*', { count: 'exact', head: true });
      setLocCount(count);
    }
    getCount();
  }, []);

  return (
    <main className="min-h-screen bg-white font-sans overflow-x-hidden selection:bg-primary-100 selection:text-primary-900">
      <Navbar />
      
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary-50 rounded-full blur-[120px] opacity-40 animate-pulse" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-[100px] opacity-30" />
        <div className="absolute bottom-[10%] left-[10%] w-[25%] h-[25%] bg-emerald-50 rounded-full blur-[80px] opacity-20" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex-1 space-y-12 text-center lg:text-left"
            >
              <div className="space-y-8">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2.5 px-4 py-2 bg-primary-50/50 backdrop-blur-sm rounded-full border border-primary-100"
                >
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-primary-100 flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full bg-primary-500/20" />
                      </div>
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-primary-700 uppercase tracking-widest flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                    </span>
                    Monitoring Real-time
                  </span>
                </motion.div>

                <h1 className="text-5xl lg:text-8xl font-medium text-neutral-900 leading-[0.95] tracking-tight">
                  Sistem Pendataan <br />
                  <span className="text-primary-600 font-bold italic">Gas Subsidi.</span>
                </h1>
                
                <p className="text-lg lg:text-xl text-neutral-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Transparansi ketersediaan LPG 3kg bersubsidi ke seluruh pelosok negeri. Mempertemukan pangkalan resmi dengan warga yang membutuhkan.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                <a 
                  href="#map" 
                  className="group px-8 py-5 bg-neutral-900 text-white rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-primary-600 transition-all shadow-xl hover:shadow-primary-500/20 flex items-center gap-3 active:scale-95"
                >
                  Cari Pangkalan Terdekat 
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <div className="flex flex-col items-start gap-1">
                   <div className="bg-white/80 backdrop-blur-sm self-center lg:self-start px-4 py-2 rounded-xl border border-neutral-100 shadow-sm flex items-center gap-3">
                      <Activity className="w-4 h-4 text-primary-600" />
                      <span className="text-sm font-bold text-neutral-800">
                        {locCount ? `${locCount}+` : "--"} Pangkalan Aktif
                      </span>
                   </div>
                   {/* <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest pl-1">Update otomatis setiap 15 menit</p> */}
                </div>
              </div>
            </motion.div>

            {/* Right Illustration */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex-1 relative w-full max-w-[500px]"
            >
              <div className="relative group">
                <div className="absolute -inset-4 bg-primary-100/50 rounded-[3rem] blur-2xl group-hover:bg-primary-200/50 transition-colors -z-10" />
                <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-white ring-1 ring-neutral-100">
                  <Image 
                    src="/gas_cylinder_hero_1773234459254.png"
                    alt="Gas Cylinder Hero"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    priority
                  />
                  
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section - Integrated Exploration */}
      <section id="map" className="py-32 bg-white relative">
        <div className="absolute inset-0 bg-neutral-50/30 -z-10" />
        <GasExploration />
      </section>

      <footer className="py-20 bg-white border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-12 gap-12 pb-16">
            {/* Brand Column */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                  <Image src="/SiDagas.logo.png" alt="SiDagas Logo" fill className="object-contain" />
                </div>
                <span className="text-2xl font-bold text-neutral-900 tracking-tight">SiDagas</span>
              </div>
              <p className="text-neutral-500 text-sm leading-relaxed max-w-xs font-medium">
                Layanan informasi resmi penyaluran LPG 3kg bersubsidi. Mengutamakan transparansi dan efisiensi untuk warga negara Indonesia.
              </p>
              <div className="flex gap-4">
                {[
                    { icon: "instagram", href: "https://instagram.com/argareialdii", color: "hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7]" },
                    { icon: "github", href: "https://github.com/ReiiMurr", color: "hover:bg-[#24292f]" }
                ].map((social, idx) => (
                    <a 
                      key={idx}
                      href={social.href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100 text-neutral-400 hover:text-white transition-all group ${social.color}`}
                    >
                      {social.icon === "instagram" ? (
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                      )}
                    </a>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            <div className="col-span-12 sm:col-span-4 lg:col-span-2 space-y-8">
              <h5 className="font-bold text-neutral-900 uppercase tracking-widest text-[11px]">Layanan</h5>
              <ul className="space-y-4 text-sm font-medium text-neutral-400">
                <li><a href="#map" className="hover:text-primary-600 transition-colors">Cek Status Stok</a></li>
                <li><a href="#map" className="hover:text-primary-600 transition-colors">Daftar Pangkalan</a></li>
                <li><a href="mailto:admin@sidagas.id" className="hover:text-primary-600 transition-colors">Layanan Pengaduan</a></li>
              </ul>
            </div>

            <div className="col-span-12 sm:col-span-4 lg:col-span-2 space-y-8">
              <h5 className="font-bold text-neutral-900 uppercase tracking-widest text-[11px]">Informasi</h5>
              <ul className="space-y-4 text-sm font-medium text-neutral-400">
                <li><a href="#" className="hover:text-primary-600 transition-colors">Alur Distribusi</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Kebijakan Publik</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Panduan Warga</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Contact Column */}
            <div className="col-span-12 sm:col-span-4 lg:col-span-4 space-y-8">
              <h5 className="font-bold text-neutral-900 uppercase tracking-widest text-[11px]">Kontak Resmi</h5>
              <ul className="space-y-5 text-sm font-medium text-neutral-400">
                <li className="flex items-start gap-4 group">
                  <div className="bg-neutral-50 p-2 rounded-lg group-hover:bg-primary-50 transition-colors">
                    <Activity className="w-4 h-4 text-neutral-400 group-hover:text-primary-600" />
                  </div>
                  <div>
                    <p className="text-neutral-900 font-bold">Pusat Layanan</p>
                    <p>Pertamina Call Center 135</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 group">
                  <div className="bg-neutral-50 p-2 rounded-lg group-hover:bg-primary-50 transition-colors">
                    <ShieldCheck className="w-4 h-4 text-neutral-400 group-hover:text-primary-600" />
                  </div>
                  <div>
                    <p className="text-neutral-900 font-bold">Email Dukungan</p>
                    <a href="mailto:admin@sidagas.id" className="hover:text-primary-600 transition-colors">admin@sidagas.id</a>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-neutral-400 text-xs font-medium">
              © 2026 SiDagas. All rights reserved.
            </p>
            <div className="flex gap-8 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                <a href="#" className="hover:text-neutral-900 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-neutral-900 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}



