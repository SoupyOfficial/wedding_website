"use client";

import { useState } from "react";
import { useAdminFetch } from "@/lib/hooks";
import { AdminPageHeader, Modal, EmptyState, ConfirmButton } from "@/components/ui";

interface BudgetItem { id: string; name: string; estimatedCost: number; actualCost: number | null }

interface Vendor {
  id: string;
  name: string;
  category: string;
  contactName: string;
  phone: string;
  email: string;
  website: string;
  instagram: string;
  contractStatus: string; // none | signed | complete
  depositDueDate: string | null;
  finalPaymentDueDate: string | null;
  totalCost: number | null;
  notes: string;
  budgetItems: BudgetItem[];
}

const VENDOR_CATEGORIES = ["Venue", "Catering", "Photography", "Videography", "Florals", "Music / DJ", "Band", "Attire & Alterations", "Hair & Makeup", "Transportation", "Officiant", "Invitations & Stationery", "Lighting & A/V", "Décor & Rentals", "Bakery / Cake", "Other"];

const CONTRACT_STATUS_MAP: Record<string, { label: string; cls: string }> = {
  none: { label: "No Contract", cls: "text-red-400 bg-red-400/10" },
  signed: { label: "Signed", cls: "text-yellow-400 bg-yellow-400/10" },
  complete: { label: "Complete", cls: "text-green-400 bg-green-400/10" },
};

const EMPTY: Omit<Vendor, "id" | "budgetItems"> = {
  name: "", category: "Venue", contactName: "", phone: "", email: "", website: "", instagram: "",
  contractStatus: "none", depositDueDate: null, finalPaymentDueDate: null, totalCost: null, notes: "",
};

const fmt = (n: number | null | undefined) =>
  n != null ? `$${n.toLocaleString("en-US", { minimumFractionDigits: 0 })}` : "—";

