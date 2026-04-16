import type { SiteSettings } from "@/lib/db-types";

// ─── Domain Projections (ISP) ───────────────────────────────────────
// Each type selects only the fields its consumers need.
// Derived from auto-generated SiteSettings to stay in sync with schema.

export type CoupleSettings = Pick<
  SiteSettings,
  "coupleName" | "weddingDate" | "weddingTime" | "rsvpDeadline" | "rsvpEnabled"
>;

export type VenueSettings = Pick<
  SiteSettings,
  "venueName" | "venueAddress" | "ceremonyType" | "dressCode"
>;

export type ContactSettings = Pick<
  SiteSettings,
  "contactEmailJoint" | "contactEmailBride" | "contactEmailGroom"
>;

export type SocialSettings = Pick<
  SiteSettings,
  "socialInstagram" | "socialFacebook" | "socialTikTok" | "weddingHashtag"
>;

export type ContentSettings = Pick<
  SiteSettings,
  | "heroTagline"
  | "heroTaglinePostWedding"
  | "ourStoryContent"
  | "travelContent"
  | "faqContent"
  | "preWeddingContent"
  | "postWeddingContent"
  | "childrenPolicy"
  | "parkingInfo"
  | "weatherInfo"
  | "registryNote"
  | "entertainmentNote"
  | "photoShareLink"
>;

export type BannerSettings = Pick<
  SiteSettings,
  "bannerText" | "bannerUrl" | "bannerActive" | "bannerColor"
>;

export type PasswordSettings = Pick<
  SiteSettings,
  "sitePasswordEnabled" | "sitePassword"
>;

export type NotificationSettings = Pick<
  SiteSettings,
  "notifyOnRsvp" | "notificationEmail"
>;

export type DisplaySettings = Pick<
  SiteSettings,
  "ogImage" | "ogDescription" | "raffleTicketCount"
>;
