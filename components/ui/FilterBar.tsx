"use client";

interface FilterBarProps<T extends string> {
  filters: readonly { value: T; label: string }[];
  active: T;
  onChange: (value: T) => void;
  variant?: "pill" | "button";
}

export default function FilterBar<T extends string>({
  filters,
  active,
  onChange,
  variant = "pill",
}: FilterBarProps<T>) {
  if (variant === "button") {
    return (
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => onChange(f.value)}
            className={`px-3 py-2 rounded text-sm transition-colors ${
              active === f.value
                ? "bg-gold/20 text-gold border border-gold"
                : "bg-royal/20 text-ivory/50 border border-gold/10 hover:border-gold/30"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            active === f.value
              ? "bg-gold/20 text-gold border border-gold/40"
              : "bg-royal/20 text-ivory/60 border border-gold/10 hover:text-ivory"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
