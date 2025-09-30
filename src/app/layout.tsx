import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import Navigation from "../components/Navigation";
import ThemeSwitcher from "../components/ThemeSwitcher";
import BootupSequence from "../components/BootupSequence";
import SoundLoader from "../components/SoundLoader";
import AmbientSound from "../components/AmbientSound";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NeoRealm - Cyberpunk Roleplay",
  description: "A gamified cyberpunk roleplay social platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 min-h-screen`}
      >
        <BootupSequence />
        <AuthProvider>
          <SoundLoader />
          <AmbientSound />
          <ThemeSwitcher />
          <Navigation />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
