import prisma from "@/lib/db";

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
  const settings =
    propSettings ||
    (await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
    }));

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
