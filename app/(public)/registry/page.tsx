import { query, queryOne, toBool } from "@/lib/db";
import type { RegistryItem, SiteSettings } from "@/lib/db-types";
import { SETTINGS_BOOLS } from "@/lib/db-types";
import { checkFeatureFlag } from "@/lib/feature-gate";
import SectionDivider from "@/components/SectionDivider";
import { PageHeader } from "@/components/ui";
import RegistryList from "@/components/RegistryList";

export const metadata = {
  title: "Registry",
  description: "Our wedding gift registry. Your presence is our greatest gift!",
};

export default async function RegistryPage() {
  const gate = await checkFeatureFlag("registryPageEnabled");
  if (gate) return gate;
  const registries = await query<RegistryItem>("SELECT * FROM RegistryItem ORDER BY sortOrder ASC");
  const settings = await queryOne<SiteSettings>("SELECT * FROM SiteSettings WHERE id = ?", ["singleton"]);
  if (settings) toBool(settings, ...SETTINGS_BOOLS);

  return (
    <div className="pt-8 pb-16">
      <div className="section-padding">
        <PageHeader
          title="Registry"
          subtitle="Your presence is the greatest gift of all, but if you wish to celebrate with a gift, here are some ideas."
          className="mb-16"
        />

        <RegistryList items={registries} />

        <SectionDivider />

        {/* Note */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="card-celestial">
            <div className="text-4xl mb-4">??</div>
            <h3 className="text-gold font-serif text-xl mb-3">
              A Note from Us
            </h3>
            <p className="text-ivory/70 leading-relaxed">
              {settings?.registryNote ||
                "Truly, your love and support mean the most to us. We are just grateful to have you celebrate this special day with us. If you do choose to give a gift, please know that it is cherished deeply."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
