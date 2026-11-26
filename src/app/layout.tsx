import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { requestLanguage } from "@/features/storefront/lib/request-language";
import "./globals.css";
import "@/features/storefront/storefront.css";
import "@/features/storefront/motion.css";
import "@/features/storefront/toast.css";
import "@/features/storefront/modal.css";

const title = "ONE IDENTITY — Everyday, together.";
const description =
  "Handmade BioThane® collars, leashes and harnesses for dogs. Your dog. Your style. One identity.";

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
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f5f1",
};

// The document language follows the shopper's language, read per request.
export const instant = false;

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang={await requestLanguage()}>
      <body>{children}</body>
    </html>
  );
}
