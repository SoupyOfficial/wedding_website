interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
}

export default function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon && <div className="text-4xl mb-3">{icon}</div>}
      <p className="text-ivory/40">{title}</p>
      {subtitle && <p className="text-ivory/30 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}
