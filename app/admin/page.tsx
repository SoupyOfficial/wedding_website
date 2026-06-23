import { queryOne, query } from "@/lib/db";
import { getSettings } from "@/lib/services/settings.service";
import Link from "next/link";
import { AdminPageHeader } from "@/components/ui";
import DashboardCharts from "@/components/admin/DashboardCharts";

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
    mealBreakdown,
    rsvpTrend,
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
    query<{ mealPreference: string | null; cnt: number }>(
      "SELECT mealPreference, COUNT(*) as cnt FROM Guest WHERE rsvpStatus = 'attending' AND mealPreference IS NOT NULL GROUP BY mealPreference ORDER BY cnt DESC"
    ),
    query<{ responded_date: string; cnt: number }>(
      "SELECT date(rsvpRespondedAt) as responded_date, COUNT(*) as cnt FROM Guest WHERE rsvpRespondedAt IS NOT NULL GROUP BY date(rsvpRespondedAt) ORDER BY responded_date ASC"
    ),
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

  // Build meal chart data
  const mealData = mealBreakdown.map((r) => ({
    name: r.mealPreference || "Unspecified",
    count: r.cnt,
  }));

  // Build cumulative RSVP trend
  let cumulative = 0;
  const trendData = rsvpTrend.map((r) => {
    cumulative += r.cnt;
    const d = new Date(r.responded_date);
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      cumulative,
    };
  });

  // Dietary needs breakdown from attending guests
  const dietaryRows = await query<{ dietaryNeeds: string; cnt: number }>(
    "SELECT dietaryNeeds, COUNT(*) as cnt FROM Guest WHERE rsvpStatus = 'attending' AND dietaryNeeds IS NOT NULL AND dietaryNeeds != '' GROUP BY dietaryNeeds ORDER BY cnt DESC LIMIT 6"
  );
  const dietaryData = dietaryRows.map((r) => ({
    name: r.dietaryNeeds.length > 12 ? r.dietaryNeeds.slice(0, 12) + "…" : r.dietaryNeeds,
    count: r.cnt,
  }));

  const settings = await getSettings("weddingDate", "rsvpDeadline");

  const weddingDate = settings?.weddingDate ? new Date(settings.weddingDate) : null;
  const rsvpDeadline = settings?.rsvpDeadline ? new Date(settings.rsvpDeadline) : null;
  const daysUntilWedding = weddingDate
    ? Math.ceil((weddingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const daysUntilDeadline = rsvpDeadline
    ? Math.ceil((rsvpDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const responseRate = totalGuests > 0 ? Math.round(((rsvpYes + rsvpNo) / totalGuests) * 100) : 0;

  const stats = [
    { label: "Total Guests", value: totalGuests, icon: "👥", href: "/admin/guests" },
    { label: "Attending", value: rsvpYes, icon: "✅", color: "text-green-400", href: "/admin/guests" },
    { label: "Declined", value: rsvpNo, icon: "❌", color: "text-red-400", href: "/admin/guests" },
    { label: "Pending RSVP", value: rsvpPending, icon: "⏳", color: "text-yellow-400", href: "/admin/guests" },
  ];

  const actions = [
    { label: "Photos", sublabel: `${pendingPhotos} pending approval`, icon: "📸", href: "/admin/photos", urgent: pendingPhotos > 0 },
    { label: "Guest Book", sublabel: `${pendingGuestBook} pending`, icon: "📖", href: "/admin/guest-book", urgent: pendingGuestBook > 0 },
    { label: "Messages", sublabel: `${unreadMessages} unread`, icon: "✉️", href: "/admin/communications", urgent: unreadMessages > 0 },
    { label: "Song Requests", sublabel: `${songRequests} total`, icon: "🎵", href: "/admin/music", urgent: false },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        subtitle={
          daysUntilWedding !== null
            ? daysUntilWedding > 0
              ? `${daysUntilWedding} days until the wedding! 🌙`
              : daysUntilWedding === 0
              ? "Today is the day! 🎉"
              : "The wedding has passed. ✨"
            : undefined
        }
      />

      {/* Countdown cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {daysUntilWedding !== null && (
          <div className="bg-royal/20 border border-gold/10 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-gold font-serif">{Math.max(0, daysUntilWedding)}</p>
            <p className="text-ivory/50 text-xs mt-1">Days Until Wedding</p>
          </div>
        )}
        {daysUntilDeadline !== null && (
          <div className={`bg-royal/20 border rounded-lg p-4 text-center ${daysUntilDeadline < 7 && daysUntilDeadline > 0 ? "border-yellow-500/40" : "border-gold/10"}`}>
            <p className={`text-3xl font-bold font-serif ${daysUntilDeadline < 7 && daysUntilDeadline > 0 ? "text-yellow-400" : daysUntilDeadline <= 0 ? "text-red-400" : "text-gold"}`}>
              {daysUntilDeadline <= 0 ? "Passed" : daysUntilDeadline}
            </p>
            <p className="text-ivory/50 text-xs mt-1">Days Until RSVP Deadline</p>
          </div>
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
              <span className={`text-3xl font-bold ${stat.color || "text-ivory"}`}>{stat.value}</span>
            </div>
            <p className="text-ivory/50 text-sm">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* RSVP Progress Bar */}
      <div className="bg-royal/20 border border-gold/10 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gold font-serif text-lg">RSVP Progress</h3>
          <span className="text-gold font-bold text-lg">{responseRate}%</span>
        </div>
        <div className="w-full bg-midnight rounded-full h-4 overflow-hidden">
          <div className="h-full flex">
            <div className="bg-green-500 transition-all duration-500" style={{ width: totalGuests > 0 ? `${(rsvpYes / totalGuests) * 100}%` : "0%" }} />
            <div className="bg-red-500 transition-all duration-500" style={{ width: totalGuests > 0 ? `${(rsvpNo / totalGuests) * 100}%` : "0%" }} />
          </div>
        </div>
        <div className="flex justify-between text-xs text-ivory/40 mt-2">
          <span>{totalGuests > 0 ? `${responseRate}% responded` : "No guests yet"}</span>
          <span>{rsvpYes} yes / {rsvpNo} no / {rsvpPending} pending</span>
        </div>
      </div>

      {/* Charts */}
      <DashboardCharts mealData={mealData} trendData={trendData} dietaryData={dietaryData} />

      {/* Quick Actions */}
      <h3 className="text-gold font-serif text-lg mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={`bg-royal/20 border rounded-lg p-4 hover:border-gold/30 transition-colors ${action.urgent ? "border-gold/30" : "border-gold/10"}`}
          >
            <div className="text-2xl mb-2">{action.icon}</div>
            <p className="text-ivory text-sm font-medium">{action.label}</p>
            <p className={`text-xs mt-1 ${action.urgent ? "text-gold" : "text-ivory/40"}`}>{action.sublabel}</p>
          </Link>
        ))}
      </div>

      {/* Overview */}
      <div className="bg-royal/20 border border-gold/10 rounded-lg p-6">
        <h3 className="text-gold font-serif text-lg mb-4">Overview</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          {[
            ["Total Photos", totalPhotos],
            ["Guest Book Entries", guestBookEntries],
            ["Song Requests", songRequests],
            ["Contact Messages", contactMessages],
          ].map(([label, val]) => (
            <div key={label as string} className="flex justify-between py-2 border-b border-gold/5">
              <span className="text-ivory/50">{label}</span>
              <span className="text-ivory">{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
