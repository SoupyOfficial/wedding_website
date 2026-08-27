import { checkFeatureFlag } from "@/lib/feature-gate";
import { PageHeader } from "@/components/ui";

export const metadata = {
  title: "Raffle",
  description: "Two winners. Four tickets. One lucky night.",
};

export default async function RafflePage() {
  const gate = await checkFeatureFlag("rafflePageEnabled");
  if (gate) return gate;

  return (
    <div className="pt-8 pb-16">
      <div className="section-padding">
        <PageHeader
          title="Raffle"
          subtitle="Two winners. Four tickets. One lucky night."
          className="mb-16"
        />

        <div className="max-w-3xl mx-auto space-y-6">
          <section className="card-celestial bg-royal/20 border border-gold/10 rounded-lg p-6">
            <h2 className="text-gold font-serif text-2xl mb-4">🎟️ The Prize</h2>
            <p className="text-ivory/70 leading-relaxed">
              Two lucky winners will each receive a pair of one-day Universal
              Studios Florida &amp; Islands of Adventure tickets — that&apos;s 4
              tickets total!
            </p>
            <ul className="mt-4 space-y-2 list-disc list-inside text-ivory/70">
              <li>
                Valid one day only at Universal Studios Florida and Universal
                Islands of Adventure.
              </li>
              <li>Not valid at Universal Epic Universe.</li>
              <li>Tickets are subject to blackout dates.</li>
            </ul>
          </section>

          <section className="card-celestial bg-royal/20 border border-gold/10 rounded-lg p-6">
            <h2 className="text-gold font-serif text-2xl mb-4">🎉 How to Enter</h2>
            <p className="text-ivory/70 leading-relaxed">
              Every RSVP submission automatically earns one entry — no purchase
              necessary.
            </p>
            <p className="text-ivory/70 leading-relaxed mt-3">
              Want extra chances? Additional raffle tickets will be available for
              purchase at the reception.
            </p>
          </section>

          <section className="card-celestial bg-royal/20 border border-gold/10 rounded-lg p-6">
            <h2 className="text-gold font-serif text-2xl mb-4">🎊 The Drawing</h2>
            <p className="text-ivory/70 leading-relaxed">
              Winners will be drawn live at the reception. You must be present to
              win!
            </p>
          </section>

          <section className="card-celestial bg-royal/20 border border-gold/10 rounded-lg p-6">
            <h2 className="text-gold font-serif text-2xl mb-4">
              🎫 Claiming Your Tickets
            </h2>
            <p className="text-ivory/70 leading-relaxed">
              After the drawing, winners will share their full legal name(s) and
              preferred visit date with Ashley. The name on each ticket must match
              a valid photo ID at the gate.
            </p>
            <p className="text-ivory/70 leading-relaxed mt-3">
              Blackout dates apply — the final visit date will be confirmed when
              your tickets are issued.
            </p>
          </section>

          <section className="card-celestial bg-royal/20 border border-gold/10 rounded-lg p-6">
            <h2 className="text-gold font-serif text-2xl mb-4">🤝 The Promise</h2>
            <p className="text-ivory/70 leading-relaxed">
              These tickets are provided through Ashley&apos;s employment with
              Universal Orlando. Winners promise to follow all park rules and
              policies — any infractions would directly reflect on Ashley&apos;s
              employment.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
