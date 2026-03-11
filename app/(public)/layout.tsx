import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import StarrySky from "@/components/StarrySky";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { queryOne, toBool } from "@/lib/db";
import type { SiteSettings } from "@/lib/db-types";
import { SETTINGS_BOOLS } from "@/lib/db-types";
import { getFeatureFlags } from "@/lib/config/feature-flags";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, featureFlags] = await Promise.all([
    queryOne<SiteSettings>("SELECT * FROM SiteSettings WHERE id = ?", ["singleton"]),
    getFeatureFlags(),
  ]);
  if (settings) toBool(settings, ...SETTINGS_BOOLS);

  return (
    <div className="min-h-screen bg-midnight relative">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:bg-gold focus:text-midnight focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to main content
      </a>
      <StarrySky />
      <AnnouncementBanner settings={settings} />
      <Navigation
        weddingDate={settings?.weddingDate || null}
        featureFlags={featureFlags}
      />
      <main id="main-content" className="relative z-10">{children}</main>
      <Footer />
    </div>
  );
}
