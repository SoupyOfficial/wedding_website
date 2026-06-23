"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function GuestWelcome() {
  const searchParams = useSearchParams();
  const [guestName, setGuestName] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("invite");
    if (!token) {
      // Check cookie
      const cookie = document.cookie.split("; ").find((r) => r.startsWith("invite_token="));
      if (!cookie) return;
      const stored = cookie.split("=")[1];
      if (stored) fetchGuest(stored);
      return;
    }
    // Set cookie for persistence (session duration)
    document.cookie = `invite_token=${token}; path=/; max-age=86400; SameSite=Lax`;
    fetchGuest(token);
  }, [searchParams]);

  async function fetchGuest(token: string) {
    try {
      const res = await fetch(`/api/v1/invite/${encodeURIComponent(token)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.guest?.firstName) {
        setGuestName(data.guest.firstName);
      }
    } catch {
      // silently ignore
    }
  }

  return (
    <AnimatePresence>
      {guestName && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="text-gold/70 text-sm tracking-widest uppercase mb-2"
        >
          Welcome, {guestName}!
        </motion.div>
      )}
    </AnimatePresence>
  );
}
