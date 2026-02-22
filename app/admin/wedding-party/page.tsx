"use client";

import { useState } from "react";
import { useAdminFetch } from "@/lib/hooks";
import { AdminPageHeader, Modal, LoadingState, EmptyState } from "@/components/ui";

interface WeddingPartyMember {
  id: string;
  name: string;
  role: string;
  side: string;
  bio: string;
  photoUrl: string | null;
  relationToBrideOrGroom: string;
  spouseOrPartner: string;
  sortOrder: number;
}

const EMPTY_MEMBER: Omit<WeddingPartyMember, "id"> = {
  name: "",
  role: "",
  side: "bride",
  bio: "",
  photoUrl: null,
  relationToBrideOrGroom: "",
  spouseOrPartner: "",
  sortOrder: 0,
};

export default function AdminWeddingPartyPage() {
  const { data: members, loading, refetch } = useAdminFetch<WeddingPartyMember>("/api/v1/admin/wedding-party");
  const [editing, setEditing] = useState<WeddingPartyMember | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  function openNew() {
    setEditing({ id: "", ...EMPTY_MEMBER, sortOrder: members.length } as WeddingPartyMember);
    setIsNew(true);
  }

  function openEdit(m: WeddingPartyMember) {
    setEditing({ ...m });
    setIsNew(false);
  }

  function closeEditor() {
    setEditing(null);
    setIsNew(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const url = isNew ? "/api/v1/admin/wedding-party" : `/api/v1/admin/wedding-party/${editing.id}`;
      const method = isNew ? "POST" : "PUT";
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editing.name,
          role: editing.role,
          side: editing.side,
          bio: editing.bio || undefined,
          photoUrl: editing.photoUrl || undefined,
          relationToBrideOrGroom: editing.relationToBrideOrGroom || undefined,
          spouseOrPartner: editing.spouseOrPartner || undefined,
          sortOrder: editing.sortOrder,
        }),
      });
      closeEditor();
      refetch();
    } catch { /* silently fail */ } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this member?")) return;
    try {
      await fetch(`/api/v1/admin/wedding-party/${id}`, { method: "DELETE" });
      if (editing?.id === id) closeEditor();
      refetch();
    } catch { /* silently fail */ }
  }

  const bridesmaids = members.filter((m) => m.side === "bride");
  const groomsmen = members.filter((m) => m.side === "groom");
  const special = members.filter((m) => m.side === "special");

  const ROLE_SUGGESTIONS = [
    "Maid of Honor",
    "Matron of Honor",
    "Bridesmaid",
    "Best Man",
    "Groomsman",
    "Man of Honor",
    "Flower Girl",
    "Ring Bearer",
    "Junior Bridesmaid",
    "Junior Groomsman",
    "Officiant",
    "Usher",
    "Reader",
    "Singer",
  ];

  return (
    <div>
      <AdminPageHeader
        title="Wedding Party"
        subtitle={`${members.length} members`}
        actions={<button onClick={openNew} className="btn-gold px-4 py-2 text-sm">+ Add Member</button>}
      />

      {loading ? (
        <LoadingState />
      ) : (
        <div className="space-y-8">
          {[
            { title: "Bride\u2019s Side", items: bridesmaids },
            { title: "Groom\u2019s Side", items: groomsmen },
            { title: "Special Members", items: special },
          ].map(({ title, items }) =>
            items.length > 0 ? (
              <div key={title}>
                <h3 className="text-gold font-serif text-lg mb-3">{title}</h3>
                <div className="space-y-2">
                  {items.map((member) => (
                    <div key={member.id} className="flex items-center justify-between bg-royal/20 border border-gold/10 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-royal/50 border border-gold/20 flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
                          {member.photoUrl ? (
                            <img src={member.photoUrl} alt={member.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            "\u2728"
                          )}
                        </div>
                        <div>
                          <p className="text-ivory font-medium">{member.name}</p>
                          <p className="text-ivory/40 text-xs">
                            {member.role}
                            {member.relationToBrideOrGroom && ` \u2022 ${member.relationToBrideOrGroom}`}
                            {member.bio && " \u2022 Has bio"}
                            {member.photoUrl && " \u2022 Has photo"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(member)} className="text-gold/60 hover:text-gold text-xs transition-colors">Edit</button>
                        <button onClick={() => handleDelete(member.id)} className="text-red-400/60 hover:text-red-400 text-xs transition-colors">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          )}
          {members.length === 0 && <EmptyState title="No wedding party members yet" />}
        </div>
      )}

      {/* Edit / Add Modal */}
      {editing && (
        <Modal title={isNew ? "Add Member" : `Edit: ${editing.name}`} onClose={closeEditor} maxWidth="max-w-lg">
            <form onSubmit={handleSave} className="space-y-4">
              {/* Photo preview */}
              {editing.photoUrl && (
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full border-2 border-gold/30 overflow-hidden">
                    <img src={editing.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Name *</label>
                  <input type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="input-celestial w-full" required />
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Role *</label>
                  <input type="text" value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} className="input-celestial w-full" placeholder="e.g., Bridesmaid, Flower Girl" required list="role-suggestions" />
                  <datalist id="role-suggestions">
                    {ROLE_SUGGESTIONS.map((r) => (
                      <option key={r} value={r} />
                    ))}
                  </datalist>
                  <p className="text-ivory/30 text-[10px] mt-1">
                    Tip: &quot;Flower Girl&quot; and &quot;Ring Bearer&quot; roles are automatically grouped into their own section.
                  </p>
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Side</label>
                  <select value={editing.side} onChange={(e) => setEditing({ ...editing, side: e.target.value })} className="input-celestial w-full">
                    <option value="bride">Bride&apos;s Side</option>
                    <option value="groom">Groom&apos;s Side</option>
                    <option value="special">Special</option>
                  </select>
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Relation</label>
                  <input type="text" value={editing.relationToBrideOrGroom} onChange={(e) => setEditing({ ...editing, relationToBrideOrGroom: e.target.value })} className="input-celestial w-full" placeholder="e.g., Sister of the Bride" />
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Spouse / Partner</label>
                  <input type="text" value={editing.spouseOrPartner} onChange={(e) => setEditing({ ...editing, spouseOrPartner: e.target.value })} className="input-celestial w-full" />
                </div>
                <div>
                  <label className="block text-ivory/70 text-xs mb-1">Photo URL</label>
                  <input type="url" value={editing.photoUrl || ""} onChange={(e) => setEditing({ ...editing, photoUrl: e.target.value || null })} className="input-celestial w-full" placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className="block text-ivory/70 text-xs mb-1">Bio</label>
                <textarea value={editing.bio} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} className="input-celestial w-full h-24 resize-none" placeholder="A brief bio about this person — their relationship to the couple, a fun fact, etc." />
                <p className="text-ivory/30 text-[10px] mt-1">{editing.bio.length}/300 characters recommended</p>
              </div>
              <div>
                <label className="block text-ivory/70 text-xs mb-1">Sort Order</label>
                <input type="number" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: parseInt(e.target.value) || 0 })} className="input-celestial w-24" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={closeEditor} className="btn-outline px-4 py-2 text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="btn-gold px-4 py-2 text-sm">{saving ? "Saving..." : isNew ? "Add Member" : "Save Changes"}</button>
              </div>
            </form>
        </Modal>
      )}
    </div>
  );
}
