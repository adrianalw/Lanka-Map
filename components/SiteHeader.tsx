"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteHeader({
  locationCount,
}: {
  locationCount?: string;
}) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Map" },
    { href: "/how-to", label: "How-To Guide" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="bg-gradient-to-r from-green-900 to-green-700 text-white px-4 py-3 shadow-md z-10">
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <span className="text-2xl leading-none">🇱🇰</span>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-tight">Lanka Map</h1>
            <p className="text-green-300 text-xs leading-tight">Explore Sri Lanka</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm px-3 py-1.5 rounded-full font-medium transition-all duration-200 ${
                pathname === link.href
                  ? "bg-white text-green-800 shadow-sm"
                  : "text-green-100 hover:bg-green-600/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {locationCount !== undefined && (
          <span className="text-green-200 text-xs hidden sm:flex items-center gap-1.5 bg-green-950/40 px-3 py-1.5 rounded-full border border-green-600/30">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            {locationCount}
          </span>
        )}
      </div>
    </header>
  );
}
