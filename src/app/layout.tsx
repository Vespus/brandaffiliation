import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SideMenu from "@/components/SideMenu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Markencharakteristiken",
  description: "Entdecken Sie die Vielfalt der Markenwelt",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex min-h-screen bg-gray-50">
          <SideMenu />
          <main className="flex-1 ml-64 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
