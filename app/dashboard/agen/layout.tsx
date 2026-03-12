"use client";

import { LayoutDashboard, MapPin, Settings, LogOut, Package, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: "Monitoring", href: "/dashboard/agen", icon: LayoutDashboard },
    { name: "Kelola Lokasi", href: "/dashboard/agen/locations", icon: MapPin },
    { name: "Pengaturan", href: "/dashboard/agen/settings", icon: Settings },
  ];

  const handleLogout = () => {
    // Mock logout
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="w-72 bg-white border-r border-neutral-200/60 hidden md:flex flex-col sticky top-0 h-screen z-40">
        <div className="p-8 pb-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 transition-all group-hover:scale-110">
              <Image src="/SiDagas.logo.png" alt="SiDagas Logo" fill className="object-contain" />
            </div>
            <span className="text-2xl font-bold text-neutral-900 tracking-tight">
              SiDagas
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          <div className="px-4 mb-4">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Menu Otoritas</p>
          </div>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-[1.25rem] transition-all font-semibold text-sm ${
                  isActive
                    ? "bg-neutral-900 text-white shadow-xl shadow-neutral-200"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary-400" : ""}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto border-t border-neutral-100">
          <div className="flex items-center gap-4 p-4 mb-6 bg-neutral-50 rounded-2xl border border-neutral-100">
            <div className="w-10 h-10 bg-white rounded-xl border border-neutral-200 flex items-center justify-center shadow-sm">
              <User className="w-5 h-5 text-neutral-600" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-neutral-900 truncate">Agen Sejahtera</p>
              <p className="text-[10px] font-medium text-neutral-400 truncate uppercase tracking-wider">Mitra Resmi</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-4 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all font-bold text-sm"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/80 backdrop-blur-xl border-b border-neutral-200/60 p-5 sticky top-0 z-30 md:hidden">
            <div className="flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="relative w-8 h-8">
                        <Image src="/SiDagas.logo.png" alt="SiDagas Logo" fill className="object-contain" />
                    </div>
                    <span className="font-bold text-neutral-900 text-lg">SiDagas</span>
                </Link>
                <div className="flex items-center gap-2">
                    <button className="p-2.5 bg-neutral-50 rounded-xl text-neutral-500"><User className="w-5 h-5" /></button>
                    <button 
                        onClick={handleLogout}
                        className="p-2.5 bg-red-50 rounded-xl text-red-500"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
        
        <main className="flex-1 p-6 md:p-12 lg:p-16 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
