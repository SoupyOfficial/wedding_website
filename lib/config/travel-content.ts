// Static travel content for the Travel & Stay page.
// Raw data lives in travel-content.data.json — edit that file to update content.
// Move to DB/admin in a future phase for runtime editing.

import rawData from "./travel-content.data.json";

// ─── TypeScript interfaces ──────────────────────────────────────────

export interface Airport {
  name: string;
  code: string;
  subtitle: string;
  details: string[];
  website?: string;
}

export interface TransportOption {
  name: string;
  description: string;
  details: string[];
  website?: string;
}

export interface RailOrDriveOption {
  name: string;
  description: string;
  /** Use `{{parkingInfo}}` as a placeholder for the dynamic parking info from settings. */
  details: string[];
  website?: string;
}

export interface FeaturedPark {
  name: string;
  icon: string;
  description: string;
  subParks: { name: string; description: string }[];
  details: string[];
  website?: string;
}

export interface ThemePark {
  name: string;
  icon: string;
  distance: string;
  description: string;
  website?: string;
}

export interface Restaurant {
  name: string;
  icon: string;
  meta: string;
  description: string;
  website?: string;
  mapUrl?: string;
}

export interface LocalActivity {
  name: string;
  icon: string;
  description: string;
  website?: string;
}

export interface TrafficTip {
  icon: string;
  title: string;
  description: string;
}

export interface KeyDestination {
  name: string;
  address: string;
  icon: string;
  estimatedTime: string;
  note?: string;
  trafficWarning?: string;
}

export interface NearbyHotel {
  name: string;
  area: string;
  driveTime: string;
  note?: string;
  searchUrl?: string;
}

// ─── Data re-exports (sourced from JSON) ────────────────────────────

export const airports = rawData.airports as Airport[];
export const groundTransport = rawData.groundTransport as TransportOption[];
export const railAndDriving = rawData.railAndDriving as RailOrDriveOption[];
export const featuredPark = rawData.featuredPark as FeaturedPark;
export const themeParks = rawData.themeParks as ThemePark[];
export const restaurants = rawData.restaurants as Restaurant[];
export const localActivities = rawData.localActivities as LocalActivity[];
export const nearbyHotels = rawData.nearbyHotels as NearbyHotel[];
export const trafficTips = rawData.trafficTips as TrafficTip[];
export const keyDestinations = rawData.keyDestinations as KeyDestination[];

export const DEFAULT_PARKING_INFO = "Free parking is available on-site at the venue";
