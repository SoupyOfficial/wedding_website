import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/services/settings.service";

export const OG_SIZE = { width: 1200, height: 630 };

export async function generateOGImage(subtitle: string) {
  const settings = await getSettings("coupleName", "weddingDate");
  const coupleName = settings?.coupleName || "Jacob & Ashley";
  const weddingDate = settings?.weddingDate
    ? new Date(settings.weddingDate).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      })
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a1a 0%, #0d0d2b 50%, #0a0a1a 100%)",
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        {[
          { top: "10%", left: "8%" }, { top: "20%", left: "85%" },
          { top: "70%", left: "5%" }, { top: "80%", left: "90%" },
        ].map((pos, i) => (
          <div key={i} style={{ position: "absolute", width: "3px", height: "3px", borderRadius: "50%", background: "#C9A84C", opacity: 0.5, top: pos.top, left: pos.left }} />
        ))}

        {/* Page label */}
        <div style={{ fontSize: "18px", color: "#C9A84C", opacity: 0.7, letterSpacing: "4px", textTransform: "uppercase", marginBottom: "20px" }}>
          {subtitle}
        </div>

        {/* Couple name */}
        <div style={{ fontSize: "72px", fontWeight: "700", color: "#C9A84C", letterSpacing: "-2px", textAlign: "center", lineHeight: 1.1, textShadow: "0 0 60px rgba(201, 168, 76, 0.3)", marginBottom: "16px" }}>
          {coupleName}
        </div>

        <div style={{ width: "80px", height: "2px", background: "#C9A84C", opacity: 0.5, marginBottom: "16px" }} />

        {weddingDate && (
          <div style={{ fontSize: "24px", color: "#e8e0d0", opacity: 0.7, letterSpacing: "2px" }}>
            {weddingDate}
          </div>
        )}
      </div>
    ),
    { ...OG_SIZE }
  );
}
