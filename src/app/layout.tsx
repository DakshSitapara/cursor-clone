import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Cursor Clone",
  description: "Cursor Clone built with Next.js and Tailwind CSS",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/logo-alt.svg",
        href: "/logo-alt.svg",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/logo.svg",
        href: "/logo.svg",
      },
    ],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${plexMono.variable} antialiased`}>

        <Providers>
          {children}
        </Providers>
        
      </body>
    </html>
  );
} 
