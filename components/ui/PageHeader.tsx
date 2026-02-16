interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function PageHeader({ title, subtitle, className = "mb-12" }: PageHeaderProps) {
  return (
    <div className={`text-center animate-fade-in ${className}`}>
      <h1 className="heading-gold text-4xl md:text-5xl mb-4">{title}</h1>
      <div className="gold-divider" />
      {subtitle && (
        <p className="text-ivory/70 text-lg max-w-2xl mx-auto">{subtitle}</p>
      )}
    </div>
  );
}
