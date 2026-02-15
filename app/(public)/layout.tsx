import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import StarrySky from "@/components/StarrySky";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import prisma from "@/lib/db";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });

  return (
    <div className="min-h-screen bg-midnight relative">
      <StarrySky />
      <AnnouncementBanner settings={settings} />
      <Navigation
        weddingDate={settings?.weddingDate?.toISOString() || null}
      />
      <main className="relative z-10">{children}</main>
      <Footer />
    </div>
  );
}
