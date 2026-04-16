// ─────────────────────────────────────────────────────────────────────
// AUTO-GENERATED from prisma/schema.prisma — do not edit by hand.
// Run: npx tsx scripts/generate-db-types.ts
// Date fields are ISO 8601 strings (as stored by Prisma in SQLite).
// Boolean fields are converted to JS booleans via toBool().
// ─────────────────────────────────────────────────────────────────────

export interface SiteSettings {
  id: string;
  coupleName: string;
  weddingDate: string | null;
  weddingTime: string | null;
  rsvpDeadline: string | null;
  rsvpEnabled: boolean;
  venueName: string;
  venueAddress: string;
  ceremonyType: string;
  dressCode: string;
  contactEmailJoint: string;
  contactEmailBride: string;
  contactEmailGroom: string;
  photoShareLink: string;
  heroTagline: string;
  heroTaglinePostWedding: string;
  ourStoryContent: string;
  travelContent: string;
  faqContent: string;
  preWeddingContent: string;
  postWeddingContent: string;
  childrenPolicy: string;
  parkingInfo: string;
  weatherInfo: string;
  sitePasswordEnabled: boolean;
  sitePassword: string;
  notifyOnRsvp: boolean;
  notificationEmail: string;
  ogImage: string;
  ogDescription: string;
  weddingHashtag: string;
  bannerText: string;
  bannerUrl: string;
  bannerActive: boolean;
  bannerColor: string;
  socialInstagram: string;
  socialFacebook: string;
  socialTikTok: string;
  registryNote: string;
  entertainmentNote: string;
  raffleTicketCount: number;
  updatedAt: string;
}

export const SETTINGS_BOOLS = [
  "rsvpEnabled",
  "sitePasswordEnabled",
  "notifyOnRsvp",
  "bannerActive",
] as const;

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  group: string | null;
  rsvpStatus: string;
  plusOneAllowed: boolean;
  plusOneName: string | null;
  plusOneAttending: boolean;
  mealPreference: string | null;
  dietaryNeeds: string | null;
  songRequest: string | null;
  childrenCount: number;
  childrenNames: string | null;
  tableNumber: number | null;
  notes: string | null;
  rsvpRespondedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const GUEST_BOOLS = [
  "plusOneAllowed",
  "plusOneAttending",
] as const;

export interface WeddingPartyMember {
  id: string;
  name: string;
  role: string;
  side: string;
  relationToBrideOrGroom: string;
  spouseOrPartner: string;
  bio: string;
  photoUrl: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  time: string;
  description: string;
  icon: string | null;
  sortOrder: number;
  eventType: string;
  createdAt: string;
  updatedAt: string;
}

export interface Hotel {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  bookingLink: string;
  blockCode: string;
  blockDeadline: string | null;
  notes: string;
  distanceFromVenue: string;
  priceRange: string;
  amenities: string;
  sortOrder: number;
}

export interface RegistryItem {
  id: string;
  name: string;
  url: string;
  iconUrl: string | null;
  sortOrder: number;
  itemType: string;
  price: number | null;
  totalNeeded: number | null;
  totalBought: number;
  goalAmount: number | null;
  raisedAmount: number;
  description: string | null;
  status: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isVisible: boolean;
}

export const FAQ_BOOLS = [
  "isVisible",
] as const;

export interface Photo {
  id: string;
  url: string;
  caption: string;
  category: string;
  sortOrder: number;
  approved: boolean;
  uploadedBy: string | null;
  storageKey: string | null;
  takenAt: string | null;
  createdAt: string;
}

export const PHOTO_BOOLS = [
  "approved",
] as const;

export interface PhotoTag {
  id: string;
  name: string;
  type: string;
  color: string;
  sortOrder: number;
  createdAt: string;
}

export interface Entertainment {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  sortOrder: number;
  isVisible: boolean;
}

export interface GuestBookEntry {
  id: string;
  name: string;
  message: string;
  isVisible: boolean;
  createdAt: string;
}

export const GUESTBOOK_BOOLS = [
  "isVisible",
] as const;

export interface MealOption {
  id: string;
  name: string;
  description: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isAvailable: boolean;
  sortOrder: number;
}

export const MEAL_BOOLS = [
  "isVegetarian",
  "isVegan",
  "isGlutenFree",
  "isAvailable",
] as const;

export interface SongRequest {
  id: string;
  guestName: string;
  songTitle: string;
  artist: string;
  artworkUrl: string | null;
  previewUrl: string | null;
  approved: boolean;
  isVisible: boolean;
  createdAt: string;
}

export const SONG_BOOLS = [
  "approved",
  "isVisible",
] as const;

export interface DJList {
  id: string;
  songName: string;
  artist: string;
  listType: string;
  playTime: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  enabled: number | boolean;
  description: string;
  updatedAt: string;
}

export interface WebhookLog {
  id: string;
  provider: string;
  eventType: string;
  payload: string;
  status: string;
  error: string | null;
  receivedAt: string;
  processedAt: string | null;
}

export interface IntegrationConfig {
  id: string;
  moduleId: string;
  enabled: boolean;
  config: string;
  lastSyncAt: string | null;
  syncStatus: string;
  syncError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminActivityLog {
  id: string;
  action: string;
  description: string;
  entityType: string | null;
  entityId: string | null;
  metadata: string;
  adminEmail: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const MESSAGE_BOOLS = [
  "isRead",
] as const;

export interface RegistryContribution {
  id: string;
  registryItemId: string;
  guestName: string;
  guestEmail: string | null;
  amount: number | null;
  status: string;
  createdAt: string;
}

// ─── Manual additions (derived types) ────────────────────────────────

/** Photo with its related tags (joined manually via _PhotoToPhotoTag). */
export interface PhotoWithTags extends Photo {
  tags: PhotoTag[];
}

/** PhotoTag with the count of associated photos. */
export interface PhotoTagWithCount extends PhotoTag {
  _count: { photos: number };
}
