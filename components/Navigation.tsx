"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { clsx } from "clsx";

interface NavLink {
  href: string;
  label: string;
  hidePostWedding?: boolean;
  showPostWedding?: boolean;
  featureFlag?: string;
}

const navLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/our-story", label: "Our Story", featureFlag: "ourStoryPageEnabled" },
  { href: "/event-details", label: "Event Details", featureFlag: "eventDetailsPageEnabled" },
  { href: "/travel", label: "Travel & Stay", featureFlag: "travelPageEnabled" },
  { href: "/wedding-party", label: "Wedding Party", featureFlag: "weddingPartyPageEnabled" },
  { href: "/entertainment", label: "Entertainment", featureFlag: "entertainmentPageEnabled" },
  { href: "/music", label: "Song Requests", featureFlag: "musicPageEnabled" },
  { href: "/rsvp", label: "RSVP", hidePostWedding: true, featureFlag: "rsvpEnabled" },
  { href: "/registry", label: "Registry", featureFlag: "registryPageEnabled" },
  { href: "/faq", label: "FAQ", featureFlag: "faqPageEnabled" },
  { href: "/gallery", label: "Gallery", featureFlag: "galleryPageEnabled" },
  { href: "/photos-of-us", label: "Photos of Us", featureFlag: "photosOfUsPageEnabled" },
  { href: "/guest-book", label: "Guest Book", featureFlag: "guestBookEnabled" },
  { href: "/contact", label: "Contact", featureFlag: "contactPageEnabled" },
];

interface NavigationProps {
  weddingDate?: string | null;
  featureFlags?: Record<string, boolean>;
}

export default function Navigation({ weddingDate, featureFlags = {} }: NavigationProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isPostWedding = weddingDate
    ? new Date(weddingDate) < new Date()
    : false;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const filteredLinks = navLinks.filter((link) => {
    if (isPostWedding && link.hidePostWedding) return false;
    if (!isPostWedding && link.showPostWedding) return false;
    if (link.featureFlag && featureFlags[link.featureFlag] === false) return false;
    return true;
  });

  return (
    <nav
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled || pathname !== "/"
          ? "bg-midnight/95 backdrop-blur-md shadow-lg border-b border-gold/10"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo / Home Link */}
          <Link
            href="/"
            className="text-gold font-serif text-xl lg:text-2xl font-bold hover:text-gold-light transition-colors"
          >
            J & A
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-1 items-center justify-evenly ml-6">
            {filteredLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className={clsx(
                  "px-1 py-2 text-xs xl:text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap text-center",
                  pathname === link.href
                    ? "text-gold border-b-2 border-gold"
                    : "text-ivory/80 hover:text-gold hover:bg-gold/5"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden text-ivory p-2 hover:text-gold transition-colors"
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={clsx(
          "lg:hidden transition-all duration-300 overflow-hidden",
          isMobileOpen ? "max-h-screen" : "max-h-0"
        )}
      >
        <div className="bg-midnight/98 backdrop-blur-lg border-t border-gold/10 px-4 py-4 space-y-1">
          <div className="text-center mb-4">
            <span className="text-gold font-serif text-lg">
              Jacob & Ashley
            </span>
          </div>
          {filteredLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                pathname === link.href
                  ? "text-gold bg-gold/10"
                  : "text-ivory/80 hover:text-gold hover:bg-gold/5"
              )}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
