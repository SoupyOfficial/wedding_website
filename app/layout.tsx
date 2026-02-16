import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXTAUTH_URL || "https://forevercampbells.com"
  ),
  title: {
    default: "Jacob & Ashley | Forever Campbells",
    template: "%s | Forever Campbells",
  },
  description:
    "We're getting married! Join us for our celebration under the stars.",
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
    title: "Jacob & Ashley | Forever Campbells",
    description:
      "We're getting married! Join us for our celebration under the stars.",
    type: "website",
    siteName: "Forever Campbells",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Jacob & Ashley — Forever Campbells",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jacob & Ashley | Forever Campbells",
    description:
      "We're getting married! Join us for our celebration under the stars.",
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

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
      </body>
    </html>
  );
}
