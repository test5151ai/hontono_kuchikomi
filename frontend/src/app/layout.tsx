import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "本当の口コミ - 金融機関レビューサイト",
  description: "銀行、証券会社、保険会社など様々な金融機関のレビューと評価を共有するプラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} d-flex flex-column min-vh-100`}>
        <Navbar />
        <div className="flex-grow-1">
          {children}
        </div>
        <Footer />
        <Script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" strategy="beforeInteractive" />
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.min.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
