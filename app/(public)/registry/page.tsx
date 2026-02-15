import prisma from "@/lib/db";
import SectionDivider from "@/components/SectionDivider";

export const metadata = {
  title: "Registry | Jacob & Ashley",
  description: "Our wedding gift registry. Your presence is our greatest gift!",
};

export default async function RegistryPage() {
  const registries = await prisma.registryItem.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const iconMap: Record<string, string> = {
    amazon: "📦",
    target: "🎯",
    "crate & barrel": "🏠",
    "williams sonoma": "🍳",
    honeyfund: "✈️",
    zola: "💝",
    default: "🎁",
  };

  return (
    <div className="pt-24 pb-16">
      <div className="section-padding">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="heading-gold text-4xl md:text-5xl mb-4">
            Registry
          </h1>
          <div className="gold-divider" />
          <p className="text-ivory/70 text-lg max-w-2xl mx-auto">
            Your presence is the greatest gift of all, but if you wish to
            celebrate with a gift, here are some ideas.
          </p>
        </div>

        {/* Registry Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
          {registries.map((registry: { id: string; name: string; url: string; iconUrl: string | null; sortOrder: number }) => (
            <div
              key={registry.id}
              className="card-celestial text-center group hover:scale-105 transition-all duration-300"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-royal/50 border-2 border-gold/20 flex items-center justify-center overflow-hidden">
                {registry.iconUrl ? (
                  <img
                    src={registry.iconUrl}
                    alt={registry.name}
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <span className="text-3xl">
                    {iconMap[registry.name.toLowerCase()] || iconMap.default}
                  </span>
                )}
              </div>
              <h3 className="text-gold font-serif text-xl mb-2">
                {registry.name}
              </h3>
              <a
                href={registry.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold inline-block text-sm px-6 py-2"
              >
                View Registry
              </a>
            </div>
          ))}
        </div>

        <SectionDivider />

        {/* Note */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="card-celestial">
            <div className="text-4xl mb-4">💫</div>
            <h3 className="text-gold font-serif text-xl mb-3">
              A Note from Us
            </h3>
            <p className="text-ivory/70 leading-relaxed">
              Truly, your love and support mean the most to us. We are just
              grateful to have you celebrate this special day with us. If you do
              choose to give a gift, please know that it is cherished deeply.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
