// ─── Play Time Options ────────────────────────────────────────
export const PLAY_TIME_OPTIONS = [
  { value: "", label: "Anytime" },
  { value: "Ceremony", label: "Ceremony" },
  { value: "Cocktail Hour", label: "Cocktail Hour" },
  { value: "Dinner", label: "Dinner" },
  { value: "First Dance", label: "First Dance" },
  { value: "Father-Daughter Dance", label: "Father-Daughter Dance" },
  { value: "Mother-Son Dance", label: "Mother-Son Dance" },
  { value: "Cake Cutting", label: "Cake Cutting" },
  { value: "Bouquet Toss", label: "Bouquet Toss" },
  { value: "Garter Toss", label: "Garter Toss" },
  { value: "Party", label: "Party" },
  { value: "Last Dance", label: "Last Dance" },
  { value: "Send Off", label: "Send Off" },
] as const;

// ─── DJ List Types ────────────────────────────────────────────
export const DJ_LIST_TYPES = [
  { value: "must-play", label: "Must Play" },
  { value: "do-not-play", label: "Do Not Play" },
] as const;

// ─── RSVP Statuses ────────────────────────────────────────────
export const RSVP_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "attending", label: "Attending" },
  { value: "declined", label: "Declined" },
] as const;

// ─── Timeline Event Types ─────────────────────────────────────
export const TIMELINE_EVENT_TYPES = [
  { value: "wedding-day", label: "Wedding Day" },
  { value: "pre-wedding", label: "Pre-Wedding" },
  { value: "post-wedding", label: "Post-Wedding" },
] as const;
