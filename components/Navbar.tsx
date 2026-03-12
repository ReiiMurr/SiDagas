"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { LogIn, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Peta Lokasi", href: "/" },
    { name: "Tentang", href: "/#about" },
    { name: "Panduan", href: "#" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? "bg-white/80 backdrop-blur-xl border-b border-neutral-100/50 py-4" : "bg-transparent py-8"
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 transition-all group-hover:scale-110">
              <Image src="/SiDagas.logo.png" alt="SiDagas Logo" fill className="object-contain" priority />
            </div>
            <span className="text-2xl font-bold text-neutral-900 tracking-tight">
              SiDagas
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-12">
            <div className="flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-neutral-500 hover:text-primary-600 transition-all text-sm font-bold tracking-wide hover:-translate-y-0.5"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <Link
              href="/login"
              className="px-7 py-3 bg-neutral-900 text-white rounded-[1.25rem] text-sm font-bold hover:bg-primary-600 transition-all shadow-xl hover:shadow-primary-500/20 flex items-center gap-3 active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              Portal Agen
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-neutral-900 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-neutral-100 overflow-hidden"
          >
            <div className="px-6 py-8 space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block text-lg font-bold text-neutral-900"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 bg-primary-600 text-white px-5 py-4 rounded-2xl font-bold w-full"
                onClick={() => setIsOpen(false)}
              >
                <LogIn className="w-4 h-4" />
                Portal Agen
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
