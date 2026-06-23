"use client";

export default function PrintButton({ label = "Print / Save as PDF" }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="btn-outline text-sm px-5 py-2 print:hidden"
    >
      🖨️ {label}
    </button>
  );
}
