"use client";

import { useState, useMemo } from "react";
import { useFetch } from "@/lib/hooks";
import { AdminPageHeader, Modal, EmptyState, ConfirmButton } from "@/components/ui";

interface BudgetItem {
  id: string;
  category: string;
  name: string;
  vendorName: string;
  estimatedCost: number;
  actualCost: number | null;
  depositAmount: number | null;
  depositPaid: boolean;
  dueDate: string | null;
  notes: string;
  paid: boolean;
  vendorId: string | null;
  vendor?: { id: string; name: string } | null;
}

interface BudgetResponse {
  items: BudgetItem[];
  totalBudget: number | null;
}

const CATEGORIES = ["Venue", "Catering", "Photography", "Florals", "Music / DJ", "Attire", "Transportation", "Invitations", "Honeymoon", "Décor", "Hair & Makeup", "Officiant", "Rings", "Misc"];

const fmt = (n: number | null | undefined) =>
  n != null ? `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—";

const EMPTY: Omit<BudgetItem, "id" | "vendor"> = {
  category: "Venue",
  name: "",
  vendorName: "",
  estimatedCost: 0,
  actualCost: null,
  depositAmount: null,
  depositPaid: false,
  dueDate: null,
  notes: "",
  paid: false,
  vendorId: null,
};

export default function BudgetPage() {
  const { data: result, loading, refetch } = useFetch<BudgetResponse | null>("/api/v1/admin/budget", null, (json) => json);
  const items = result?.items ?? [];
  const [totalBudget, setTotalBudget] = useState<string>("");
  const [editingCeiling, setEditingCeiling] = useState(false);
  const [editing, setEditing] = useState<(BudgetItem & { _isNew?: boolean }) | null>(null);
  const [saving, setSaving] = useState(false);

  const ceiling = result?.totalBudget;
  const totalEstimated = items.reduce((s, i) => s + i.estimatedCost, 0);
  const totalActual = items.reduce((s, i) => s + (i.actualCost ?? i.estimatedCost), 0);
  const totalDeposit = items.reduce((s, i) => s + (i.depositPaid ? (i.depositAmount ?? 0) : 0), 0);

  const grouped = useMemo(() => {
    const map: Record<string, BudgetItem[]> = {};
    for (const item of items) {
      (map[item.category] ??= []).push(item);
    }
    return map;
  }, [items]);

  async function saveCeiling() {
    const val = totalBudget === "" ? null : parseFloat(totalBudget);
    await fetch("/api/v1/admin/budget", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ totalBudget: val }),
    });
    setEditingCeiling(false);
    refetch();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    const isNew = editing._isNew;
    const url = isNew ? "/api/v1/admin/budget" : `/api/v1/admin/budget/${editing.id}`;
    await fetch(url, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    setSaving(false);
    setEditing(null);
    refetch();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/v1/admin/budget/${id}`, { method: "DELETE" });
    refetch();
  }

  const budgetPct = ceiling && totalEstimated > 0 ? Math.min(100, (totalEstimated / ceiling) * 100) : null;
  const actualPct = ceiling && totalActual > 0 ? Math.min(100, (totalActual / ceiling) * 100) : null;

  return (
    <div>
      <AdminPageHeader
        title="Budget Tracker"
        subtitle={`${items.length} line items`}
        actions={
          <button onClick={() => setEditing({ id: "", ...EMPTY, _isNew: true })} className="btn-gold px-4 py-2 text-sm">
            + Add Item
          </button>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-royal/20 border border-gold/10 rounded-lg p-4">
          <p className="text-ivory/50 text-xs mb-1">Total Estimated</p>
          <p className="text-ivory font-bold text-xl">{fmt(totalEstimated)}</p>
        </div>
        <div className="bg-royal/20 border border-gold/10 rounded-lg p-4">
          <p className="text-ivory/50 text-xs mb-1">Total Actual</p>
          <p className="text-ivory font-bold text-xl">{fmt(totalActual)}</p>
        </div>
        <div className="bg-royal/20 border border-gold/10 rounded-lg p-4">
          <p className="text-ivory/50 text-xs mb-1">Deposits Paid</p>
          <p className="text-green-400 font-bold text-xl">{fmt(totalDeposit)}</p>
        </div>
        <div
          className="bg-royal/20 border border-gold/10 rounded-lg p-4 cursor-pointer hover:border-gold/30 transition-colors"
          onClick={() => { setTotalBudget(ceiling != null ? String(ceiling) : ""); setEditingCeiling(true); }}
        >
          <p className="text-ivory/50 text-xs mb-1">Budget Ceiling</p>
          <p className="text-gold font-bold text-xl">{ceiling != null ? fmt(ceiling) : "Set ceiling →"}</p>
        </div>
      </div>

      {/* Progress bars */}
      {ceiling != null && (
        <div className="bg-royal/20 border border-gold/10 rounded-lg p-6 mb-6">
          <div className="flex justify-between text-xs text-ivory/50 mb-1">
            <span>Estimated vs Budget</span>
            <span>{fmt(totalEstimated)} / {fmt(ceiling)}</span>
          </div>
          <div className="w-full bg-midnight rounded-full h-3 overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${(budgetPct ?? 0) > 90 ? "bg-red-500" : (budgetPct ?? 0) > 75 ? "bg-yellow-400" : "bg-green-500"}`}
              style={{ width: `${budgetPct ?? 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-ivory/50 mb-1">
            <span>Actual Spend vs Budget</span>
            <span>{fmt(totalActual)} / {fmt(ceiling)}</span>
          </div>
          <div className="w-full bg-midnight rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${(actualPct ?? 0) > 90 ? "bg-red-500" : (actualPct ?? 0) > 75 ? "bg-yellow-400" : "bg-gold"}`}
              style={{ width: `${actualPct ?? 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Items by category */}
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 bg-royal/10 rounded-lg animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState title="No budget items yet" subtitle="Add your first line item to start tracking." icon="💰" />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, catItems]) => {
            const catTotal = catItems.reduce((s, i) => s + i.estimatedCost, 0);
            return (
              <div key={cat} className="bg-royal/10 border border-gold/10 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gold/10 bg-royal/20">
                  <h3 className="text-gold font-serif font-semibold">{cat}</h3>
                  <span className="text-ivory/50 text-sm">{fmt(catTotal)} estimated</span>
                </div>
                <div className="divide-y divide-gold/5">
                  {catItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 px-4 py-3 hover:bg-royal/10 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${item.paid ? "line-through text-ivory/30" : "text-ivory"}`}>{item.name || item.vendorName}</p>
                        {item.vendorName && item.name && <p className="text-ivory/40 text-xs">{item.vendorName}</p>}
                        {item.dueDate && (
                          <p className={`text-xs mt-0.5 ${new Date(item.dueDate) < new Date() && !item.paid ? "text-red-400" : "text-ivory/30"}`}>
                            Due {new Date(item.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm flex-shrink-0 mr-2">
                        <p className="text-ivory">{fmt(item.estimatedCost)}</p>
                        {item.actualCost != null && <p className={`text-xs ${item.actualCost > item.estimatedCost ? "text-red-400" : "text-green-400"}`}>{fmt(item.actualCost)} actual</p>}
                        {item.depositAmount != null && (
                          <p className={`text-xs ${item.depositPaid ? "text-green-400" : "text-yellow-400"}`}>
                            {item.depositPaid ? "✓" : "⏳"} deposit {fmt(item.depositAmount)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {item.paid && <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Paid</span>}
                        <button onClick={() => setEditing({ ...item })} className="text-ivory/40 hover:text-gold text-xs px-2 py-1">Edit</button>
                        <ConfirmButton
                          onConfirm={() => handleDelete(item.id)}
                          message="Delete this budget item?"
                          className="text-red-400/40 hover:text-red-400 text-xs px-2 py-1"
                        >Del</ConfirmButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit/Create Modal */}
      {!!editing && <Modal
        onClose={() => setEditing(null)}
        title={editing?._isNew ? "Add Budget Item" : "Edit Budget Item"}
      >
        {editing && (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-ivory/60 text-xs block mb-1">Category</label>
                <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="input-celestial w-full text-sm">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-ivory/60 text-xs block mb-1">Item Name</label>
                <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="input-celestial w-full text-sm" placeholder="e.g. Venue rental" />
              </div>
            </div>
            <div>
              <label className="text-ivory/60 text-xs block mb-1">Vendor Name</label>
              <input value={editing.vendorName} onChange={(e) => setEditing({ ...editing, vendorName: e.target.value })} className="input-celestial w-full text-sm" placeholder="e.g. The Highland Manor" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-ivory/60 text-xs block mb-1">Estimated Cost ($)</label>
                <input type="number" step="0.01" value={editing.estimatedCost} onChange={(e) => setEditing({ ...editing, estimatedCost: parseFloat(e.target.value) || 0 })} className="input-celestial w-full text-sm" />
              </div>
              <div>
                <label className="text-ivory/60 text-xs block mb-1">Actual Cost ($)</label>
                <input type="number" step="0.01" value={editing.actualCost ?? ""} onChange={(e) => setEditing({ ...editing, actualCost: e.target.value ? parseFloat(e.target.value) : null })} className="input-celestial w-full text-sm" placeholder="Leave blank if unknown" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-ivory/60 text-xs block mb-1">Deposit Amount ($)</label>
                <input type="number" step="0.01" value={editing.depositAmount ?? ""} onChange={(e) => setEditing({ ...editing, depositAmount: e.target.value ? parseFloat(e.target.value) : null })} className="input-celestial w-full text-sm" placeholder="Optional" />
              </div>
              <div>
                <label className="text-ivory/60 text-xs block mb-1">Due Date</label>
                <input type="date" value={editing.dueDate ? editing.dueDate.slice(0, 10) : ""} onChange={(e) => setEditing({ ...editing, dueDate: e.target.value || null })} className="input-celestial w-full text-sm" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-ivory/70 cursor-pointer">
                <input type="checkbox" checked={editing.depositPaid} onChange={(e) => setEditing({ ...editing, depositPaid: e.target.checked })} className="accent-gold" />
                Deposit Paid
              </label>
              <label className="flex items-center gap-2 text-sm text-ivory/70 cursor-pointer">
                <input type="checkbox" checked={editing.paid} onChange={(e) => setEditing({ ...editing, paid: e.target.checked })} className="accent-gold" />
                Fully Paid
              </label>
            </div>
            <div>
              <label className="text-ivory/60 text-xs block mb-1">Notes</label>
              <textarea value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} className="input-celestial w-full text-sm" rows={2} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-gold px-6 py-2 text-sm flex-1">
                {saving ? "Saving…" : editing._isNew ? "Add Item" : "Save Changes"}
              </button>
              <button type="button" onClick={() => setEditing(null)} className="btn-outline px-4 py-2 text-sm">Cancel</button>
            </div>
          </form>
        )}
      </Modal>}

      {/* Ceiling editor modal */}
      {editingCeiling && <Modal onClose={() => setEditingCeiling(false)} title="Set Budget Ceiling">
        <div className="space-y-4">
          <p className="text-ivory/60 text-sm">Set your total wedding budget. Leave blank to remove the ceiling.</p>
          <div>
            <label className="text-ivory/60 text-xs block mb-1">Total Budget ($)</label>
            <input
              type="number"
              step="100"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              className="input-celestial w-full text-sm"
              placeholder="e.g. 30000"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={saveCeiling} className="btn-gold px-6 py-2 text-sm flex-1">Save</button>
            <button onClick={() => setEditingCeiling(false)} className="btn-outline px-4 py-2 text-sm">Cancel</button>
          </div>
        </div>
      </Modal>}
    </div>
  );
}
