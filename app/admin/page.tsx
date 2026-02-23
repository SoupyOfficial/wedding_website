import { queryOne, toBool } from "@/lib/db";
import type { SiteSettings } from "@/lib/db-types";
import { SETTINGS_BOOLS } from "@/lib/db-types";
import Link from "next/link";

export const metadata = {
  title: "Admin Dashboard | Forever Campbells",
};

export default async function AdminDashboard() {
  const cnt = (r: { cnt: number } | null) => r?.cnt ?? 0;

  const [
    totalGuestsR,
    rsvpYesR,
    rsvpNoR,
    rsvpPendingR,
    totalPhotosR,
    pendingPhotosR,
    guestBookEntriesR,
    pendingGuestBookR,
    songRequestsR,
    contactMessagesR,
    unreadMessagesR,
  ] = await Promise.all([
    queryOne<{ cnt: number }>("SELECT COUNT(*) as cnt FROM Guest"),
    queryOne<{ cnt: number }>("SELECT COUNT(*) as cnt FROM Guest WHERE rsvpStatus = ?", ["attending"]),
    queryOne<{ cnt: number }>("SELECT COUNT(*) as cnt FROM Guest WHERE rsvpStatus = ?", ["declined"]),
    queryOne<{ cnt: number }>("SELECT COUNT(*) as cnt FROM Guest WHERE rsvpStatus = ?", ["pending"]),
    queryOne<{ cnt: number }>("SELECT COUNT(*) as cnt FROM Photo"),
    queryOne<{ cnt: number }>("SELECT COUNT(*) as cnt FROM Photo WHERE approved = 0"),
    queryOne<{ cnt: number }>("SELECT COUNT(*) as cnt FROM GuestBookEntry"),
    queryOne<{ cnt: number }>("SELECT COUNT(*) as cnt FROM GuestBookEntry WHERE isVisible = 0"),
    queryOne<{ cnt: number }>("SELECT COUNT(*) as cnt FROM SongRequest"),
    queryOne<{ cnt: number }>("SELECT COUNT(*) as cnt FROM ContactMessage"),
    queryOne<{ cnt: number }>("SELECT COUNT(*) as cnt FROM ContactMessage WHERE isRead = 0"),
  ]);

  const totalGuests = cnt(totalGuestsR);
  const rsvpYes = cnt(rsvpYesR);
  const rsvpNo = cnt(rsvpNoR);
  const rsvpPending = cnt(rsvpPendingR);
  const totalPhotos = cnt(totalPhotosR);
  const pendingPhotos = cnt(pendingPhotosR);
  const guestBookEntries = cnt(guestBookEntriesR);
  const pendingGuestBook = cnt(pendingGuestBookR);
  const songRequests = cnt(songRequestsR);
  const contactMessages = cnt(contactMessagesR);
  const unreadMessages = cnt(unreadMessagesR);

  const settings = await queryOne<SiteSettings>("SELECT * FROM SiteSettings WHERE id = ?", ["singleton"]);
  if (settings) toBool(settings, ...SETTINGS_BOOLS);

  const weddingDate = settings?.weddingDate
    ? new Date(settings.weddingDate)
    : null;
  const daysUntil = weddingDate
    ? Math.ceil(
        (weddingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const stats = [
    {
      label: "Total Guests",
      value: totalGuests,
      icon: "👥",
      href: "/admin/guests",
    },
    {
      label: "Attending",
      value: rsvpYes,
      icon: "✅",
      color: "text-green-400",
      href: "/admin/guests",
    },
    {
      label: "Declined",
      value: rsvpNo,
      icon: "❌",
      color: "text-red-400",
      href: "/admin/guests",
    },
    {
      label: "Pending RSVP",
      value: rsvpPending,
      icon: "⏳",
      color: "text-yellow-400",
      href: "/admin/guests",
    },
  ];

  const actions = [
    {
      label: "Photos",
      sublabel: `${pendingPhotos} pending approval`,
      icon: "📸",
      href: "/admin/photos",
      urgent: pendingPhotos > 0,
    },
    {
      label: "Guest Book",
      sublabel: `${pendingGuestBook} pending`,
      icon: "📖",
      href: "/admin/guest-book",
      urgent: pendingGuestBook > 0,
    },
    {
      label: "Messages",
      sublabel: `${unreadMessages} unread`,
      icon: "✉️",
      href: "/admin/communications",
      urgent: unreadMessages > 0,
    },
    {
      label: "Song Requests",
      sublabel: `${songRequests} total`,
      icon: "🎵",
      href: "/admin/music",
      urgent: false,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gold font-serif text-3xl mb-2">Dashboard</h1>
        {daysUntil !== null && (
          <p className="text-ivory/50">
            {daysUntil > 0
              ? `${daysUntil} days until the wedding! 🌙`
              : daysUntil === 0
              ? "Today is the day! 🎉"
              : "The wedding has passed. ✨"}
          </p>
        )}
      </div>

      {/* RSVP Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-royal/20 border border-gold/10 rounded-lg p-4 hover:border-gold/30 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-3xl font-bold ${stat.color || "text-ivory"}`}>
                {stat.value}
              </span>
            </div>
            <p className="text-ivory/50 text-sm">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* RSVP Progress Bar */}
      <div className="bg-royal/20 border border-gold/10 rounded-lg p-6 mb-8">
        <h3 className="text-gold font-serif text-lg mb-4">RSVP Progress</h3>
        <div className="w-full bg-midnight rounded-full h-4 overflow-hidden">
          <div className="h-full flex">
            <div
              className="bg-green-500 transition-all duration-500"
              style={{
                width: totalGuests > 0 ? `${(rsvpYes / totalGuests) * 100}%` : "0%",
              }}
            />
            <div
              className="bg-red-500 transition-all duration-500"
              style={{
                width: totalGuests > 0 ? `${(rsvpNo / totalGuests) * 100}%` : "0%",
              }}
            />
          </div>
        </div>
        <div className="flex justify-between text-xs text-ivory/40 mt-2">
          <span>
            {totalGuests > 0
              ? `${Math.round(((rsvpYes + rsvpNo) / totalGuests) * 100)}% responded`
              : "No guests yet"}
          </span>
          <span>
            {rsvpYes} yes / {rsvpNo} no / {rsvpPending} pending
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <h3 className="text-gold font-serif text-lg mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={`bg-royal/20 border rounded-lg p-4 hover:border-gold/30 transition-colors ${
              action.urgent ? "border-gold/30" : "border-gold/10"
            }`}
          >
            <div className="text-2xl mb-2">{action.icon}</div>
            <p className="text-ivory text-sm font-medium">{action.label}</p>
            <p
              className={`text-xs mt-1 ${
                action.urgent ? "text-gold" : "text-ivory/40"
              }`}
            >
              {action.sublabel}
            </p>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-royal/20 border border-gold/10 rounded-lg p-6">
        <h3 className="text-gold font-serif text-lg mb-4">Overview</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between py-2 border-b border-gold/5">
            <span className="text-ivory/50">Total Photos</span>
            <span className="text-ivory">{totalPhotos}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gold/5">
            <span className="text-ivory/50">Guest Book Entries</span>
            <span className="text-ivory">{guestBookEntries}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gold/5">
            <span className="text-ivory/50">Song Requests</span>
            <span className="text-ivory">{songRequests}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gold/5">
            <span className="text-ivory/50">Contact Messages</span>
            <span className="text-ivory">{contactMessages}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
