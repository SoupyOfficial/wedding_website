"use client";

import { useState, useEffect, useCallback } from "react";

interface WeddingPartyMember {
  id: string;
  name: string;
  role: string;
  side: string;
  bio: string | null;
  photoUrl: string | null;
  relationToCouple: string | null;
  sortOrder: number;
}

export default function AdminWeddingPartyPage() {
  const [members, setMembers] = useState<WeddingPartyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newSide, setNewSide] = useState("bride");
  const [newBio, setNewBio] = useState("");
  const [newRelation, setNewRelation] = useState("");

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/wedding-party");
      const data = await res.json();
      if (data.data) setMembers(data.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      await fetch("/api/v1/admin/wedding-party", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          role: newRole,
          side: newSide,
          bio: newBio || undefined,
          relationToCouple: newRelation || undefined,
          sortOrder: members.filter((m) => m.side === newSide).length,
        }),
      });
      setShowAdd(false);
      setNewName("");
      setNewRole("");
      setNewBio("");
      setNewRelation("");
      fetchMembers();
    } catch {
      // silently fail
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this member?")) return;
    try {
      await fetch(`/api/v1/admin/wedding-party/${id}`, { method: "DELETE" });
      fetchMembers();
    } catch {
      // silently fail
    }
  }

  const bridesmaids = members.filter((m) => m.side === "bride");
  const groomsmen = members.filter((m) => m.side === "groom");
  const special = members.filter((m) => m.side === "special");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gold font-serif text-3xl mb-1">Wedding Party</h1>
          <p className="text-ivory/50 text-sm">{members.length} members</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-gold px-4 py-2 text-sm">
          + Add Member
        </button>
      </div>

      {showAdd && (
        <div className="bg-royal/20 border border-gold/10 rounded-lg p-6 mb-6">
          <h3 className="text-gold font-serif text-lg mb-4">Add Member</h3>
          <form onSubmit={handleAdd} className="grid md:grid-cols-2 gap-4">
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="input-celestial" placeholder="Name" required />
            <input type="text" value={newRole} onChange={(e) => setNewRole(e.target.value)} className="input-celestial" placeholder="Role (e.g., Bridesmaid)" required />
            <select value={newSide} onChange={(e) => setNewSide(e.target.value)} className="input-celestial">
              <option value="bride">Bride&apos;s Side</option>
              <option value="groom">Groom&apos;s Side</option>
              <option value="special">Special</option>
            </select>
            <input type="text" value={newRelation} onChange={(e) => setNewRelation(e.target.value)} className="input-celestial" placeholder="Relation (e.g., Sister of the Bride)" />
            <textarea value={newBio} onChange={(e) => setNewBio(e.target.value)} className="input-celestial md:col-span-2 h-20 resize-none" placeholder="Bio (optional)" />
            <div className="md:col-span-2 flex gap-2 justify-end">
              <button type="button" onClick={() => setShowAdd(false)} className="btn-outline px-4 py-2 text-sm">Cancel</button>
              <button type="submit" className="btn-gold px-4 py-2 text-sm">Add Member</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-ivory/40">Loading...</div>
      ) : (
        <div className="space-y-8">
          {[
            { title: "Bride's Side", items: bridesmaids },
            { title: "Groom's Side", items: groomsmen },
            { title: "Special Members", items: special },
          ].map(({ title, items }) =>
            items.length > 0 ? (
              <div key={title}>
                <h3 className="text-gold font-serif text-lg mb-3">{title}</h3>
                <div className="space-y-2">
                  {items.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between bg-royal/20 border border-gold/10 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-royal/50 border border-gold/20 flex items-center justify-center text-sm">
                          {member.photoUrl ? (
                            <img src={member.photoUrl} alt={member.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            "✨"
                          )}
                        </div>
                        <div>
                          <p className="text-ivory font-medium">{member.name}</p>
                          <p className="text-ivory/40 text-xs">
                            {member.role}
                            {member.relationToCouple && ` • ${member.relationToCouple}`}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(member.id)} className="text-red-400/60 hover:text-red-400 text-xs">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
