import { query } from "@/lib/db";
import { getSettings } from "@/lib/services/settings.service";
import type { Hotel, TimelineEvent } from "@/lib/db-types";
import { checkFeatureFlag } from "@/lib/feature-gate";
import SectionDivider from "@/components/SectionDivider";
import { PageHeader } from "@/components/ui";
import { sanitizeHtml } from "@/lib/sanitize";
import WeatherForecast from "@/components/WeatherForecast";
import {
  airports,
  groundTransport,
  railAndDriving,
  DEFAULT_PARKING_INFO,
  featuredPark,
  themeParks,
  restaurants,
  localActivities,
  trafficTips,
  nearbyHotels,
} from "@/lib/config/travel-content";
import TravelHotels from "./TravelHotels";
import TravelGettingThere from "./TravelGettingThere";
import TravelTrafficTips from "./TravelTrafficTips";
import TravelThingsToDo from "./TravelThingsToDo";
// TravelTimeChecker disabled until Google Maps API key is configured
// import TravelTimeChecker from "@/components/TravelTimeChecker";

export const metadata = {
  title: "Travel & Stay",
  description: "Hotels, travel information, and things to do near the wedding venue.",
};

export default async function TravelPage() {
  const gate = await checkFeatureFlag("travelPageEnabled");
  if (gate) return gate;
  const settings = await getSettings("raffleTicketCount", "parkingInfo", "weddingDate", "travelContent");

  const allHotels = await query<Hotel>("SELECT * FROM Hotel ORDER BY sortOrder ASC");
  const venueHotels = allHotels.filter((h) => h.blockCode || h.bookingLink);
  const otherHotels = allHotels.filter((h) => !h.blockCode && !h.bookingLink);

  const timelineEvents = await query<TimelineEvent>(
    "SELECT * FROM TimelineEvent WHERE eventType = ? ORDER BY sortOrder ASC",
    ["wedding-day"]
  );

  const raffleTicketCount = settings?.raffleTicketCount ?? 2;
  const parkingInfo = settings?.parkingInfo || DEFAULT_PARKING_INFO;

  return (
    <div className="pt-8 pb-16">
      <div className="section-padding">
        <PageHeader
          title="Travel & Stay"
          subtitle="Everything you need to know about getting here, where to stay, and what to explore"
          className="mb-16"
        />

        <TravelHotels
          venueHotels={venueHotels}
          otherHotels={otherHotels}
          nearbyHotels={nearbyHotels}
        />

        <SectionDivider />

        <TravelGettingThere
          airports={airports}
          groundTransport={groundTransport}
          railAndDriving={railAndDriving}
          parkingInfo={parkingInfo}
        />

        <SectionDivider />

        <TravelTrafficTips trafficTips={trafficTips} />

        <SectionDivider />

        {/* Travel Time Checker — disabled until Google Maps API key is configured.
            To enable: see docs/guides/google-maps-setup.md, then uncomment the
            TravelTimeChecker import at the top of this file and restore this section:
            <div className="max-w-5xl mx-auto mb-16">
              <h2 className="heading-gold text-3xl text-center mb-4">📍 Check Your Travel Time</h2>
              <p className="text-ivory/60 text-center max-w-2xl mx-auto mb-8">
                Enter your hotel, Airbnb, or starting address below to see estimated
                driving time to the venue — or tap a popular location for a quick check.
              </p>
              <TravelTimeChecker />
            </div>
            <SectionDivider />
        */}

        {/* Live Weather Forecast */}
        <WeatherForecast
          weddingDate={settings?.weddingDate ?? null}
          timelineEvents={timelineEvents.map((e) => ({
            id: e.id,
            title: e.title,
            time: e.time,
            icon: e.icon ?? undefined,
            sortOrder: e.sortOrder,
          }))}
        />

        <SectionDivider />

        <TravelThingsToDo
          featuredPark={featuredPark}
          themeParks={themeParks}
          restaurants={restaurants}
          localActivities={localActivities}
          raffleTicketCount={raffleTicketCount}
        />

        {/* Additional Travel Content */}
        {settings?.travelContent && (
          <>
            <SectionDivider />
            <div className="max-w-3xl mx-auto">
              <div
                className="text-ivory/80 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(settings.travelContent.replace(/\n/g, "<br />")),
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
