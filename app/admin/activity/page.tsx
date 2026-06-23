"use client";

import { useState, useCallback } from "react";
import { useFetch } from "@/lib/hooks";
import { AdminPageHeader, EmptyState } from "@/components/ui";

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  entityType: string | null;
  entityId: string | null;
  metadata: string;
  adminEmail: string;
  createdAt: string;
}

interface ActivityResponse {
  logs: ActivityLog[];
  total: number;
  page: number;
  limit: number;
}

const ACTION_COLORS: Record<string, string> = {
  create: "text-green-400 bg-green-400/10",
  update: "text-yellow-400 bg-yellow-400/10",
  delete: "text-red-400 bg-red-400/10",
  approve: "text-blue-400 bg-blue-400/10",
  reject: "text-red-400 bg-red-400/10",
  login: "text-purple-400 bg-purple-400/10",
  send: "text-blue-400 bg-blue-400/10",
};

function actionBadge(action: string) {
  const cls = ACTION_COLORS[action.toLowerCase()] || "text-ivory/60 bg-ivory/10";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${cls}`}>
      {action}
    </span>
  );
}

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function ActivityLogPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams({ page: String(page) });
    if (actionFilter) params.set("action", actionFilter);
    if (entityFilter) params.set("entityType", entityFilter);
    return `/api/v1/admin/activity?${params}`;
  }, [page, actionFilter, entityFilter]);

  const { data: result, loading } = useFetch<ActivityResponse | null>(buildUrl(), null, (json) => json);
  const logs = result?.logs ?? [];
  const total = result?.total ?? 0;
  const totalPages = Math.ceil(total / (result?.limit ?? 50));

  const ACTION_OPTIONS = ["create", "update", "delete", "approve", "reject", "login", "send"];
  const ENTITY_OPTIONS = ["guest", "photo", "guestbook", "song", "registry", "settings", "feature", "wedding-party", "communication"];

  return (
    <div>
      <AdminPageHeader
        title="Activity Log"
        subtitle={`${total} events recorded`}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="input-celestial text-sm py-2"
        >
          <option value="">All Actions</option>
          {ACTION_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select
          value={entityFilter}
          onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
          className="input-celestial text-sm py-2"
        >
          <option value="">All Entities</option>
          {ENTITY_OPTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        {(actionFilter || entityFilter) && (
          <button
            onClick={() => { setActionFilter(""); setEntityFilter(""); setPage(1); }}
            className="text-ivory/40 hover:text-ivory text-sm px-3 py-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Log entries */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-14 bg-royal/10 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          title="No activity logged yet"
          subtitle="Actions taken in the admin panel will appear here."
          icon="📋"
        />
      ) : (
        <div className="space-y-1">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-4 bg-royal/10 border border-gold/5 rounded-lg px-4 py-3 hover:border-gold/20 transition-colors"
            >
              <div className="flex-shrink-0 pt-0.5">{actionBadge(log.action)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-ivory text-sm">{log.description}</p>
                {log.entityType && (
                  <p className="text-ivory/40 text-xs mt-0.5">
                    {log.entityType}{log.entityId ? ` · ${log.entityId.slice(0, 8)}` : ""}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-ivory/40 text-xs">{relativeTime(log.createdAt)}</p>
                {log.adminEmail && <p className="text-ivory/20 text-xs">{log.adminEmail}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="btn-outline text-sm px-4 py-2 disabled:opacity-30"
          >
            ← Prev
          </button>
          <span className="text-ivory/50 text-sm">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="btn-outline text-sm px-4 py-2 disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
