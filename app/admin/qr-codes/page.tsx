"use client";

import { useState, useRef } from "react";
import { useAdminFetch } from "@/lib/hooks";
import { AdminPageHeader, EmptyState } from "@/components/ui";
import QRCode from "qrcode";
import JSZip from "jszip";

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  inviteToken: string | null;
}

async function generateQRDataURL(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    width: 400,
    margin: 2,
    color: { dark: "#0a0a1a", light: "#ffffff" },
  });
}

function downloadDataURL(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export default function QRCodesPage() {
  const { data: guests, loading, refetch } = useAdminFetch<Guest>("/api/v1/admin/guests");
  const [siteQR, setSiteQR] = useState<string | null>(null);
  const [generatingSite, setGeneratingSite] = useState(false);
  const [generatingBulk, setGeneratingBulk] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [generatingTokens, setGeneratingTokens] = useState(false);

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const guestsWithTokens = guests.filter((g) => g.inviteToken);
  const guestsWithout = guests.filter((g) => !g.inviteToken);

  async function generateSiteQR() {
    setGeneratingSite(true);
    try {
      const url = await generateQRDataURL(siteUrl);
      setSiteQR(url);
    } finally {
      setGeneratingSite(false);
    }
  }

  async function generateBulkZIP() {
    setGeneratingBulk(true);
    setBulkProgress(0);
    try {
      const zip = new JSZip();
      for (let i = 0; i < guestsWithTokens.length; i++) {
        const g = guestsWithTokens[i];
        const inviteUrl = `${siteUrl}/?invite=${g.inviteToken}`;
        const dataUrl = await generateQRDataURL(inviteUrl);
        const base64 = dataUrl.split(",")[1];
        zip.file(`${g.lastName}_${g.firstName}_invite.png`, base64, { base64: true });
        setBulkProgress(Math.round(((i + 1) / guestsWithTokens.length) * 100));
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      downloadDataURL(url, "guest-invite-qr-codes.zip");
      URL.revokeObjectURL(url);
    } finally {
      setGeneratingBulk(false);
      setBulkProgress(0);
    }
  }

  async function generateAllTokens() {
    setGeneratingTokens(true);
    try {
      await fetch("/api/v1/admin/guests/generate-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      refetch();
    } finally {
      setGeneratingTokens(false);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="QR Codes"
        subtitle="Generate QR codes for your wedding invitations and signage"
      />

      {/* Site-wide QR */}
      <div className="bg-royal/20 border border-gold/10 rounded-lg p-6 mb-6">
        <h3 className="text-gold font-serif text-lg mb-2">Site-Wide QR Code</h3>
        <p className="text-ivory/50 text-sm mb-4">
          Links to your wedding website homepage. Use this on physical invitations, signage, or place cards.
        </p>
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            {siteQR ? (
              <div className="rounded-xl overflow-hidden border border-gold/20">
                <img src={siteQR} alt="Site QR Code" className="w-36 h-36" />
              </div>
            ) : (
              <div className="w-36 h-36 bg-midnight/50 border border-gold/10 rounded-xl flex items-center justify-center text-ivory/20 text-4xl">
                🔲
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <p className="text-ivory/60 text-xs font-mono bg-midnight/50 px-3 py-1.5 rounded-lg">{siteUrl}</p>
            <div className="flex gap-2">
              <button
                onClick={generateSiteQR}
                disabled={generatingSite}
                className="btn-gold px-4 py-2 text-sm"
              >
                {generatingSite ? "Generating…" : siteQR ? "Regenerate" : "Generate QR"}
              </button>
              {siteQR && (
                <button
                  onClick={() => downloadDataURL(siteQR, "wedding-site-qr.png")}
                  className="btn-outline px-4 py-2 text-sm"
                >
                  ⬇️ Download PNG
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Per-guest QR codes */}
      <div className="bg-royal/20 border border-gold/10 rounded-lg p-6">
        <h3 className="text-gold font-serif text-lg mb-2">Per-Guest Invite QR Codes</h3>
        <p className="text-ivory/50 text-sm mb-4">
          Each guest gets a unique QR code linking to a personalized invite URL. Requires invite tokens to be generated first.
        </p>

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="text-sm text-ivory/50">
            <span className="text-ivory font-semibold">{guestsWithTokens.length}</span> guests have tokens ·{" "}
            <span className={guestsWithout.length > 0 ? "text-yellow-400 font-semibold" : "text-ivory/30"}>
              {guestsWithout.length}
            </span>{" "}
            without
          </div>
          {guestsWithout.length > 0 && (
            <button
              onClick={generateAllTokens}
              disabled={generatingTokens}
              className="btn-outline px-4 py-2 text-sm"
            >
              {generatingTokens ? "Generating…" : "🔗 Generate Missing Tokens"}
            </button>
          )}
          {guestsWithTokens.length > 0 && (
            <button
              onClick={generateBulkZIP}
              disabled={generatingBulk}
              className="btn-gold px-4 py-2 text-sm"
            >
              {generatingBulk ? `⏳ ${bulkProgress}%…` : `⬇️ Download All as ZIP (${guestsWithTokens.length})`}
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-royal/10 rounded animate-pulse" />)}</div>
        ) : guests.length === 0 ? (
          <EmptyState title="No guests yet" subtitle="Add guests first to generate per-guest QR codes." icon="👥" />
        ) : (
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {guests.map((g) => (
              <GuestQRRow key={g.id} guest={g} siteUrl={siteUrl} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GuestQRRow({ guest, siteUrl }: { guest: Guest; siteUrl: string }) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  async function generate() {
    if (!guest.inviteToken) return;
    setGenerating(true);
    try {
      const url = await generateQRDataURL(`${siteUrl}/?invite=${guest.inviteToken}`);
      setQrUrl(url);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex items-center gap-4 bg-royal/10 border border-gold/5 rounded-lg px-4 py-2 hover:border-gold/20 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-ivory text-sm">{guest.firstName} {guest.lastName}</p>
        {guest.inviteToken ? (
          <p className="text-ivory/30 text-xs font-mono">{siteUrl}/?invite={guest.inviteToken}</p>
        ) : (
          <p className="text-yellow-400/60 text-xs">No token — generate tokens first</p>
        )}
      </div>
      {guest.inviteToken && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {qrUrl ? (
            <>
              <img src={qrUrl} alt="" className="w-10 h-10 rounded" />
              <button
                onClick={() => downloadDataURL(qrUrl, `${guest.lastName}_${guest.firstName}_invite.png`)}
                className="text-gold/60 hover:text-gold text-xs px-2 py-1"
              >
                ⬇️
              </button>
            </>
          ) : (
            <button
              onClick={generate}
              disabled={generating}
              className="text-ivory/40 hover:text-gold text-xs px-2 py-1 transition-colors"
            >
              {generating ? "…" : "Generate"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
