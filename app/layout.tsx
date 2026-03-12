import type { Metadata } from "next";
import { Spline_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const splineSans = Spline_Sans({
  subsets: ["latin"],
  variable: "--font-spline",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SiDagas",
  description: "Akses informasi ketersediaan gas 3kg resmi pemerintah dengan transparansi dan kemudahan.",
  icons: {
    icon: "/SiDagas.logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={cn(
        splineSans.variable,
        "font-sans antialiased selection:bg-primary-100 selection:text-primary-700"
      )}>
        {children}
      </body>
    </html>
  );
}
