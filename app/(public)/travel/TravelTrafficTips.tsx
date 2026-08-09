import type { TrafficTip } from "@/lib/config/travel-content";

interface Props {
  trafficTips: TrafficTip[];
}

export default function TravelTrafficTips({ trafficTips }: Props) {
  return (
    <div className="max-w-5xl mx-auto mb-16">
      <h2 className="heading-gold text-3xl text-center mb-4">
        🚦 Orlando Traffic Tips
      </h2>
      <p className="text-ivory/60 text-center max-w-2xl mx-auto mb-8">
        Orlando traffic can be unpredictable — especially around the
        tourist corridors. The venue is in Apopka, northwest of Orlando
        proper, so local driving is easy. The challenge is getting <em>to</em>{" "}
        Apopka on the highways. <span className="text-gold">Think in travel
        time, not miles.</span>
      </p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {trafficTips.map((tip) => (
          <div key={tip.title} className="card-celestial">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">{tip.icon}</span>
              <div>
                <h3 className="text-gold font-serif text-base mb-1">
                  {tip.title}
                </h3>
                <p className="text-ivory/60 text-sm leading-relaxed">
                  {tip.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
