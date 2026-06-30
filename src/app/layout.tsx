import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Mini Money",
    description: "Personal finance tracker with precision.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className={geistSans.variable}>
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
