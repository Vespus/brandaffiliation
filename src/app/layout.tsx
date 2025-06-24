import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TRPCReactProvider } from "@/lib/trpc/react";
import { Toaster } from "@/components/ui/sonner"
import { getLocale } from 'next-intl/server';
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";

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

export default async function RootLayout({
                                             children,
                                         }: Readonly<{
    children: React.ReactNode;
}>) {
    const locale = await getLocale();

    return (
        <html
            lang={locale}
            suppressHydrationWarning
            className={`${geistSans.variable} ${geistMono.variable}`}
        >
            <body className="bg-background text-foreground">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                >
                    <NextIntlClientProvider>
                        <TRPCReactProvider>
                            <NuqsAdapter>

                                <>
                                    {children}
                                </>
                                <Toaster richColors duration={6000}/>
                            </NuqsAdapter>
                        </TRPCReactProvider>
                    </NextIntlClientProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
