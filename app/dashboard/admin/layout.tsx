"use client";

import { LayoutDashboard, Users, MapPin, ShieldCheck, LogOut, User, Bell } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: "Ringkasan", href: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Daftar Agen", href: "/dashboard/admin/agents", icon: Users },
    { name: "Sebaran Stok", href: "/dashboard/admin/locations", icon: MapPin },
    { name: "Log Audit", href: "/dashboard/admin/audit", icon: ShieldCheck },
  ];

  const handleLogout = () => router.push("/login");

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-neutral-200 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image src="/SiDagas.logo.png" alt="SiDagas Logo" fill className="object-contain" />
            </div>
            <span className="text-xl font-bold text-neutral-900 tracking-tight">SiDagas <span className="text-[10px] text-primary-600 border border-primary-200 px-2 py-0.5 rounded-md uppercase ml-1">Admin</span></span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                  isActive
                    ? "bg-primary-50 text-primary-700 shadow-sm"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary-600" : "text-neutral-400"}`} />
                <span>{item.name}</span>
                {isActive && <motion.div layoutId="activeNav" className="ml-auto w-1.5 h-1.5 bg-primary-600 rounded-full" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-200">
           <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
              <div className="w-10 h-10 bg-white shadow-soft rounded-full flex items-center justify-center border border-neutral-100">
                <User className="w-5 h-5 text-neutral-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-neutral-900 truncate">Administrator</p>
                <p className="text-[11px] font-medium text-neutral-500 truncate">Sistem Monitoring Terpadu</p>
              </div>
           </div>
           <button
            onClick={handleLogout}
            className="w-full mt-4 flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all text-sm font-bold"
          >
            <LogOut className="w-5 h-5" />
            <span>Selesai Sesi</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen">
        <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200 h-20 flex items-center justify-between px-8 sticky top-0 z-30">
            <div className="md:hidden flex items-center gap-2">
                <div className="relative w-7 h-7">
                    <Image src="/SiDagas.logo.png" alt="SiDagas Logo" fill className="object-contain" />
                </div>
                <span className="font-bold text-neutral-900 uppercase text-xs tracking-widest">SiDagas Admin</span>
            </div>
            <div className="flex items-center gap-4 ml-auto">
                <button className="p-2.5 text-neutral-400 hover:text-neutral-600 bg-neutral-50 rounded-full border border-neutral-200">
                    <Bell className="w-5 h-5" />
                </button>
                <div className="h-8 w-[1px] bg-neutral-200" />
                <button className="flex items-center gap-2 text-sm font-bold text-neutral-900 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200">
                   <div className="w-6 h-6 bg-primary-600 rounded-full text-[10px] text-white flex items-center justify-center">A</div>
                   Admin
                </button>
            </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
