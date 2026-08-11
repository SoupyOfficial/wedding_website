"use client";

import { usePublicSettings } from "@/lib/hooks";
import { PageHeader } from "@/components/ui";

function formatTelLink(phone: string): string {
  return `tel:+1${phone.replace(/[^\d]/g, "")}`;
}

export default function ContactClient() {
  const { settings } = usePublicSettings();

  const coupleNames = settings?.coupleName || "Jacob & Ashley";
  const contactEmail = "forevercampbells@hotmail.com";

  const phoneAshley = settings?.contactPhoneAshley || "";
  const phoneJacob = settings?.contactPhoneJacob || "";
  const phoneMaryLorraine = settings?.contactPhoneMaryLorraine || "";
  const phoneMollie = settings?.contactPhoneMollie || "";

  return (
    <div className="pt-8 pb-16">
      <div className="section-padding">
        <PageHeader
          title="Contact Us"
          subtitle="Have a question? We'd love to hear from you."
        />

        <div className="max-w-lg mx-auto space-y-6">
          {/* Email */}
          <div className="card-celestial text-center">
            <div className="text-4xl mb-4">💌</div>
            <h2 className="text-gold font-serif text-2xl mb-2">Email Us</h2>
            <a
              href={`mailto:${contactEmail}`}
              className="inline-block text-ivory/80 hover:text-gold text-lg transition-colors"
            >
              {contactEmail}
            </a>
          </div>

          {/* Phone Contacts */}
          <div className="card-celestial text-center">
            <div className="text-4xl mb-4">📞</div>
            <h2 className="text-gold font-serif text-2xl mb-6">Call or Text</h2>
            <div className="space-y-5">
              {phoneAshley && (
                <div>
                  <p className="text-gold text-sm font-medium mb-1">Ashley</p>
                  <a
                    href={formatTelLink(phoneAshley)}
                    className="text-ivory/70 hover:text-gold transition-colors"
                  >
                    {phoneAshley}
                  </a>
                </div>
              )}
              {phoneJacob && (
                <div>
                  <p className="text-gold text-sm font-medium mb-1">Jacob</p>
                  <a
                    href={formatTelLink(phoneJacob)}
                    className="text-ivory/70 hover:text-gold transition-colors"
                  >
                    {phoneJacob}
                  </a>
                </div>
              )}
              {phoneMaryLorraine && (
                <div>
                  <p className="text-gold text-sm font-medium mb-1">Mary Lorraine</p>
                  <a
                    href={formatTelLink(phoneMaryLorraine)}
                    className="text-ivory/70 hover:text-gold transition-colors"
                  >
                    {phoneMaryLorraine}
                  </a>
                </div>
              )}
              {phoneMollie && (
                <div>
                  <p className="text-gold text-sm font-medium mb-1">Mollie</p>
                  <a
                    href={formatTelLink(phoneMollie)}
                    className="text-ivory/70 hover:text-gold transition-colors"
                  >
                    {phoneMollie}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Closing */}
          <div className="card-celestial text-center">
            <div className="text-3xl mb-3">🌙</div>
            <p className="text-ivory/50 text-sm italic">
              &ldquo;We can&apos;t wait to celebrate with you under the stars!&rdquo;
            </p>
            <p className="text-gold/70 font-serif mt-2">— {coupleNames}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
