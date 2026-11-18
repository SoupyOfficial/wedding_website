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
  /** When true, shows in the primary nav bar (limit to 5-6 items). Other links go in footer/homepage tiles. */
  primary?: boolean;
}

export interface AdminNavItem {
  href: string;
  label: string;
  icon: string;
}

export const publicNavLinks: PublicNavLink[] = [
  { href: "/", label: "Home" },
  { href: "/our-story", label: "Our Story", featureFlag: "ourStoryPageEnabled", primary: true },
  { href: "/gallery", label: "Gallery", featureFlag: "galleryPageEnabled", primary: true },
  { href: "/photos-of-us", label: "Share Photos", featureFlag: "photosOfUsPageEnabled", primary: true },
];

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/photos", label: "Photos", icon: "📸" },
  { href: "/admin/features", label: "Features", icon: "🔧" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];
