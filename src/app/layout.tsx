import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import {ThemeProvider} from "next-themes";
import {NuqsAdapter} from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner"
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
    title: "Markencharakteristiken",
    description: "Entdecken Sie die Vielfalt der Markenwelt",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="de"
            suppressHydrationWarning
            className={`${geistSans.variable} ${geistMono.variable}`}
        >
        <body className="bg-background text-foreground">
        <NuqsAdapter>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
            >
                <div className="flex min-h-screen flex-col">
                    {children}
                </div>
                <Toaster richColors />
            </ThemeProvider>
        </NuqsAdapter>
        </body>
        </html>
    );
}
