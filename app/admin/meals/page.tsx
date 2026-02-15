"use client";

import { useState, useEffect, useCallback } from "react";

interface MealOption {
  id: string;
  name: string;
  description: string | null;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  sortOrder: number;
}

export default function AdminMealsPage() {
  const [meals, setMeals] = useState<MealOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newVeg, setNewVeg] = useState(false);
  const [newVegan, setNewVegan] = useState(false);
  const [newGF, setNewGF] = useState(false);

  const fetchMeals = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/meals");
      const data = await res.json();
      if (data.data) setMeals(data.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      await fetch("/api/v1/admin/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          description: newDesc || undefined,
          isVegetarian: newVeg,
          isVegan: newVegan,
          isGlutenFree: newGF,
          sortOrder: meals.length,
        }),
      });
      setShowAdd(false);
      setNewName("");
      setNewDesc("");
      setNewVeg(false);
      setNewVegan(false);
      setNewGF(false);
      fetchMeals();
    } catch {
      // silently fail
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this meal option?")) return;
    try {
      await fetch(`/api/v1/admin/meals/${id}`, { method: "DELETE" });
      fetchMeals();
    } catch {
      // silently fail
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gold font-serif text-3xl mb-1">Meal Options</h1>
          <p className="text-ivory/50 text-sm">{meals.length} options</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-gold px-4 py-2 text-sm">
          + Add Option
        </button>
      </div>

      {showAdd && (
        <div className="bg-royal/20 border border-gold/10 rounded-lg p-6 mb-6">
          <form onSubmit={handleAdd} className="space-y-3">
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="input-celestial w-full" placeholder="Meal name" required />
            <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="input-celestial w-full h-16 resize-none" placeholder="Description" />
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-ivory/70 text-sm">
                <input type="checkbox" checked={newVeg} onChange={(e) => setNewVeg(e.target.checked)} className="w-4 h-4" /> Vegetarian
              </label>
              <label className="flex items-center gap-2 text-ivory/70 text-sm">
                <input type="checkbox" checked={newVegan} onChange={(e) => setNewVegan(e.target.checked)} className="w-4 h-4" /> Vegan
              </label>
              <label className="flex items-center gap-2 text-ivory/70 text-sm">
                <input type="checkbox" checked={newGF} onChange={(e) => setNewGF(e.target.checked)} className="w-4 h-4" /> Gluten Free
              </label>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowAdd(false)} className="btn-outline px-4 py-2 text-sm">Cancel</button>
              <button type="submit" className="btn-gold px-4 py-2 text-sm">Add</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-ivory/40">Loading...</div>
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
              <button onClick={() => handleDelete(meal.id)} className="text-red-400/60 hover:text-red-400 text-xs">Remove</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-ivory/40">No meal options yet.</div>
      )}
    </div>
  );
}
