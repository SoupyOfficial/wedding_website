import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getSettings } from "@/lib/services/settings.service";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const DEFAULT_DESCRIPTION =
  "We're getting married! Join us for our celebration under the stars.";
const DEFAULT_OG_IMAGE = "/opengraph-image.png";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings("ogImage", "ogDescription", "coupleName");

  const description = settings?.ogDescription || DEFAULT_DESCRIPTION;
  const ogImage = settings?.ogImage || DEFAULT_OG_IMAGE;
  const title = settings?.coupleName
    ? `${settings.coupleName} | Forever Campbells`
    : "Jacob & Ashley | Forever Campbells";

  return {
    metadataBase: new URL(
      process.env.NEXTAUTH_URL || "https://forevercampbells.com"
    ),
    title: {
      default: title,
      template: "%s | Forever Campbells",
    },
    description,
    keywords: [
      "wedding",
      "Jacob Campbell",
      "Ashley Campbell",
      "Forever Campbells",
    ],
    authors: [{ name: "Jacob & Ashley Campbell" }],
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "32x32" },
        { url: "/icon.svg", type: "image/svg+xml" },
      ],
      apple: "/apple-icon.png",
    },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Forever Campbells",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${settings?.coupleName || "Jacob & Ashley"} — Forever Campbells`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
