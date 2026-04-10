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
    <header className="bg-green-700 text-white px-4 py-3 shadow z-10">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/" className="hover:opacity-90">
            <h1 className="text-xl font-bold tracking-tight">Lanka Map</h1>
            <p className="text-green-200 text-xs">Explore Sri Lanka</p>
          </Link>
        </div>

        <nav className="flex items-center gap-1 sm:gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm px-2 py-1 rounded transition-colors ${
                pathname === link.href
                  ? "bg-green-900 text-white font-medium"
                  : "text-green-100 hover:bg-green-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {locationCount !== undefined && (
          <span className="text-green-200 text-sm hidden sm:block">
            {locationCount}
          </span>
        )}
      </div>
    </header>
  );
}
