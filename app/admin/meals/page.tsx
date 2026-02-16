"use client";

import { useState } from "react";
import { useAdminFetch } from "@/lib/hooks";
import { AdminPageHeader, Modal, LoadingState, EmptyState } from "@/components/ui";

interface MealOption {
  id: string;
  name: string;
  description: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isAvailable: boolean;
  sortOrder: number;
}

const EMPTY_MEAL: Omit<MealOption, "id"> = {
  name: "",
  description: "",
  isVegetarian: false,
  isVegan: false,
  isGlutenFree: false,
  isAvailable: true,
  sortOrder: 0,
};

export default function AdminMealsPage() {
  const { data: meals, loading, refetch } = useAdminFetch<MealOption>("/api/v1/admin/meals");
  const [editing, setEditing] = useState<MealOption | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  function openNew() {
    setEditing({ id: "", ...EMPTY_MEAL, sortOrder: meals.length } as MealOption);
    setIsNew(true);
  }

  function openEdit(m: MealOption) {
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
      const url = isNew ? "/api/v1/admin/meals" : `/api/v1/admin/meals/${editing.id}`;
      const method = isNew ? "POST" : "PUT";
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editing.name,
          description: editing.description || undefined,
          isVegetarian: editing.isVegetarian,
          isVegan: editing.isVegan,
          isGlutenFree: editing.isGlutenFree,
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
    if (!confirm("Remove this meal option?")) return;
    try {
      await fetch(`/api/v1/admin/meals/${id}`, { method: "DELETE" });
      if (editing?.id === id) closeEditor();
      refetch();
    } catch { /* silently fail */ }
  }

  return (
    <div>
      <AdminPageHeader
        title="Meal Options"
        subtitle={`${meals.length} options`}
        actions={<button onClick={openNew} className="btn-gold px-4 py-2 text-sm">+ Add Option</button>}
      />

      {loading ? (
        <LoadingState />
      ) : meals.length > 0 ? (
        <div className="space-y-2">
          {meals.map((meal) => (
            <div key={meal.id} className="flex items-center justify-between bg-royal/20 border border-gold/10 rounded-lg p-4">
              <div>
                <p className="text-ivory font-medium">{meal.name}</p>
                {meal.description && <p className="text-ivory/50 text-sm">{meal.description}</p>}
                <div className="flex gap-2 mt-1">
                  {meal.isVegetarian && <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded">Vegetarian</span>}
                  {meal.isVegan && <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded">Vegan</span>}
                  {meal.isGlutenFree && <span className="text-xs bg-yellow-900/30 text-yellow-400 px-2 py-0.5 rounded">Gluten Free</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(meal)} className="text-gold/60 hover:text-gold text-xs transition-colors">Edit</button>
                <button onClick={() => handleDelete(meal.id)} className="text-red-400/60 hover:text-red-400 text-xs transition-colors">Remove</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No meal options yet." />
      )}

      {editing && (
        <Modal title={isNew ? "Add Meal Option" : `Edit: ${editing.name}`} onClose={closeEditor}>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-ivory/70 text-xs mb-1">Name *</label>
                <input type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="input-celestial w-full" required />
              </div>
              <div>
                <label className="block text-ivory/70 text-xs mb-1">Description</label>
                <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="input-celestial w-full h-16 resize-none" />
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-ivory/70 text-sm">
                  <input type="checkbox" checked={editing.isVegetarian} onChange={(e) => setEditing({ ...editing, isVegetarian: e.target.checked })} className="w-4 h-4" /> Vegetarian
                </label>
                <label className="flex items-center gap-2 text-ivory/70 text-sm">
                  <input type="checkbox" checked={editing.isVegan} onChange={(e) => setEditing({ ...editing, isVegan: e.target.checked })} className="w-4 h-4" /> Vegan
                </label>
                <label className="flex items-center gap-2 text-ivory/70 text-sm">
                  <input type="checkbox" checked={editing.isGlutenFree} onChange={(e) => setEditing({ ...editing, isGlutenFree: e.target.checked })} className="w-4 h-4" /> Gluten Free
                </label>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={closeEditor} className="btn-outline px-4 py-2 text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="btn-gold px-4 py-2 text-sm">{saving ? "Saving..." : isNew ? "Add" : "Save Changes"}</button>
              </div>
            </form>
        </Modal>
      )}
    </div>
  );
}
