export const dynamic = "force-dynamic";
import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/services/settings.service";

export const runtime = "nodejs";
export const alt = "Forever Campbells Wedding";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const settings = await getSettings("coupleName", "weddingDate", "venueName", "venueAddress");

  const coupleName = settings?.coupleName || "Jacob & Ashley";
  const weddingDate = settings?.weddingDate
    ? new Date(settings.weddingDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;
  const venue = settings?.venueName || null;
  const location = settings?.venueAddress || null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a1a 0%, #0d0d2b 50%, #0a0a1a 100%)",
          fontFamily: "Georgia, serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Star decorations */}
        {[
          { top: "10%", left: "8%" }, { top: "20%", left: "85%" },
          { top: "70%", left: "5%" }, { top: "80%", left: "90%" },
          { top: "40%", left: "3%" }, { top: "15%", left: "50%" },
          { top: "85%", left: "50%" },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: i % 2 === 0 ? "4px" : "3px",
              height: i % 2 === 0 ? "4px" : "3px",
              borderRadius: "50%",
              background: "#C9A84C",
              opacity: 0.6 + (i % 3) * 0.1,
              top: pos.top,
              left: pos.left,
            }}
          />
        ))}

        {/* Top decorative line */}
        <div
          style={{
            width: "200px",
            height: "1px",
            background: "linear-gradient(90deg, transparent, #C9A84C, transparent)",
            marginBottom: "40px",
          }}
        />

        {/* Couple name */}
        <div
          style={{
            fontSize: "80px",
            fontWeight: "700",
            color: "#C9A84C",
            letterSpacing: "-2px",
            textAlign: "center",
            lineHeight: 1.1,
            textShadow: "0 0 60px rgba(201, 168, 76, 0.3)",
            marginBottom: "24px",
          }}
        >
          {coupleName}
        </div>

        {/* Divider */}
        <div
          style={{
            width: "80px",
            height: "2px",
            background: "#C9A84C",
            opacity: 0.6,
            marginBottom: "24px",
          }}
        />

        {/* Wedding date */}
        {weddingDate && (
          <div
            style={{
              fontSize: "28px",
              color: "#e8e0d0",
              opacity: 0.9,
              marginBottom: "12px",
              letterSpacing: "2px",
            }}
          >
            {weddingDate}
          </div>
        )}

        {/* Venue */}
        {venue && (
          <div
            style={{
              fontSize: "20px",
              color: "#e8e0d0",
              opacity: 0.55,
              letterSpacing: "1px",
            }}
          >
            {venue}{location ? ` · ${location}` : ""}
          </div>
        )}

        {/* Bottom decorative line */}
        <div
          style={{
            width: "200px",
            height: "1px",
            background: "linear-gradient(90deg, transparent, #C9A84C, transparent)",
            marginTop: "40px",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
