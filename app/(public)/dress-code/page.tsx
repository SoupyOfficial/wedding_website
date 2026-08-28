import { getSettings } from "@/lib/services/settings.service";
import { checkFeatureFlag } from "@/lib/feature-gate";
import { PageHeader } from "@/components/ui";

export const metadata = {
  title: "Dress Code",
  description: "Creative Cocktail meets Celestial Formal — what to wear to Jacob & Ashley's wedding.",
};

const DRESS_CODE_FALLBACK =
  "Creative Cocktail meets Celestial Formal. Dress your best and go as crazy as you like to fit the celestial theme. Dressing on theme is encouraged but NOT required. No cream or ivory. No casual wear. The ceremony is outdoors — keep an eye on the weather.";

export default async function DressCodePage() {
  const gate = await checkFeatureFlag("dressCodePageEnabled");
  if (gate) return gate;

  const settings = await getSettings(
    "dressCode",
    "dressCodeImages",
    "dressCodePinterestLink",
    "weatherInfo"
  );

  return (
    <div className="pt-8 pb-16">
      <div className="section-padding">
        <PageHeader
          title="Dress Code"
          subtitle="Creative Cocktail meets Celestial Formal"
          className="mb-16"
        />

        <div className="max-w-2xl mx-auto mb-16">
          <div className="card-celestial text-center">
            <div className="text-3xl mb-3">👗</div>
            <h3 className="heading-gold text-xl mb-2">Dress Code</h3>
            <p className="text-ivory/70">
              {settings?.dressCode || DRESS_CODE_FALLBACK}
            </p>
            {(() => {
              if (!settings?.dressCodeImages) return null;
              try {
                const images: string[] = JSON.parse(settings.dressCodeImages);
                if (!Array.isArray(images) || images.length === 0) return null;
                return (
                  <div className="flex flex-wrap justify-center gap-3 mt-4">
                    {images.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Dress code example ${i + 1}`}
                        className="w-24 h-24 object-cover rounded-lg border border-gold/20"
                        loading="lazy"
                      />
                    ))}
                  </div>
                );
              } catch {
                return null;
              }
            })()}
            {settings?.dressCodePinterestLink && (
              <a
                href={settings.dressCodePinterestLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gold/70 hover:text-gold text-sm mt-4 transition-colors"
              >
                📌 View dress code inspiration on Pinterest
              </a>
            )}
          </div>
        </div>

        {settings?.weatherInfo && (
          <div className="max-w-2xl mx-auto">
            <div className="card-celestial text-center">
              <div className="text-3xl mb-3">🌤️</div>
              <h3 className="heading-gold text-xl mb-2">Weather</h3>
              <p className="text-ivory/70">{settings.weatherInfo}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
