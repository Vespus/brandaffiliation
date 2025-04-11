import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import SideMenu from "@/components/SideMenu";
import {ClerkProvider, SignedIn, SignedOut, SignInButton, SignUpButton, UserButton} from "@clerk/nextjs";
import {NuqsAdapter} from "nuqs/adapters/next/app";

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
        <ClerkProvider
            signInFallbackRedirectUrl="/dashboard"
            signUpFallbackRedirectUrl="/dashboard"
        >
            <NuqsAdapter>
                <html lang="de">
                    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                        <div className="flex min-h-screen">
                            {children}
                        </div>
                    </body>
                </html>
            </NuqsAdapter>
        </ClerkProvider>
    );
}