export default function VendorsPage() {
  const { data: vendors, loading, refetch } = useAdminFetch<Vendor>("/api/v1/admin/vendors");
  const [editing, setEditing] = useState<(Vendor & { _isNew?: boolean }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = vendors.filter((v) =>
    !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.category.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const isNew = editing._isNew;
    await fetch(isNew ? "/api/v1/admin/vendors" : `/api/v1/admin/vendors/${editing.id}`, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    setSaving(false);
    setEditing(null);
    refetch();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/v1/admin/vendors/${id}`, { method: "DELETE" });
    refetch();
  }

  const stats = {
    total: vendors.length,
    signed: vendors.filter((v) => v.contractStatus === "signed" || v.contractStatus === "complete").length,
    complete: vendors.filter((v) => v.contractStatus === "complete").length,
    totalCost: vendors.reduce((s, v) => s + (v.totalCost ?? 0), 0),
  };

  return (
    <div>
      <AdminPageHeader
        title="Vendor Manager"
        subtitle={`${stats.total} vendors · ${stats.signed} contracted · ${fmt(stats.totalCost)} total`}
        actions={
          <button
            onClick={() => setEditing({ id: "", ...EMPTY, budgetItems: [], _isNew: true })}
            className="btn-gold px-4 py-2 text-sm"
          >
            + Add Vendor
          </button>
        }
      />

      {/* Search */}
      <div className="mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-celestial w-full max-w-sm text-sm"
          placeholder="Search vendors..."
        />
      </div>

      {/* Vendor list */}
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-royal/10 rounded-lg animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No vendors yet" subtitle="Add your first vendor to keep track of contracts and contacts." icon="🤝" />
      ) : (
        <div className="space-y-2">
          {filtered.map((v) => {
            const status = CONTRACT_STATUS_MAP[v.contractStatus] ?? CONTRACT_STATUS_MAP.none;
            return (
              <div key={v.id} className="bg-royal/10 border border-gold/10 rounded-lg px-4 py-3 hover:border-gold/20 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-ivory font-medium">{v.name}</p>
                      <span className="text-ivory/30 text-xs">·</span>
                      <p className="text-ivory/50 text-xs">{v.category}</p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-ivory/40">
                      {v.contactName && <span>👤 {v.contactName}</span>}
                      {v.phone && <a href={`tel:${v.phone}`} className="hover:text-gold">📞 {v.phone}</a>}
                      {v.email && <a href={`mailto:${v.email}`} className="hover:text-gold">✉️ {v.email}</a>}
                      {v.website && <a href={v.website} target="_blank" rel="noopener noreferrer" className="hover:text-gold">🌐 Website</a>}
                      {v.instagram && <a href={`https://instagram.com/${v.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="hover:text-gold">📸 {v.instagram}</a>}
                    </div>
                    {v.budgetItems.length > 0 && (
                      <p className="text-ivory/30 text-xs mt-1">
                        Linked to: {v.budgetItems.map((b) => b.name || "Budget item").join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right space-y-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${status.cls}`}>{status.label}</span>
                    {v.totalCost != null && <p className="text-ivory/60 text-xs">{fmt(v.totalCost)}</p>}
                    {v.depositDueDate && (
                      <p className={`text-xs ${new Date(v.depositDueDate) < new Date() ? "text-red-400" : "text-ivory/30"}`}>
                        Deposit due {new Date(v.depositDueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setEditing({ ...v })} className="text-ivory/40 hover:text-gold text-xs px-2 py-1">Edit</button>
                    <ConfirmButton onConfirm={() => handleDelete(v.id)} message="Delete this vendor?" className="text-red-400/40 hover:text-red-400 text-xs px-2 py-1">Del</ConfirmButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {!!editing && <Modal onClose={() => setEditing(null)} title={editing?._isNew ? "Add Vendor" : "Edit Vendor"}>
        {editing && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-ivory/60 text-xs block mb-1">Vendor Name *</label>
                <input required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="input-celestial w-full text-sm" placeholder="e.g. The Highland Manor" />
              </div>
              <div>
                <label className="text-ivory/60 text-xs block mb-1">Category</label>
                <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="input-celestial w-full text-sm">
                  {VENDOR_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-ivory/60 text-xs block mb-1">Contact Name</label>
                <input value={editing.contactName} onChange={(e) => setEditing({ ...editing, contactName: e.target.value })} className="input-celestial w-full text-sm" />
              </div>
              <div>
                <label className="text-ivory/60 text-xs block mb-1">Phone</label>
                <input type="tel" value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} className="input-celestial w-full text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-ivory/60 text-xs block mb-1">Email</label>
                <input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} className="input-celestial w-full text-sm" />
              </div>
              <div>
                <label className="text-ivory/60 text-xs block mb-1">Website</label>
                <input type="url" value={editing.website} onChange={(e) => setEditing({ ...editing, website: e.target.value })} className="input-celestial w-full text-sm" placeholder="https://" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-ivory/60 text-xs block mb-1">Instagram</label>
                <input value={editing.instagram} onChange={(e) => setEditing({ ...editing, instagram: e.target.value })} className="input-celestial w-full text-sm" placeholder="@handle" />
              </div>
              <div>
                <label className="text-ivory/60 text-xs block mb-1">Total Cost ($)</label>
                <input type="number" step="0.01" value={editing.totalCost ?? ""} onChange={(e) => setEditing({ ...editing, totalCost: e.target.value ? parseFloat(e.target.value) : null })} className="input-celestial w-full text-sm" />
              </div>
            </div>
            <div>
              <label className="text-ivory/60 text-xs block mb-1">Contract Status</label>
              <select value={editing.contractStatus} onChange={(e) => setEditing({ ...editing, contractStatus: e.target.value })} className="input-celestial w-full text-sm">
                <option value="none">No Contract</option>
                <option value="signed">Signed</option>
                <option value="complete">Complete</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-ivory/60 text-xs block mb-1">Deposit Due</label>
                <input type="date" value={editing.depositDueDate?.slice(0, 10) ?? ""} onChange={(e) => setEditing({ ...editing, depositDueDate: e.target.value || null })} className="input-celestial w-full text-sm" />
              </div>
              <div>
                <label className="text-ivory/60 text-xs block mb-1">Final Payment Due</label>
                <input type="date" value={editing.finalPaymentDueDate?.slice(0, 10) ?? ""} onChange={(e) => setEditing({ ...editing, finalPaymentDueDate: e.target.value || null })} className="input-celestial w-full text-sm" />
              </div>
            </div>
            <div>
              <label className="text-ivory/60 text-xs block mb-1">Notes</label>
              <textarea value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} className="input-celestial w-full text-sm" rows={2} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-gold px-6 py-2 text-sm flex-1">
                {saving ? "Saving…" : editing._isNew ? "Add Vendor" : "Save Changes"}
              </button>
              <button type="button" onClick={() => setEditing(null)} className="btn-outline px-4 py-2 text-sm">Cancel</button>
            </div>
          </form>
        )}
      </Modal>}
    </div>
  );
}
