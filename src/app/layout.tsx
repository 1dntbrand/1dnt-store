import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "@/features/storefront/storefront.css";

export const metadata: Metadata = {
  title: "ONE IDENTITY — Everyday, together.",
  description:
    "Minimalist dog essentials. Handmade BioThane® collars, leashes and harnesses. Your dog. Your style. One identity.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
