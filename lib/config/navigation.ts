/**
 * Navigation link configuration for public and admin areas.
 * Add/remove/reorder pages by editing these arrays — no component changes needed.
 */

export interface PublicNavLink {
  href: string;
  label: string;
  hidePostWedding?: boolean;
  showPostWedding?: boolean;
  featureFlag?: string;
}

export interface AdminNavItem {
  href: string;
  label: string;
  icon: string;
}

export const publicNavLinks: PublicNavLink[] = [
  { href: "/", label: "Home" },
  { href: "/our-story", label: "Our Story", featureFlag: "ourStoryPageEnabled" },
  { href: "/event-details", label: "Event Details", featureFlag: "eventDetailsPageEnabled" },
  { href: "/travel", label: "Travel & Stay", featureFlag: "travelPageEnabled" },
  { href: "/wedding-party", label: "Wedding Party", featureFlag: "weddingPartyPageEnabled" },
  { href: "/entertainment", label: "Entertainment", featureFlag: "entertainmentPageEnabled" },
  { href: "/music", label: "Song Requests", featureFlag: "musicPageEnabled" },
  { href: "/rsvp", label: "RSVP", hidePostWedding: true, featureFlag: "rsvpEnabled" },
  { href: "/registry", label: "Registry", featureFlag: "registryPageEnabled" },
  { href: "/faq", label: "FAQ", featureFlag: "faqPageEnabled" },
  { href: "/gallery", label: "Gallery", featureFlag: "galleryPageEnabled" },
  { href: "/photos-of-us", label: "Photos of Us", featureFlag: "photosOfUsPageEnabled" },
  { href: "/guest-book", label: "Guest Book", featureFlag: "guestBookEnabled" },
  { href: "/contact", label: "Contact", featureFlag: "contactPageEnabled" },
];

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/guests", label: "Guests", icon: "👥" },
  { href: "/admin/content", label: "Timeline", icon: "📝" },
  { href: "/admin/faqs", label: "FAQs", icon: "❓" },
  { href: "/admin/wedding-party", label: "Wedding Party", icon: "💐" },
  { href: "/admin/photos", label: "Photos", icon: "📸" },
  { href: "/admin/registry", label: "Registry", icon: "🎁" },
  { href: "/admin/hotels", label: "Hotels", icon: "🏨" },
  { href: "/admin/entertainment", label: "Entertainment", icon: "🎉" },
  { href: "/admin/music", label: "Music & DJ", icon: "🎵" },
  { href: "/admin/meals", label: "Meals", icon: "🍽️" },
  { href: "/admin/guest-book", label: "Guest Book", icon: "📖" },
  { href: "/admin/communications", label: "Communications", icon: "✉️" },
  { href: "/admin/features", label: "Features", icon: "🔧" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];
