"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SitePasswordPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/site-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Incorrect password. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-midnight flex items-center justify-center p-4">
      {/* Stars background effect */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-royal/20 via-midnight to-midnight" />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🌙</div>
          <h1 className="font-serif text-3xl text-gold mb-2">
            Forever Campbells
          </h1>
          <p className="text-ivory/50 text-sm">
            Enter the password from your invitation
          </p>
        </div>

        <div className="card-celestial">
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-celestial w-full text-center text-lg tracking-widest"
                placeholder="••••••••"
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading || !password}
              className="btn-gold w-full py-3 disabled:opacity-50"
            >
              {loading ? "Checking..." : "Enter"}
            </button>
          </form>
        </div>

        <p className="text-center text-ivory/30 text-xs mt-6">
          Can&apos;t find your password? Contact us at{" "}
          <a href="mailto:forevercampbells@hotmail.com" className="text-gold/50 hover:text-gold">
            forevercampbells@hotmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
