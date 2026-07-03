import type { Metadata, Viewport } from "next";
import { Press_Start_2P, Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import ClickSound from "./components/ClickSound";
import { CartProvider } from "@/lib/cart-context";

const pixelFont = Press_Start_2P({
  weight: "400",
  variable: "--font-pixel",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  weight: ["400", "600", "700"],
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arkive Market",
  description: "Looking for a specific K-pop item or ordering 2 or more items? Send us a DM for assistance and possible discounts.",
  openGraph: {
    title: "Arkive Market",
    description: "Looking for a specific K-pop item or ordering 2 or more items? Send us a DM for assistance and possible discounts.",
    url: "https://arkivemarket.vercel.app",
    siteName: "Arkive Market",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${pixelFont.variable} ${cormorantGaramond.variable} ${dmSans.variable} antialiased white-cursor-zone`}
      >
        <CartProvider>
          <ClickSound />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
