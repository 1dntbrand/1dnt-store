import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "@/features/storefront/storefront.css";
import "@/features/storefront/motion.css";

const title = "ONE IDENTITY — Everyday, together.";
const description =
  "Minimalist dog essentials. Handmade BioThane® collars, leashes and harnesses. Your dog. Your style. One identity.";

export const metadata: Metadata = {
  metadataBase: new URL("https://1dnt.eu"),
  title,
  description,
  openGraph: {
    type: "website",
    siteName: "ONE IDENTITY",
    title,
    description,
    locale: "pl_PL",
    alternateLocale: ["en_GB", "ru_RU", "uk_UA"],
    images: [
      {
        url: "/assets/tyubik-hero.jpg",
        width: 1152,
        height: 2048,
        alt: "ONE IDENTITY — handmade BioThane® collar",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f5f1",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
