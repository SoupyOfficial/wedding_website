export default function SectionDivider() {
  return (
    <div className="flex items-center justify-center py-8" aria-hidden="true">
      <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <svg
        className="mx-4 w-6 h-6 text-gold/60"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.85 0 3.58-.5 5.07-1.37C14.18 18.95 12 15.73 12 12s2.18-6.95 5.07-8.63A9.93 9.93 0 0 0 12 2z" />
      </svg>
      <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
    </div>
  );
}
