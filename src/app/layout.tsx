import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

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
