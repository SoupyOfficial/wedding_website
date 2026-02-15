"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/guests", label: "Guests", icon: "👥" },
  { href: "/admin/content", label: "Content", icon: "📝" },
  { href: "/admin/wedding-party", label: "Wedding Party", icon: "💐" },
  { href: "/admin/photos", label: "Photos", icon: "📸" },
  { href: "/admin/music", label: "Music & DJ", icon: "🎵" },
  { href: "/admin/meals", label: "Meals", icon: "🍽️" },
  { href: "/admin/guest-book", label: "Guest Book", icon: "📖" },
  { href: "/admin/communications", label: "Communications", icon: "✉️" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-midnight flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-midnight border-r border-gold/10 transform lg:transform-none transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gold/10">
            <Link href="/admin" className="block">
              <h2 className="font-serif text-gold text-lg">
                Forever Campbells
              </h2>
              <p className="text-ivory/40 text-xs">Admin Dashboard</p>
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 py-4 overflow-y-auto">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                    isActive
                      ? "text-gold bg-gold/10 border-r-2 border-gold"
                      : "text-ivory/60 hover:text-ivory hover:bg-royal/20"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gold/10">
            <a
              href="/"
              target="_blank"
              className="flex items-center gap-2 text-ivory/40 hover:text-ivory/60 text-xs mb-3 transition-colors"
            >
              🌐 View Site
            </a>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex items-center gap-2 text-red-400/60 hover:text-red-400 text-xs transition-colors w-full"
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-midnight/50 backdrop-blur border-b border-gold/10 px-6 py-4 flex items-center justify-between lg:justify-end">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-ivory/60 hover:text-ivory"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="text-ivory/40 text-sm">
            Welcome, Admin
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
