import { getSettings } from "@/lib/services/settings.service";
import type { BannerSettings } from "@/lib/types/settings";

interface AnnouncementBannerProps {
  settings?: BannerSettings | null;
}

export default async function AnnouncementBanner({
  settings: propSettings,
}: AnnouncementBannerProps = {}) {
  const settings = propSettings ??
    await getSettings("bannerActive", "bannerText", "bannerUrl", "bannerColor");

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

  const isValidUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const safeUrl = settings.bannerUrl && isValidUrl(settings.bannerUrl) ? settings.bannerUrl : null;

  return (
    <div className={`${colorClass} relative z-50`}>
      {safeUrl ? (
        <a
          href={safeUrl}
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
