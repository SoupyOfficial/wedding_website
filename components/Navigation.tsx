"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { publicNavLinks } from "@/lib/config/navigation";

interface NavigationProps {
  weddingDate?: string | null;
  featureFlags?: Record<string, boolean>;
  coupleName?: string | null;
}

export default function Navigation({ weddingDate, featureFlags = {}, coupleName }: NavigationProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isPostWedding = weddingDate ? new Date(weddingDate) < new Date() : false;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    // prevent body scroll when overlay is open
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const filteredLinks = publicNavLinks.filter((link) => {
    if (isPostWedding && link.hidePostWedding) return false;
    if (!isPostWedding && link.showPostWedding) return false;
    if (link.featureFlag && featureFlags[link.featureFlag] === false) return false;
    return true;
  });

  const primaryLinks = filteredLinks.filter((link) => link.primary);
  const secondaryLinks = filteredLinks.filter((link) => !link.primary);

  const displayName = coupleName || "Jacob & Ashley";
  const initials = displayName
    .split(/\s*&\s*/)
    .map((n) => n.trim()[0] || "")
    .join(" & ");

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
          {/* Logo */}
          <Link
            href="/"
            className="text-gold font-serif text-xl lg:text-2xl font-bold hover:text-gold-light transition-colors z-[60] relative"
          >
            {initials}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-1 items-center justify-evenly ml-6">
            {primaryLinks.map((link) => (
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
            className="lg:hidden text-ivory p-2 hover:text-gold transition-colors z-[60] relative"
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileOpen}
          >
            <motion.svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={isMobileOpen ? "open" : "closed"}
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
            </motion.svg>
          </button>
        </div>
      </div>

      {/* Full-Screen Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            key="mobile-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 z-[55] bg-midnight/98 backdrop-blur-xl flex flex-col"
          >
            {/* Star decoration */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(1px 1px at 20% 30%, white, transparent), radial-gradient(1px 1px at 60% 20%, white, transparent), radial-gradient(1px 1px at 80% 60%, white, transparent), radial-gradient(1px 1px at 40% 70%, white, transparent), radial-gradient(1px 1px at 10% 80%, white, transparent), radial-gradient(1px 1px at 90% 40%, white, transparent)",
              }}
            />

            <div className="flex flex-col h-full px-8 pt-24 pb-12 overflow-y-auto">
              {/* Couple name */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="text-center mb-10"
              >
                <span className="text-gold font-serif text-2xl">{displayName}</span>
                <div className="w-16 h-px bg-gold/30 mx-auto mt-3" />
              </motion.div>

              {/* Primary nav links */}
              <nav className="flex flex-col gap-1 flex-1">
                {primaryLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.07 + i * 0.03 }}
                  >
                    <Link
                      href={link.href}
                      aria-current={pathname === link.href ? "page" : undefined}
                      className={clsx(
                        "block px-4 py-3 rounded-xl text-lg font-serif transition-all duration-200",
                        pathname === link.href
                          ? "text-gold bg-gold/10 border border-gold/20"
                          : "text-ivory/80 hover:text-gold hover:bg-gold/5"
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Secondary links */}
                {secondaryLinks.length > 0 && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="mt-4 pt-4 border-t border-gold/10"
                    >
                      <span className="text-ivory/30 text-xs tracking-widest uppercase px-4">
                        More
                      </span>
                    </motion.div>
                    {secondaryLinks.map((link, i) => (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.34 + i * 0.03 }}
                      >
                        <Link
                          href={link.href}
                          aria-current={pathname === link.href ? "page" : undefined}
                          className={clsx(
                            "block px-4 py-2 rounded-xl text-base transition-all duration-200",
                            pathname === link.href
                              ? "text-gold bg-gold/5 border border-gold/10"
                              : "text-ivory/60 hover:text-gold hover:bg-gold/5"
                          )}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    ))}
                  </>
                )}
              </nav>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="pt-8 text-center"
              >
                <p className="text-ivory/20 text-xs tracking-widest uppercase">
                  With love
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
