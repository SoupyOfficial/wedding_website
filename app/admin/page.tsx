import { queryOne } from "@/lib/db";
import Link from "next/link";
import { AdminPageHeader } from "@/components/ui";

export const metadata = {
  title: "Admin Dashboard | Forever Campbells",
};

export default async function AdminDashboard() {
  const cnt = (r: { cnt: number } | null) => r?.cnt ?? 0;

  const [totalPhotosR, pendingPhotosR, approvedPhotosR] = await Promise.all([
    queryOne<{ cnt: number }>("SELECT COUNT(*) as cnt FROM Photo"),
    queryOne<{ cnt: number }>("SELECT COUNT(*) as cnt FROM Photo WHERE approved = 0"),
    queryOne<{ cnt: number }>("SELECT COUNT(*) as cnt FROM Photo WHERE approved = 1"),
  ]);

  const totalPhotos = cnt(totalPhotosR);
  const pendingPhotos = cnt(pendingPhotosR);
  const approvedPhotos = cnt(approvedPhotosR);

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Post-wedding photo approvals at a glance"
      />

      {/* Photo stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link
          href="/admin/photos"
          className="bg-royal/20 border border-gold/10 rounded-lg p-6 hover:border-gold/30 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📸</span>
            <span className="text-3xl font-bold text-ivory">{totalPhotos}</span>
          </div>
          <p className="text-ivory/50 text-sm">Total Photos</p>
        </Link>
        <Link
          href="/admin/photos"
          className="bg-royal/20 border border-yellow-500/40 rounded-lg p-6 hover:border-yellow-500/70 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">⏳</span>
            <span className="text-3xl font-bold text-yellow-400">{pendingPhotos}</span>
          </div>
          <p className="text-ivory/50 text-sm">Pending Approval</p>
        </Link>
        <Link
          href="/admin/photos"
          className="bg-royal/20 border border-gold/10 rounded-lg p-6 hover:border-gold/30 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">✅</span>
            <span className="text-3xl font-bold text-green-400">{approvedPhotos}</span>
          </div>
          <p className="text-ivory/50 text-sm">Approved &amp; Live</p>
        </Link>
      </div>

      {/* Quick action */}
      {pendingPhotos > 0 && (
        <div className="bg-royal/20 border border-gold/10 rounded-lg p-6 text-center">
          <p className="text-ivory/70 mb-4">
            You have {pendingPhotos} photo{pendingPhotos === 1 ? "" : "s"} awaiting approval.
          </p>
          <Link href="/admin/photos" className="btn-gold inline-block px-6 py-2">
            Review Photos
          </Link>
        </div>
      )}
    </div>
  );
}
