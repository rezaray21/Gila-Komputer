import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import CartDrawer from "@/components/CartDrawer";
import PageTransition from "@/components/PageTransition";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gila Komputer / Bikin performa ngacirr.",
  description: "Komponen komputer pilihan, PC builder online, dan bantuan rakit dari Gila Komputer.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><PageTransition>{children}</PageTransition><CartDrawer /></body>
    </html>
  );
}
