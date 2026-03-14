import { query, queryOne, toBool } from "@/lib/db";
import type { FAQ, SiteSettings } from "@/lib/db-types";
import { SETTINGS_BOOLS } from "@/lib/db-types";
import { checkFeatureFlag } from "@/lib/feature-gate";
import { PageHeader } from "@/components/ui";

export const metadata = {
  title: "FAQ",
  description: "Frequently asked questions about our wedding day.",
};

export default async function FAQPage() {
  const gate = await checkFeatureFlag("faqPageEnabled");
  if (gate) return gate;

  const faqs = await query<FAQ>("SELECT * FROM FAQ ORDER BY sortOrder ASC");

  const settings = await queryOne<SiteSettings>("SELECT * FROM SiteSettings WHERE id = ?", ["singleton"]);
  if (settings) toBool(settings, ...SETTINGS_BOOLS);

  return (
    <div className="pt-8 pb-16">
      <div className="section-padding">
        <PageHeader
          title="Frequently Asked Questions"
          subtitle="Have a question? We might have the answer right here."
          className="mb-16"
        />

        {/* FAQ Intro Content */}
        {settings?.faqContent && (
          <div className="max-w-3xl mx-auto mb-12">
            <div
              className="text-ivory/70 leading-relaxed text-center"
              dangerouslySetInnerHTML={{
                __html: settings.faqContent.replace(/\n/g, "<br />"),
              }}
            />
          </div>
        )}

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq: { id: string; question: string; answer: string; sortOrder: number }) => (
            <details
              key={faq.id}
              className="group card-celestial cursor-pointer"
            >
              <summary className="flex items-center justify-between list-none">
                <h3 className="text-gold font-serif text-lg pr-4">
                  {faq.question}
                </h3>
                <span className="text-gold text-xl transition-transform duration-300 group-open:rotate-45 flex-shrink-0">
                  +
                </span>
              </summary>
              <div className="mt-4 pt-4 border-t border-gold/10">
                <p className="text-ivory/70 leading-relaxed">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>

        {/* Still have questions */}
        <div className="text-center mt-12">
          <p className="text-ivory/60 mb-4">Still have a question?</p>
          <a href="/contact" className="btn-gold inline-block px-6 py-3">
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
