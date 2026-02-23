import { queryOne, toBool } from "@/lib/db";
import type { SiteSettings } from "@/lib/db-types";
import { SETTINGS_BOOLS } from "@/lib/db-types";

interface AnnouncementBannerProps {
  settings?: {
    bannerActive: boolean;
    bannerText: string;
    bannerUrl: string;
    bannerColor: string;
  } | null;
}

export default async function AnnouncementBanner({
  settings: propSettings,
}: AnnouncementBannerProps = {}) {
  let settings = propSettings as (typeof propSettings | SiteSettings);
  if (!settings) {
    const dbSettings = await queryOne<SiteSettings>("SELECT * FROM SiteSettings WHERE id = ?", ["singleton"]);
    if (dbSettings) toBool(dbSettings, ...SETTINGS_BOOLS);
    settings = dbSettings;
  }

  if (!settings?.bannerActive || !settings.bannerText) {
    return null;
  }

  const colorClass =
    settings.bannerColor === "forest"
      ? "bg-forest text-ivory"
      : "bg-gold text-midnight";

  const content = (
    <p className="text-sm font-medium text-center py-2 px-4">
      {settings.bannerText}
    </p>
  );

  return (
    <div className={`${colorClass} relative z-50`}>
      {settings.bannerUrl ? (
        <a
          href={settings.bannerUrl}
          className="block hover:opacity-90 transition-opacity"
        >
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}
