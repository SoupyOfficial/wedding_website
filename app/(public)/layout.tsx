import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import StarrySky from "@/components/StarrySky";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { queryOne, toBool } from "@/lib/db";
import type { SiteSettings } from "@/lib/db-types";
import { SETTINGS_BOOLS } from "@/lib/db-types";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await queryOne<SiteSettings>("SELECT * FROM SiteSettings WHERE id = ?", ["singleton"]);
  if (settings) toBool(settings, ...SETTINGS_BOOLS);

  return (
    <div className="min-h-screen bg-midnight relative">
      <StarrySky />
      <AnnouncementBanner settings={settings} />
      <Navigation
        weddingDate={settings?.weddingDate || null}
      />
      <main className="relative z-10">{children}</main>
      <Footer />
    </div>
  );
}
