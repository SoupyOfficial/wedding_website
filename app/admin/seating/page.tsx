"use client";

import { useState, useMemo } from "react";
import { useFetch } from "@/lib/hooks";
import { AdminPageHeader, Modal, LoadingState, ConfirmButton } from "@/components/ui";
import PrintButton from "@/components/PrintButton";

interface SeatingTable {
  id: string;
  name: string;
  capacity: number;
  shape: string;
  notes: string;
  sortOrder: number;
}

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  tableNumber: number | null;
  rsvpStatus: string;
}

const EMPTY_TABLE = { name: "", capacity: 8, shape: "round", notes: "", sortOrder: 0 };

export default function AdminSeatingPage() {
  const { data, loading, refetch } = useFetch<{ tables: SeatingTable[]; guests: Guest[] } | null>(
    "/api/v1/admin/seating",
    null,
    (json) => json
  );
  const tables: SeatingTable[] = data?.tables ?? [];
  const guests: Guest[] = data?.guests ?? [];

  const [editingTable, setEditingTable] = useState<SeatingTable | null>(null);
  const [isNewTable, setIsNewTable] = useState(false);
  const [tableForm, setTableForm] = useState<typeof EMPTY_TABLE>({ ...EMPTY_TABLE });
  const [saving, setSaving] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);

  // Build table-number → tableId map
  const tableByNumber = useMemo(() => {
    const map: Record<number, SeatingTable> = {};
    tables.forEach((t, i) => { map[i + 1] = t; });
    return map;
  }, [tables]);

  // Group guests by table number
  const guestsByTable = useMemo(() => {
    const map: Record<string, Guest[]> = {};
    // Unassigned bucket
    map["unassigned"] = [];
    tables.forEach((_, i) => { map[String(i + 1)] = []; });

    for (const g of guests) {
      if (g.tableNumber == null || g.tableNumber < 1 || g.tableNumber > tables.length) {
        map["unassigned"].push(g);
      } else {
        map[String(g.tableNumber)].push(g);
      }
    }
    return map;
  }, [guests, tables]);

  const attendingCount = guests.filter((g) => g.rsvpStatus === "attending" || g.rsvpStatus === "CONFIRMED").length;
  const assignedCount = guests.filter((g) => g.tableNumber != null).length;

  function openNewTable() {
    setTableForm({ ...EMPTY_TABLE, sortOrder: tables.length });
    setIsNewTable(true);
    setEditingTable(null);
  }

  function openEditTable(t: SeatingTable) {
    setTableForm({ name: t.name, capacity: t.capacity, shape: t.shape, notes: t.notes, sortOrder: t.sortOrder });
    setEditingTable(t);
    setIsNewTable(false);
  }

  async function saveTable(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNewTable) {
        await fetch("/api/v1/admin/seating", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tableForm),
        });
      } else if (editingTable) {
        await fetch(`/api/v1/admin/seating/${editingTable.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tableForm),
        });
      }
      setEditingTable(null);
      setIsNewTable(false);
      refetch();
    } finally {
      setSaving(false);
    }
  }

  async function deleteTable(id: string) {
    await fetch(`/api/v1/admin/seating/${id}`, { method: "DELETE" });
    refetch();
  }

  async function assignGuest(guestId: string, tableNumber: number | null) {
    setAssigning(guestId);
    try {
      await fetch("/api/v1/admin/seating/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId, tableNumber }),
      });
      refetch();
    } finally {
      setAssigning(null);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div>
      <AdminPageHeader
        title="Seating Chart"
        subtitle={`${tables.length} tables · ${assignedCount}/${guests.length} guests assigned · ${attendingCount} attending`}
        actions={
          <div className="flex gap-2">
            <PrintButton label="Print Chart" />
            <button onClick={openNewTable} className="btn-gold px-4 py-2 text-sm">+ Add Table</button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Unassigned sidebar */}
        <div className="lg:col-span-1">
          <h2 className="text-gold font-serif text-lg font-bold mb-3">
            Unassigned ({guestsByTable["unassigned"]?.length ?? 0})
          </h2>
          <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
            {(guestsByTable["unassigned"] || []).length === 0 ? (
              <p className="text-ivory/30 text-sm text-center py-8">All guests assigned!</p>
            ) : (
              (guestsByTable["unassigned"] || []).map((g) => (
                <GuestRow
                  key={g.id}
                  guest={g}
                  tables={tables}
                  assigning={assigning === g.id}
                  onAssign={(tableNum) => assignGuest(g.id, tableNum)}
                />
              ))
            )}
          </div>
        </div>

        {/* Table grid */}
        <div className="lg:col-span-2">
          {tables.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🪑</div>
              <p className="text-ivory/40">No tables yet</p>
              <p className="text-ivory/30 text-sm mt-1 mb-4">Add tables to start building your seating chart.</p>
              <button onClick={openNewTable} className="btn-gold px-4 py-2 text-sm">+ Add Table</button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {tables.map((table, idx) => {
                const tableNum = idx + 1;
                const seated = guestsByTable[String(tableNum)] || [];
                const overCapacity = seated.length > table.capacity;
                return (
                  <div
                    key={table.id}
                    className={`bg-royal/20 border rounded-lg p-4 print:break-inside-avoid ${overCapacity ? "border-red-500/40" : "border-gold/10"}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-gold font-serif font-bold">{table.name}</span>
                        <span className="text-ivory/30 text-xs ml-2">#{tableNum}</span>
                      </div>
                      <div className="flex items-center gap-2 no-print">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${overCapacity ? "bg-red-500/20 text-red-300" : "bg-gold/10 text-gold/80"}`}>
                          {seated.length}/{table.capacity}
                        </span>
                        <button
                          onClick={() => openEditTable(table)}
                          className="text-ivory/30 hover:text-ivory text-xs"
                        >
                          ✏️
                        </button>
                        <ConfirmButton
                          onConfirm={() => deleteTable(table.id)}
                          message={`Delete ${table.name}?`}
                          className="text-ivory/20 hover:text-red-400 text-xs"
                        >
                          🗑
                        </ConfirmButton>
                      </div>
                    </div>

                    {table.notes && (
                      <p className="text-ivory/30 text-xs mb-2 italic">{table.notes}</p>
                    )}

                    <div className="space-y-1 min-h-[40px]">
                      {seated.length === 0 ? (
                        <p className="text-ivory/20 text-xs italic">Empty</p>
                      ) : (
                        seated.map((g) => (
                          <div key={g.id} className="flex items-center justify-between group">
                            <span className="text-ivory/80 text-xs">{g.firstName} {g.lastName}</span>
                            <button
                              onClick={() => assignGuest(g.id, null)}
                              className="text-ivory/20 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity no-print"
                              title="Remove from table"
                            >
                              ×
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Table edit/create modal */}
      {(isNewTable || editingTable !== null) && (
      <Modal
        onClose={() => { setEditingTable(null); setIsNewTable(false); }}
        title={isNewTable ? "Add Table" : "Edit Table"}
      >
        <form onSubmit={saveTable} className="space-y-4">
          <div>
            <label className="block text-ivory/70 text-xs mb-1">Table Name *</label>
            <input
              type="text"
              value={tableForm.name}
              onChange={(e) => setTableForm((f) => ({ ...f, name: e.target.value }))}
              className="input-celestial w-full"
              placeholder="e.g. Table 1, Head Table, Family Table"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-ivory/70 text-xs mb-1">Capacity</label>
              <input
                type="number"
                value={tableForm.capacity}
                onChange={(e) => setTableForm((f) => ({ ...f, capacity: parseInt(e.target.value) || 8 }))}
                className="input-celestial w-full"
                min={1}
                max={50}
              />
            </div>
            <div>
              <label className="block text-ivory/70 text-xs mb-1">Shape</label>
              <select
                value={tableForm.shape}
                onChange={(e) => setTableForm((f) => ({ ...f, shape: e.target.value }))}
                className="input-celestial w-full"
              >
                <option value="round">Round</option>
                <option value="rect">Rectangular</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-ivory/70 text-xs mb-1">Notes</label>
            <input
              type="text"
              value={tableForm.notes}
              onChange={(e) => setTableForm((f) => ({ ...f, notes: e.target.value }))}
              className="input-celestial w-full"
              placeholder="Optional notes about this table"
            />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => { setEditingTable(null); setIsNewTable(false); }} className="btn-outline px-4 py-2 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-gold px-4 py-2 text-sm disabled:opacity-50">
              {saving ? "Saving…" : "Save Table"}
            </button>
          </div>
        </form>
      </Modal>
      )}
    </div>
  );
}

function GuestRow({
  guest,
  tables,
  assigning,
  onAssign,
}: {
  guest: Guest;
  tables: SeatingTable[];
  assigning: boolean;
  onAssign: (tableNum: number | null) => void;
}) {
  const statusColor =
    guest.rsvpStatus === "attending" || guest.rsvpStatus === "CONFIRMED"
      ? "text-green-400"
      : guest.rsvpStatus === "declined" || guest.rsvpStatus === "DECLINED"
        ? "text-red-400"
        : "text-ivory/40";

  return (
    <div className="flex items-center gap-2 p-2 bg-royal/10 rounded border border-gold/5 hover:border-gold/15 transition-colors">
      <div className="flex-1 min-w-0">
        <span className="text-ivory/80 text-sm truncate block">{guest.firstName} {guest.lastName}</span>
        <span className={`text-[10px] ${statusColor} capitalize`}>{guest.rsvpStatus}</span>
      </div>
      <select
        value={guest.tableNumber ?? ""}
        onChange={(e) => onAssign(e.target.value ? parseInt(e.target.value) : null)}
        disabled={assigning}
        className="bg-midnight border border-gold/20 text-ivory/70 text-xs rounded px-2 py-1 focus:outline-none focus:border-gold/40 disabled:opacity-50 max-w-[120px]"
      >
        <option value="">-- unassigned --</option>
        {tables.map((t, i) => (
          <option key={t.id} value={i + 1}>
            {t.name} ({i + 1})
          </option>
        ))}
      </select>
    </div>
  );
}
