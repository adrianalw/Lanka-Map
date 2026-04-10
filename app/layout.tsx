import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lanka Map — Explore Sri Lanka",
  description:
    "Interactive map of tourist locations across Sri Lanka. Find beaches, temples, wildlife, waterfalls, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
