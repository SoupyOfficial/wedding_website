"use client";

import { useState } from "react";
import { useAdminFetch } from "@/lib/hooks";
import { AdminPageHeader, Modal, FilterBar, LoadingState, EmptyState, Alert, ConfirmButton } from "@/components/ui";

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  rsvpStatus: string;
  rsvpRespondedAt: string | null;
  plusOneAllowed: boolean;
  plusOneName: string | null;
  plusOneAttending: boolean;
  dietaryNeeds: string | null;
  songRequest: string | null;
  danceSong: string | null;
  firstDanceSong: string | null;
  childrenCount: number;
  childrenNames: string | null;
  tableNumber: number | null;
  notes: string | null;
  inviteToken: string | null;
  createdAt: string;
}

const EMPTY_GUEST: Omit<Guest, "id" | "createdAt" | "rsvpRespondedAt"> = {
  inviteToken: null,
  firstName: "",
  lastName: "",
  email: null,
  phone: null,
  rsvpStatus: "pending",
  plusOneAllowed: false,
  plusOneName: null,
  plusOneAttending: false,
  dietaryNeeds: null,
  songRequest: null,
  danceSong: null,
  firstDanceSong: null,
  childrenCount: 0,
  childrenNames: null,
  tableNumber: null,
  notes: null,
};

/**
 * Renders one guest exactly once. On desktop (lg+) it is a normal table
 * row; on mobile the same row reflows into a celestial card via max-lg
 * utilities, so the guest list is never duplicated in the DOM.
 */
function GuestRow({
  guest,
  copied,
  onCopyInviteLink,
  onEdit,
  onDelete,
}: {
  guest: Guest;
  copied: boolean;
  onCopyInviteLink: (guest: Guest) => void;
  onEdit: (guest: Guest) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <tr className="hover:bg-royal/10 transition-colors max-lg:flex max-lg:flex-wrap max-lg:gap-x-4 max-lg:gap-y-1 max-lg:rounded-xl max-lg:border max-lg:border-gold/20 max-lg:bg-midnight-300/50 max-lg:p-6 max-lg:backdrop-blur-sm max-lg:transition-all max-lg:duration-300 max-lg:hover:border-gold/40 max-lg:hover:bg-transparent">
      {/* Name — card header on mobile, first column on desktop */}
      <td className="px-4 py-3 text-ivory max-lg:order-1 max-lg:flex-1 max-lg:px-0 max-lg:py-0 max-lg:font-medium">
        {guest.firstName} {guest.lastName}
      </td>
      {/* Email — below the name on mobile (hidden when absent), own column on desktop */}
      <td className={`px-4 py-3 text-ivory/60 max-lg:order-3 max-lg:basis-full max-lg:px-0 max-lg:py-0 max-lg:text-xs max-lg:text-ivory/50 ${guest.email ? "" : "max-lg:hidden"}`}>
        {guest.email || "—"}
      </td>
      {/* RSVP status — top-right of the card on mobile, own column on desktop */}
      <td className="px-4 py-3 max-lg:order-2 max-lg:self-start max-lg:px-0 max-lg:py-0">
        <span className={`text-xs px-2 py-1 rounded flex-shrink-0 ${guest.rsvpStatus === "attending" ? "text-green-400 bg-green-900/30" : guest.rsvpStatus === "declined" ? "text-red-400 bg-red-900/30" : "text-yellow-400 bg-yellow-900/30"}`}>
          {guest.rsvpStatus.charAt(0).toUpperCase() + guest.rsvpStatus.slice(1)}
        </span>
      </td>
      {/* Plus one — labeled on mobile, plain column on desktop */}
      <td className="px-4 py-3 text-ivory/50 max-lg:order-5 max-lg:mt-1 max-lg:px-0 max-lg:py-0 max-lg:text-xs">
        <span className="lg:hidden">Plus One: </span>
        {guest.plusOneAllowed ? guest.plusOneName || "Allowed" : "—"}
      </td>
      {/* Table number — labeled on mobile, plain column on desktop */}
      <td className={`px-4 py-3 text-ivory/50 max-lg:order-6 max-lg:mt-1 max-lg:px-0 max-lg:py-0 max-lg:text-xs ${guest.tableNumber ? "" : "max-lg:hidden"}`}>
        {guest.tableNumber ? (
          <>
            <span className="lg:hidden">Table: </span>
            {guest.tableNumber}
          </>
        ) : (
          "—"
        )}
      </td>
      {/* Actions — card footer on mobile, right-aligned column on desktop */}
      <td className="px-4 py-3 text-right space-x-2 max-lg:order-7 max-lg:mt-2 max-lg:basis-full max-lg:px-0 max-lg:py-0 max-lg:pt-2 max-lg:text-left max-lg:space-x-0 max-lg:flex max-lg:gap-3 max-lg:border-t max-lg:border-gold/10">
        {guest.inviteToken && (
          <button
            onClick={() => onCopyInviteLink(guest)}
            className="text-ivory/30 hover:text-gold text-xs transition-colors hidden lg:inline"
            title="Copy invite link"
          >
            {copied ? "✓ Copied" : "🔗"}
          </button>
        )}
        <button onClick={() => onEdit(guest)} className="text-gold/60 hover:text-gold text-xs transition-colors">Edit</button>
        <ConfirmButton onConfirm={() => onDelete(guest.id)} message="Are you sure you want to remove this guest?" className="text-red-400/60 hover:text-red-400 text-xs transition-colors">Remove</ConfirmButton>
      </td>
    </tr>
  );
}

