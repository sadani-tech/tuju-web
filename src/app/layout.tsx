import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata: Metadata = {
  title: { default: "Tuju", template: "%s — Tuju" },
  description: "Platform AI untuk menemukan jalur hidupmu — jurusan SMA, kuliah, hingga karier.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-on-background`}>
        {children}
      </body>
    </html>
  );
}