export default function AdminGuestsPage() {
  const { data: guests, loading, refetch } = useAdminFetch<Guest>("/api/v1/admin/guests");
  const [filter, setFilter] = useState<"all" | "attending" | "declined" | "pending">("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Guest | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generatingTokens, setGeneratingTokens] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<{ name: string; reason: string } | null>(null);
  const [bypassDuplicate, setBypassDuplicate] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [reminderResult, setReminderResult] = useState<{ sent?: number; errors?: string[] } | null>(null);

  async function sendReminderEmails() {
    setSendingReminder(true);
    setReminderResult(null);
    try {
      const res = await fetch("/api/v1/admin/guests/send-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setReminderResult(data);
      setTimeout(() => setReminderResult(null), 5000);
    } finally {
      setSendingReminder(false);
    }
  }

  async function generateAllTokens() {
    setGeneratingTokens(true);
    try {
      await fetch("/api/v1/admin/guests/generate-tokens", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      refetch();
    } finally {
      setGeneratingTokens(false);
    }
  }

  function copyInviteLink(guest: Guest) {
    if (!guest.inviteToken) return;
    const url = `${window.location.origin}/?invite=${guest.inviteToken}`;
    navigator.clipboard.writeText(url);
    setCopiedId(guest.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function openNew() {
    setEditing({ id: "", createdAt: "", rsvpRespondedAt: null, ...EMPTY_GUEST } as Guest);
    setIsNew(true);
    setFormError("");
    setDuplicateWarning(null);
    setBypassDuplicate(false);
  }

  function openEdit(g: Guest) {
    setEditing({ ...g });
    setIsNew(false);
    setFormError("");
  }

  function closeEditor() {
    setEditing(null);
    setIsNew(false);
    setFormError("");
  }

  function setField<K extends keyof Guest>(key: K, val: Guest[K]) {
    setEditing((prev) => (prev ? { ...prev, [key]: val } : prev));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;

    // Duplicate check on new guest creation
    if (isNew && !bypassDuplicate) {
      const dupRes = await fetch("/api/v1/admin/guests/check-duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: editing.firstName, lastName: editing.lastName, email: editing.email }),
      });
      const dupData = await dupRes.json();
      if (dupData.duplicates?.length > 0) {
        const dup = dupData.duplicates[0];
        setDuplicateWarning({
          name: dup.existingName,
          reason: dup.matchReason === "exact_email" ? "same email address" : "same name",
        });
        return;
      }
    }

    setSaving(true);
    setFormError("");

    try {
      const url = isNew ? "/api/v1/admin/guests" : `/api/v1/admin/guests/${editing.id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: editing.firstName,
          lastName: editing.lastName,
          email: editing.email || undefined,
          phone: editing.phone || undefined,
          rsvpStatus: editing.rsvpStatus,
          plusOneAllowed: editing.plusOneAllowed,
          plusOneName: editing.plusOneName || undefined,
          plusOneAttending: editing.plusOneAttending,
          dietaryNeeds: editing.dietaryNeeds || undefined,
          songRequest: editing.songRequest || undefined,
          danceSong: editing.danceSong || undefined,
          firstDanceSong: editing.firstDanceSong || undefined,
          childrenCount: editing.childrenCount,
          childrenNames: editing.childrenNames || undefined,
          tableNumber: editing.tableNumber || undefined,
          notes: editing.notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setFormError(data.error || "Failed to save.");
        return;
      }

      closeEditor();
      refetch();
    } catch {
      setFormError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/v1/admin/guests/${id}`, { method: "DELETE" });
      if (editing?.id === id) closeEditor();
      refetch();
    } catch {
      /* silently fail */
    }
  }

  const filteredGuests = guests.filter((g) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "attending" && g.rsvpStatus === "attending") ||
      (filter === "declined" && g.rsvpStatus === "declined") ||
      (filter === "pending" && g.rsvpStatus === "pending");
    const matchesSearch =
      !search ||
      `${g.firstName} ${g.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      g.email?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const attendingCount = guests.filter((g) => g.rsvpStatus === "attending").length;
  const declinedCount = guests.filter((g) => g.rsvpStatus === "declined").length;
  const pendingCount = guests.filter((g) => g.rsvpStatus === "pending").length;

  return (
    <div>
      <AdminPageHeader
        title="Guest Manager"
        subtitle={`${guests.length} guests \u2022 ${attendingCount} attending \u2022 ${declinedCount} declined \u2022 ${pendingCount} pending`}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={generateAllTokens}
              disabled={generatingTokens}
              className="btn-outline px-4 py-2 text-sm"
              title="Generate invite link tokens for all guests"
            >
              {generatingTokens ? "Generating\u2026" : "\ud83d\udd17 Generate Invite Links"}
            </button>
            <a
              href={`/api/v1/admin/guests/export${filter !== "all" ? `?status=${filter}` : ""}`}
              download
              className="btn-outline px-4 py-2 text-sm"
              title="Export visible guest list as CSV"
            >
              \u2b07\ufe0f Export CSV
            </a>
            <button
              onClick={sendReminderEmails}
              disabled={sendingReminder}
              className="btn-outline px-4 py-2 text-sm disabled:opacity-50"
              title="Send RSVP reminder to all pending guests with email"
            >
              {sendingReminder ? "Sending…" : "📧 Send Reminder"}
            </button>
            <button onClick={openNew} className="btn-gold px-4 py-2 text-sm">+ Add Guest</button>
          </div>
        }
      />

      {/* Reminder feedback */}
      {reminderResult && (
        <div className={`mb-4 p-3 rounded text-sm ${reminderResult.errors?.length ? "bg-red-500/10 border border-red-500/20 text-red-300" : "bg-green-500/10 border border-green-500/20 text-green-300"}`}>
          ✅ Reminder sent to {reminderResult.sent} guest{reminderResult.sent !== 1 ? "s" : ""}.
          {reminderResult.errors && reminderResult.errors.length > 0 && ` ${reminderResult.errors.length} failed.`}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-celestial flex-1 min-w-[200px]" placeholder="Search guests..." />
        <FilterBar
          filters={[
            { value: "all" as const, label: "All" },
            { value: "attending" as const, label: "Attending" },
            { value: "declined" as const, label: "Declined" },
            { value: "pending" as const, label: "Pending" },
          ]}
          active={filter}
          onChange={setFilter}
          variant="button"
        />
      </div>

      {/* Guest list — each guest renders exactly once; the same row is a
          card on mobile and a table row on desktop (no duplicated subtrees) */}
      {loading ? (
        <LoadingState message="Loading guests..." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gold/10 max-lg:overflow-visible max-lg:rounded-none max-lg:border-0">
          <table className="w-full text-sm max-lg:block">
            <thead className="max-lg:hidden">
              <tr className="bg-royal/30 text-gold/80 text-left text-xs uppercase tracking-wider">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">RSVP</th>
                <th className="px-4 py-3">Plus One</th>
                <th className="px-4 py-3">Table</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/5 max-lg:block max-lg:divide-y-0 max-lg:space-y-3">
              {filteredGuests.map((guest) => (
                <GuestRow
                  key={guest.id}
                  guest={guest}
                  copied={copiedId === guest.id}
                  onCopyInviteLink={copyInviteLink}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
          {filteredGuests.length === 0 && <EmptyState title="No guests found." />}
        </div>
      )}

      {editing && (
        <Modal
          title={isNew ? "Add Guest" : `Edit: ${editing.firstName} ${editing.lastName}`}
          onClose={closeEditor}
          maxWidth="max-w-2xl"
        >
            {formError && <Alert type="error" message={formError} className="mb-3" />}
            {duplicateWarning && !bypassDuplicate && (
              <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm">
                <p className="text-yellow-400 font-medium mb-1">⚠️ Possible duplicate detected</p>
                <p className="text-ivory/70 text-xs mb-2">
                  A guest named <strong>{duplicateWarning.name}</strong> already exists with the {duplicateWarning.reason}.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setBypassDuplicate(true); setDuplicateWarning(null); }}
                    className="text-xs px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30"
                  >
                    Add Anyway
                  </button>
                  <button
                    type="button"
                    onClick={() => setDuplicateWarning(null)}
                    className="text-xs px-3 py-1 text-ivory/40 hover:text-ivory"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">First Name *</label>
                  <input type="text" value={editing.firstName} onChange={(e) => setField("firstName", e.target.value)} className="input-celestial w-full" required />
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Last Name *</label>
                  <input type="text" value={editing.lastName} onChange={(e) => setField("lastName", e.target.value)} className="input-celestial w-full" required />
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Email</label>
                  <input type="email" value={editing.email || ""} onChange={(e) => setField("email", e.target.value || null)} className="input-celestial w-full" />
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Phone</label>
                  <input type="text" value={editing.phone || ""} onChange={(e) => setField("phone", e.target.value || null)} className="input-celestial w-full" />
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">RSVP Status</label>
                  <select value={editing.rsvpStatus} onChange={(e) => setField("rsvpStatus", e.target.value)} className="input-celestial w-full">
                    <option value="pending">Pending</option>
                    <option value="attending">Attending</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Table Number</label>
                  <input type="number" value={editing.tableNumber ?? ""} onChange={(e) => setField("tableNumber", e.target.value ? parseInt(e.target.value) : null)} className="input-celestial w-full" />
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Dietary Needs</label>
                  <input type="text" value={editing.dietaryNeeds || ""} onChange={(e) => setField("dietaryNeeds", e.target.value || null)} className="input-celestial w-full" />
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Song Request</label>
                  <input type="text" value={editing.songRequest || ""} onChange={(e) => setField("songRequest", e.target.value || null)} className="input-celestial w-full" />
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Dance Floor Song</label>
                  <input type="text" value={editing.danceSong || ""} onChange={(e) => setField("danceSong", e.target.value || null)} className="input-celestial w-full" />
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">First Dance Song</label>
                  <input type="text" value={editing.firstDanceSong || ""} onChange={(e) => setField("firstDanceSong", e.target.value || null)} className="input-celestial w-full" />
                </div>
              </div>

              <div className="border-t border-gold/10 pt-4">
                <label className="flex items-center gap-2 text-ivory/70 text-sm mb-3">
                  <input type="checkbox" checked={editing.plusOneAllowed} onChange={(e) => setField("plusOneAllowed", e.target.checked)} className="w-4 h-4" />
                  Allow Plus One
                </label>
                {editing.plusOneAllowed && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-ivory/70 text-xs mb-1">Plus One Name</label>
                      <input type="text" value={editing.plusOneName || ""} onChange={(e) => setField("plusOneName", e.target.value || null)} className="input-celestial w-full" />
                    </div>
                    <label className="flex items-center gap-2 text-ivory/70 text-sm">
                      <input type="checkbox" checked={editing.plusOneAttending} onChange={(e) => setField("plusOneAttending", e.target.checked)} className="w-4 h-4" />
                      Plus One Attending
                    </label>
                  </div>
                )}
              </div>

              <div className="border-t border-gold/10 pt-4 grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Children Count</label>
                  <input type="number" min="0" value={editing.childrenCount} onChange={(e) => setField("childrenCount", parseInt(e.target.value) || 0)} className="input-celestial w-full" />
                </div>
                {editing.childrenCount > 0 && (
                  <div>
                    <label className="block text-ivory/70 text-xs mb-1">Children Names</label>
                    <input type="text" value={editing.childrenNames || ""} onChange={(e) => setField("childrenNames", e.target.value || null)} className="input-celestial w-full" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-ivory/70 text-xs mb-1">Notes</label>
                <textarea value={editing.notes || ""} onChange={(e) => setField("notes", e.target.value || null)} className="input-celestial w-full h-20 resize-none" />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={closeEditor} className="btn-outline px-4 py-2 text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="btn-gold px-4 py-2 text-sm">{saving ? "Saving..." : isNew ? "Add Guest" : "Save Changes"}</button>
              </div>
            </form>
        </Modal>
      )}
    </div>
  );
}
