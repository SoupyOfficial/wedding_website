## Plan: Wedding Website with Admin Portal

Build a full-stack wedding website for **Jacob & Ashley Campbell** (the "Forever Campbells") with two parts: (1) a public-facing guest site featuring a **celestial/starry night** theme in **blues, golds, and shades of green**, and (2) a private admin dashboard for the couple to upload photos, manage RSVPs, and update all wedding details — without needing to touch code.

---

## Wedding Reference Data (Source of Truth)

All default/seed content for the website should come from the details below. The admin panel will allow the couple to edit all of this after launch.

### Couple

- **Bride:** Ashley
- **Groom:** Jacob Campbell
- **Joint brand/domain name:** Forever Campbells (email domain: forevercampbells)
- **Contact emails (display order):** Joint email first, then Jacob's, then Ashley's (actual addresses to be entered via admin)
- **Wedding hashtag:** TBD (e.g., `#ForeverCampbells`, `#CampbellsUnderTheStars`) — editable via admin. Display prominently on the public site (hero, footer, photo share page, guest book) to encourage social media use.

### Venue

- **Name:** The Highland Manor
- **Location:** Apopka, Florida
- **Ceremony:** Outdoor
- **Reception:** Indoor
- **Duration:** 5 hours event time + 2 hours getting-ready time (7 hours total on-site)
- **Parking:** Available on-site (details editable via admin)
- **What the venue handles:** All food & beverage, dessert packages

### Date & Time

- **Wedding date:** 11/13/26 (editable via admin)
- **RSVP deadline:** TBD (editable via admin)

### Guest Details

- **Target guest count:** Under 130
- **Immediate family & bridal party:** 24 people
- **Children policy:** Children are allowed; age limits and kid-specific activities to be determined (editable via admin). Babysitter(s) will be arranged for the event.
- **Plus-ones policy:** Details editable via admin

### Wedding Party

#### Bridesmaids (Bride's Side)

| Name    | Role       | Relation to Bride | Spouse/Partner | Bio        |
| ------- | ---------- | ----------------- | -------------- | ---------- |
| Jessica | Bridesmaid | (editable)        | (editable)     | (editable) |
| Sarena  | Bridesmaid | (editable)        | (editable)     | (editable) |
| Carolyn | Bridesmaid | (editable)        | (editable)     | (editable) |
| Kayla   | Bridesmaid | (editable)        | (editable)     | (editable) |
| Rachel  | Bridesmaid | (editable)        | (editable)     | (editable) |
| Milan   | Bridesmaid | (editable)        | (editable)     | (editable) |

#### Groomsmen (Groom's Side)

| Name      | Role      | Relation to Groom | Spouse/Partner | Bio        |
| --------- | --------- | ----------------- | -------------- | ---------- |
| Lori      | Best Man  | (editable)        | (editable)     | (editable) |
| Semih     | Groomsman | (editable)        | (editable)     | (editable) |
| David     | Groomsman | (editable)        | (editable)     | (editable) |
| Andrew    | Groomsman | (editable)        | (editable)     | (editable) |
| Nathaniel | Groomsman | (editable)        | (editable)     | (editable) |
| Cole      | Groomsman | (editable)        | (editable)     | (editable) |

#### Special Roles

- **Flower Girl:** Alara
- **Ring Bearers:** Aiden, Arthur, and Henry

### Hotels (for Guest Accommodations)

List these as recommended hotels with links (editable via admin). All are near Apopka, FL:

1. **Hilton Garden Inn Apopka City Center** — (link, room block info editable)
2. **Embassy Suites by Hilton** — (link, room block info editable)
3. **Hampton Inn Apopka** — (link, room block info editable)

### Travel Information

Pre-populate these sections with placeholder text that the couple fills in via admin:

- **Airports:** Orlando International Airport (MCO), Orlando Sanford International (SFB)
- **Getting around:** Rental cars recommended; rideshare available
- **Brightline:** High-speed rail service connecting South Florida to Orlando
- **Local highways:** I-4, FL-429, US-441 for access to Apopka area
- **Weather:** Central Florida in [wedding month] — expect warm/humid weather. Ceremony is outdoors, so dress accordingly. Suggest light, breathable fabrics.

### Things to Do in the Area

- **Theme parks:** Walt Disney World, Universal Studios, SeaWorld (all within ~30 min). Include note that a raffle for a theme park ticket may be held at the reception.
- **Dining in the area:** Editable list via admin
- **Other activities:** Editable list via admin (springs, nature parks, shopping, etc.)

### Design & Theme

- **Theme:** Celestial / Starry Night
- **Motifs:** Twinkle lights, moon arch, stars, constellations
- **Color palette:**
  - **Primary:** Deep navy / midnight blue (`#0B1D3A`), Royal blue (`#1E3A6E`)
  - **Accent:** Gold (`#D4A843`), Warm gold (`#C9952B`)
  - **Secondary:** Forest green (`#2D5F3E`), Sage green (`#7A9E7E`)
  - **Neutrals:** Ivory/cream (`#FAF8F0`), Soft white (`#FFFFFF`)
  - **Text on dark:** Ivory (`#FAF8F0`), Gold (`#D4A843`)
  - **Text on light:** Deep navy (`#0B1D3A`)
- **Visual effects for the website:**
  - Animated twinkling stars on dark backgrounds (CSS or Canvas)
  - Subtle constellation line art as decorative accents
  - Moon/crescent motifs in section dividers
  - Gold shimmer/glow effects on headings
  - Gradient backgrounds from deep navy to midnight
- **Typography:** Elegant serif font for headings (e.g., Playfair Display), clean sans-serif for body (e.g., Lato or Inter)
- **Guest book concept:** "Sign a star" — celestial-themed

### Food & Beverage (Info for Guests)

- **Cocktail hour food:** Provided (menu details editable via admin)
- **Reception dinner:** Sit-down or buffet (details editable via admin)
- **Dessert:** Option for 8" cake + assortment of 6 mini dessert varieties
- **Bar:** Open bar (details editable — options include domestic beer, wine, premium liquor, signature cocktails)
- **Signature drinks:** Names and descriptions editable via admin
- **Late night snack:** TBD (editable via admin)
- **Dietary accommodations:** Note on RSVP form for guests to specify allergies/restrictions

### Entertainment & Activities (at the Reception)

- Caricature artist
- Photo booth (with backdrop and props)
- Tattoos & glitter bar
- Paint by numbers
- Themed crossword puzzles
- DJ & dancing

### Guest Favors

- Candy
- Photo booth prints, professional photo prints, caricature drawings

### Send-Off

- DIY light wands
- Ribbon wands

### Registry

- **Amazon** (link editable via admin)
- **Honeymoon / Cash Fund** — Optional cash gift registry (e.g., link to Venmo, Zelle, or a honeymoon fund platform like Honeyfund). Editable via admin.
- Additional registries can be added via admin

### Pre-Wedding Events

- **Rehearsal dinner:** Date, time, location, and details all editable via admin. Note: there will be accompanying food options for guests not at the rehearsal dinner.

### Post-Wedding Events

- **Post-wedding brunch/breakfast:** Possibly Saturday morning, possibly at the hotel. Details editable via admin.

### Unplugged Ceremony

- **No photos during the ceremony** — Display prominent notice on the website's event details and FAQ sections. The professional photographer will capture everything.

### Photo Sharing

- **Link to share photos:** Provide a link (editable via admin) where guests can upload/share their photos from the wedding. Could be Google Photos shared album, Dropbox, or similar.
- **Wedding hashtag reminder:** Display the hashtag prominently alongside the photo share link so guests tag their social posts.

---

## Technical Implementation Steps

### Step 1: Initialize the Next.js Project

- **Framework:** Next.js 14+ (App Router) with TypeScript
- **Styling:** Tailwind CSS 3+ with custom theme tokens for the celestial color palette above
- **Database:** SQLite via Prisma ORM (simple, free, no external DB needed for MVP)
- **Auth:** NextAuth.js v5 with Credentials provider (single admin login for Jacob & Ashley)
- **File uploads:** Local `/public/uploads` directory for MVP; migration path to Vercel Blob / S3 via `IStorageProvider` swap (see Step 8)
- **Architecture:** Provider-based service layer + event bus + feature module system for extensibility (see Step 8)
- **Validation:** Zod schemas for all API inputs and module configurations
- **Route structure:**
  ```
  /app/(public)/                → Public guest-facing pages
  /app/(public)/page.tsx        → Home / Hero with countdown
  /app/(public)/our-story/      → Love story timeline
  /app/(public)/photos-of-us/   → Couple photo gallery (engagement shoots, etc.)
  /app/(public)/event-details/  → Venue, timeline, parking, map
  /app/(public)/travel/         → Hotels, airports, transport, area info
  /app/(public)/wedding-party/  → Bridal party members
  /app/(public)/entertainment/  → Reception activities & fun for guests
  /app/(public)/rsvp/           → RSVP form (with song request)
  /app/(public)/registry/       → Gift registry links
  /app/(public)/faq/            → Frequently asked questions
  /app/(public)/gallery/        → Wedding photo gallery
  /app/(public)/guest-book/     → Digital guest book (leave messages & well-wishes)
  /app/(public)/contact/         → Contact page with couple's info & message form
  /app/admin/                   → Admin dashboard (auth-protected)
  /app/admin/dashboard/         → RSVP stats overview + new RSVP alerts
  /app/admin/guests/            → Guest list & RSVP management
  /app/admin/content/           → Edit all page content sections
  /app/admin/wedding-party/     → Manage party members & photos
  /app/admin/photos/            → Upload/manage gallery photos
  /app/admin/music/             → View song requests, manage love/hate lists
  /app/admin/meal-options/      → Configure meal choices for RSVP dropdown
  /app/admin/guest-book/        → View/moderate guest book entries
  /app/admin/communications/    → Mass emails & guest messaging hub
  /app/admin/settings/          → Site settings, deadlines, links, site password
  /app/admin/settings/integrations/ → Manage third-party integrations (registry, photo, etc.)
  /app/admin/settings/features/ → Feature flag toggles
  /app/api/                     → API routes for CRUD operations
  /app/api/v1/                  → Versioned REST API (see Step 8.6)
  /app/api/v1/webhooks/         → Incoming webhooks from integrations
  /lib/providers/               → Service provider abstractions (storage, email, notifications)
  /lib/modules/                 → Feature modules (rsvp, gallery, registry, etc.)
  /lib/integrations/            → Third-party integration connectors
  /lib/events/                  → Event bus for cross-module communication
  /lib/config/                  → Feature flags & app configuration
  /lib/api/                     → API utilities (response envelope, middleware chain)
  /lib/data/                    → Import/export framework (CSV, JSON, PDF)
  /middleware.ts                → Site-wide guest password gate
  ```

### Step 2: Database Schema (Prisma)

Design these models:

```prisma
model SiteSettings {
  id                String   @id @default("singleton")
  coupleName        String   @default("Jacob & Ashley")
  weddingDate       DateTime?
  weddingTime       String?
  rsvpDeadline      DateTime?
  rsvpEnabled       Boolean  @default(true)
  venueName         String   @default("The Highland Manor")
  venueAddress      String   @default("Apopka, Florida")
  ceremonyType      String   @default("Outdoor Ceremony & Indoor Reception")
  dressCode         String   @default("")
  contactEmailJoint String   @default("")
  contactEmailBride String   @default("")
  contactEmailGroom String   @default("")
  photoShareLink    String   @default("")
  heroTagline       String   @default("We're getting married!")
  heroTaglinePostWedding String @default("We did it! 🎉")
  ourStoryContent   String   @default("") // Rich text / markdown
  travelContent     String   @default("") // Rich text / markdown
  faqContent        String   @default("") // Rich text / markdown
  preWeddingContent String   @default("")
  postWeddingContent String  @default("")
  childrenPolicy    String   @default("")
  parkingInfo       String   @default("")
  weatherInfo       String   @default("")
  // Site-wide guest password protection (not admin auth)
  sitePasswordEnabled Boolean @default(false)
  sitePassword      String   @default("") // Simple passphrase like "forevercampbells"
  // RSVP email notifications
  notifyOnRsvp      Boolean  @default(true)
  notificationEmail String   @default("") // Where to send RSVP alerts
  // OG / Social sharing meta
  ogImage           String   @default("") // URL to social preview image
  ogDescription     String   @default("We're getting married! Join us for our celebration.")
  weddingHashtag    String   @default("")   // e.g., "#ForeverCampbells"
  // Announcement banner
  bannerText        String   @default("")   // e.g., "RSVP deadline is May 1st!"
  bannerUrl         String   @default("")   // Optional link URL
  bannerActive      Boolean  @default(false)
  bannerColor       String   @default("gold") // "gold" or "forest"
  // Social media links
  socialInstagram   String   @default("")
  socialFacebook    String   @default("")
  socialTikTok      String   @default("")
  updatedAt         DateTime @updatedAt
}

model Guest {
  id              String   @id @default(cuid())
  firstName       String
  lastName        String
  email           String?
  phone           String?
  group           String?  // e.g., "Bride's Family", "Groom's Friends"
  rsvpStatus      String   @default("pending") // pending, attending, declined
  plusOneAllowed   Boolean  @default(false)
  plusOneName      String?
  plusOneAttending Boolean  @default(false)
  mealPreference  String?
  dietaryNeeds    String?
  songRequest     String?  // Guest's song request for the DJ
  childrenCount   Int      @default(0)
  childrenNames   String?
  tableNumber     Int?
  notes           String?
  rsvpRespondedAt DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model WeddingPartyMember {
  id             String  @id @default(cuid())
  name           String
  role           String  // "Bridesmaid", "Groomsman", "Flower Girl", "Ring Bearer"
  side           String  // "bride", "groom"
  relationToBrideOrGroom String @default("")
  spouseOrPartner String @default("")
  bio            String  @default("")
  photoUrl       String?
  sortOrder      Int     @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model TimelineEvent {
  id          String   @id @default(cuid())
  title       String
  time        String
  description String   @default("")
  icon        String?
  sortOrder   Int      @default(0)
  eventType   String   @default("wedding-day") // "wedding-day", "pre-wedding", "post-wedding"
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Hotel {
  id          String  @id @default(cuid())
  name        String
  address     String  @default("")
  phone       String  @default("")
  website     String  @default("")
  bookingLink String  @default("")
  blockCode   String  @default("")
  blockDeadline DateTime?
  notes       String  @default("")
  sortOrder   Int     @default(0)
}

model RegistryItem {
  id        String @id @default(cuid())
  name      String
  url       String
  iconUrl   String?
  sortOrder Int    @default(0)
}

model FAQ {
  id        String @id @default(cuid())
  question  String
  answer    String
  sortOrder Int    @default(0)
}

model Photo {
  id        String   @id @default(cuid())
  url       String
  caption   String   @default("")
  category  String   @default("gallery") // "gallery", "our-story", "hero"
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
}

model Entertainment {
  id          String @id @default(cuid())
  name        String
  description String @default("")
  icon        String?
  sortOrder   Int    @default(0)
}

model GuestBookEntry {
  id        String   @id @default(cuid())
  name      String
  message   String
  isVisible Boolean  @default(true) // Admin can moderate/hide entries
  createdAt DateTime @default(now())
}

model MealOption {
  id          String  @id @default(cuid())
  name        String  // e.g., "Chicken", "Steak", "Fish", "Vegetarian"
  description String  @default("") // e.g., "Herb-crusted chicken breast with..."
  isAvailable Boolean @default(true)
  sortOrder   Int     @default(0)
}

model SongRequest {
  id        String   @id @default(cuid())
  guestName String
  songTitle String
  artist    String   @default("")
  createdAt DateTime @default(now())
}

model DJList {
  id       String @id @default(cuid())
  songName String
  artist   String @default("")
  listType String // "love" or "hate"
}

model FeatureFlag {
  id          String   @id @default(cuid())
  key         String   @unique   // e.g., "rsvpEnabled", "registrySyncEnabled"
  enabled     Boolean  @default(false)
  description String   @default("")
  updatedAt   DateTime @updatedAt
}

model WebhookLog {
  id          String   @id @default(cuid())
  provider    String                        // e.g., "amazon", "google-photos"
  eventType   String                        // e.g., "item.purchased", "photo.added"
  payload     String                        // JSON stringified
  status      String   @default("received") // received, processed, failed
  error       String?
  receivedAt  DateTime @default(now())
  processedAt DateTime?
}

model IntegrationConfig {
  id          String   @id @default(cuid())
  moduleId    String   @unique              // e.g., "amazon-registry", "google-photos"
  enabled     Boolean  @default(false)
  config      String   @default("{}")       // JSON stringified config per integration
  lastSyncAt  DateTime?
  syncStatus  String   @default("idle")     // idle, syncing, error
  syncError   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model AdminActivityLog {
  id          String   @id @default(cuid())
  action      String                        // e.g., "guest.created", "settings.updated", "photo.uploaded"
  description String                        // Human-readable: "Added guest John Smith"
  entityType  String?                       // e.g., "Guest", "Photo", "SiteSettings"
  entityId    String?                       // ID of the affected record
  metadata    String   @default("{}")       // JSON: additional context (old/new values, counts, etc.)
  adminEmail  String   @default("")         // Which admin performed the action
  createdAt   DateTime @default(now())
}

model ContactMessage {
  id        String   @id @default(cuid())
  name      String
  email     String
  message   String
  isRead    Boolean  @default(false)        // Admin can mark as read
  createdAt DateTime @default(now())
}

model EmailTemplate {
  id          String   @id @default(cuid())
  slug        String   @unique              // e.g., "save-the-date", "rsvp-reminder"
  name        String                        // Human-readable: "Save the Date"
  subject     String                        // Email subject line (supports {{variables}})
  body        String                        // Rich text / HTML body (supports {{variables}})
  category    String   @default("custom")   // "system" (built-in) or "custom" (user-created)
  variables   String   @default("[]")       // JSON array of available merge variables
  isDefault   Boolean  @default(false)       // true = seeded template, can't be deleted
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model EmailCampaign {
  id              String   @id @default(cuid())
  name            String                        // Internal name: "RSVP Reminder — Feb 2026"
  templateId      String?                       // FK to EmailTemplate (optional, can use custom content)
  subject         String                        // Final subject line (after variable resolution)
  body            String                        // Final body content
  audienceFilter  String   @default("{}")       // JSON: { rsvpStatus?, group?, hasEmail?, custom? }
  recipientCount  Int      @default(0)           // Calculated at send time
  status          String   @default("draft")    // draft, scheduled, sending, sent, failed, cancelled
  scheduledAt     DateTime?                     // null = manual send; set = scheduled
  sentAt          DateTime?                     // When sending actually began
  completedAt     DateTime?                     // When all emails finished
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  logs            EmailLog[]
}

model EmailLog {
  id          String   @id @default(cuid())
  campaignId  String                            // FK to EmailCampaign
  campaign    EmailCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  guestId     String                            // FK to Guest
  email       String                            // Recipient email (snapshot at send time)
  status      String   @default("pending")      // pending, sent, delivered, bounced, failed
  error       String?
  sentAt      DateTime?
  deliveredAt DateTime?
  openedAt    DateTime?                         // Future: track opens via pixel/webhook
  createdAt   DateTime @default(now())
}
```

### Step 3: Build Public Guest Pages

Each page pulls data from the database (via server components) and renders with the celestial theme.

**Home / Hero Page (`/`):**

- Full-viewport hero section with animated starry sky background (CSS + canvas)
- Couple names "Jacob & Ashley" in elegant gold serif font
- Wedding date (or "Date Coming Soon") with live countdown timer (client component)
- Tagline: "We're getting married!" (editable via `heroTagline`)
- Moon crescent decorative element
- Navigation to all sections
- Smooth scroll or page links
- **Post-wedding behavior:** When the wedding date has passed, the countdown flips to "We did it! 🎉" (editable via `heroTaglinePostWedding`). The RSVP link hides from nav, and the Photo Share / Guest Book links become more prominent.
- **Site-wide password gate:** If `sitePasswordEnabled` is true, a middleware intercepts all `(public)` routes and shows a simple passphrase entry screen (e.g., "Enter the password to view our wedding website"). The passphrase is stored in a cookie after correct entry so guests don't re-enter it every visit. The admin routes use separate NextAuth authentication.

**Our Story (`/our-story`):**

- Vertical timeline layout with alternating left/right entries
- Each entry: photo, date, description
- Content loaded from `SiteSettings.ourStoryContent` + `Photo` records where category = "our-story"
- Constellation line art connecting timeline dots

**Photos of Us (`/photos-of-us`):**

- Dedicated gallery of the couple's photos: engagement shoots, dating photos, milestones
- Distinct from the general wedding gallery (which is for event-day photos)
- Pulls from `Photo` model where category = "photos-of-us"
- Masonry or carousel layout with lightbox
- Initially empty; couple uploads via admin

**Event Details (`/event-details`):**

- Ceremony section: "Outdoor Ceremony at The Highland Manor"
- Reception section: "Indoor Reception at The Highland Manor"
- **"Add to Calendar" button** — generates downloadable .ics file and direct links for Google Calendar, Apple Calendar, and Outlook. Uses wedding date/time/venue from `SiteSettings`. Only visible when a wedding date is set.
- Day-of timeline pulled from `TimelineEvent` records where eventType = "wedding-day"
- Embedded Google Map (The Highland Manor, Apopka, FL)
- Parking information
- Note about unplugged ceremony (no phones/cameras)
- "5 hours of celebration + 2 hours getting ready time"

**Travel & Stay (`/travel`):**

- Hotel cards pulled from `Hotel` model (seed with: Hilton Garden Inn Apopka City Center, Embassy Suites by Hilton, Hampton Inn Apopka)
- Each hotel card: name, address, booking link, room block code/deadline
- Travel info sections: Airports (MCO, SFB), Brightline, Local Highways (I-4, FL-429, US-441), Getting Around
- Area highlights: Theme parks (Disney, Universal, SeaWorld ~30 min), dining, activities
- Weather advisory for Central Florida
- All content editable via admin

**Wedding Party (`/wedding-party`):**

- Two columns or tabbed: "Bride's Side" and "Groom's Side"
- Photo card for each member with: name, role, relation, bio
- Seed data for all 12 members + flower girl + 3 ring bearers
- Photos show placeholder silhouette until uploaded via admin

**Entertainment (`/entertainment`):**

- Fun, visual page showcasing all reception activities for guests
- Card grid pulled from `Entertainment` model, each with icon, name, description
- Activities seeded: Caricature artist, Photo booth, Tattoos & Glitter bar, Paint by numbers, Themed crossword, DJ & Dancing
- Mention of raffle for theme park ticket (if confirmed via admin)
- Builds guest excitement — "Here's what awaits you at the reception!"

**Guest Book (`/guest-book`):**

- Digital "Sign a Star" guest book (matching celestial theme)
- Simple form: Name + Message
- Displays all approved entries in a beautiful card/star layout, newest first
- Entries stored in `GuestBookEntry` model
- Admin can moderate: hide inappropriate entries via `/admin/guest-book`
- No login required to sign — but rate-limited to prevent spam

**RSVP (`/rsvp`):**

- Step 1: Guest looks up their name (search by first + last name against `Guest` table)
- Step 2: Confirm attendance (attending / declined)
- Step 3: If attending:
  - **Meal preference** — dropdown populated from `MealOption` model (admin configures choices like Chicken, Steak, Fish, Vegetarian)
  - **Dietary needs** — free text field for allergies/restrictions
  - **Plus-one name** (if `plusOneAllowed` is true for this guest) + plus-one meal preference
  - **Number of children + names**
  - **Song request** — optional field: "What song will get you on the dance floor?" (title + artist). Saved to `songRequest` on Guest record and also creates a `SongRequest` entry for the admin music dashboard.
- Shows RSVP deadline from `SiteSettings`
- Disabled/shows message after deadline passes (or after wedding date)
- Confirmation screen with summary of all selections
- **RSVP email notification:** On submission, if `notifyOnRsvp` is true, sends an email to `notificationEmail` with guest name, status, and details. Use a lightweight approach: Resend (free tier, 100 emails/day), or nodemailer with a Gmail app password. Fallback: skip email, just log to DB and show new RSVPs prominently on admin dashboard.
- Graceful error if name not found: "We couldn't find your name. Please contact us at [contact email]."

**Registry (`/registry`):**

- Card grid of registry links from `RegistryItem` model
- Seed with Amazon
- Each card: store logo/icon, store name, link button

**FAQ (`/faq`):**

- Accordion/expandable list from `FAQ` model
- Seed with these default Q&As:
  1. **What is the dress code?** — (editable, default: "Formal / Semi-Formal attire")
  2. **Can I bring a plus one?** — "Plus ones are by invitation only. Please check your RSVP for details."
  3. **Are children welcome?** — (editable, references children policy)
  4. **Can I take photos during the ceremony?** — "We kindly ask for an unplugged ceremony — no phones or cameras. Our professional photographer will capture every moment, and we'll share the photos with you afterward!"
  5. **What's the weather like?** — "Central Florida can be warm and humid. The ceremony is outdoors, so we recommend light, breathable fabrics. The reception is indoors and air-conditioned."
  6. **Is there parking?** — (editable, default: "Yes, free parking is available on-site at The Highland Manor.")
  7. **Will there be an open bar?** — (editable, default: "Yes! We'll have a full open bar with signature cocktails, wine, beer, and non-alcoholic options.")
  8. **What food will be served?** — (editable, default: "A full dinner will be served during the reception, with appetizers during cocktail hour and a late night snack.")
  9. **Where should I stay?** — "Check out our Travel & Stay page for our recommended hotels with room blocks."
  10. **How do I share my photos?** — "We'd love to see your photos! Use the link on our Photo Share page to upload them."

**Gallery (`/gallery`):**

- Masonry or grid layout of photos from `Photo` model where category = "gallery"
- This is for **wedding day / event photos** — distinct from the "Photos of Us" page (which is for couple's personal photos)
- Lightbox modal on click
- Initially empty; couple uploads photos via admin
- After the wedding, this becomes a primary destination (prominently linked from hero)

**Contact (`/contact`):**

- Clean page with the couple’s contact information (pulled from `SiteSettings` contact emails)
- Display order: joint email, then Jacob’s, then Ashley’s
- Optional **contact form** — simple name + email + message form that sends an email to `notificationEmail` via `IEmailProvider`, or stores in DB if no provider configured
- Links to social media profiles (editable via admin — Instagram, etc.)
- Wedding hashtag displayed prominently
- Useful for guests who have questions not covered by the FAQ

**Global Footer Component:**

- Appears on all public pages
- Content:
  - Couple names + wedding date (or “Coming Soon”)
  - Wedding hashtag (e.g., `#ForeverCampbells`) in stylized gold text
  - Quick navigation links to key pages (RSVP, Registry, FAQ, Contact)
  - Contact email (joint)
  - “Made with ❤️ by the Forever Campbells” or similar tagline
  - Social media icon links (if configured via admin)
- Celestial-themed: constellation line art or subtle star pattern as background
- Responsive: stacks vertically on mobile

**Global Navigation Component:**

- **Desktop:** Horizontal navbar with links to all public pages. Transparent overlay on hero, solid midnight background on scroll (sticky).
- **Mobile:** Hamburger menu icon → full-screen or slide-out drawer with all navigation links, couple’s names at top, celestial-themed background. Smooth open/close animation.
- **Active page indicator:** Gold underline or glow on current page link
- **Conditional links:** RSVP link hidden post-wedding; Gallery/Photo Share links promoted post-wedding
- **Logo/home link:** Couple’s names or monogram that links back to hero page

### Step 4: Build the Admin Dashboard

Protected by NextAuth.js credentials login. Single admin account (email + password set via environment variables).

**Admin Layout:**

- Sidebar navigation with links to all admin sections
- Clean, functional design (doesn't need celestial theme — use a simple light admin UI)
- Mobile-responsive

**Dashboard (`/admin/dashboard`):**

- RSVP summary cards:
  - Total invited: count of all `Guest` records
  - Attending: count where rsvpStatus = "attending"
  - Declined: count where rsvpStatus = "declined"
  - Pending: count where rsvpStatus = "pending"
  - Total headcount (including plus-ones and children)
  - Capacity indicator: headcount vs. 130 cap
- Recent RSVP activity list

**Guest Manager (`/admin/guests`):**

- Full table of all guests with columns: Name, Email, RSVP Status, Plus One, Meal, Dietary, Children, Table #
- Search/filter by name, status, group
- Add individual guest form
- Bulk import via CSV upload (columns: firstName, lastName, email, group, plusOneAllowed)
- Edit guest inline or in modal
- Export to CSV button
- Delete guest with confirmation

**Content Manager (`/admin/content`):**

- Tabbed or accordion sections for each editable content area:
  - Hero / Home (tagline, couple name display)
  - Our Story (rich text editor)
  - Event Details (parking info, venue notes)
  - Travel Info (rich text editor for all travel content)
  - FAQ (add/edit/delete/reorder FAQ items)
  - Pre-Wedding Events (rich text editor)
  - Post-Wedding Events (rich text editor)
  - Children Policy
  - Weather Info
- Save button per section with success toast

**Wedding Party Manager (`/admin/wedding-party`):**

- List of all party members, drag-to-reorder
- Add/Edit form: name, role (dropdown: Bridesmaid/Groomsman/Flower Girl/Ring Bearer), side (bride/groom), relation, spouse/partner, bio (text area), photo upload
- Delete with confirmation
- Photo preview with replace/remove option

**Photo Manager (`/admin/photos`):**

- Upload multiple photos (drag & drop zone)
- Assign category: Gallery, Our Story, Hero
- Add/edit captions
- Drag to reorder
- Delete with confirmation
- Thumbnail grid preview

**Timeline Manager (`/admin/timeline`):**

- Add/edit/delete/reorder timeline events
- Fields: title, time, description, event type (wedding-day / pre-wedding / post-wedding)

**Music & Song Requests (`/admin/music`):**

- **Song Requests tab:** Table of all guest song requests (guest name, song title, artist, date submitted). Searchable, sortable.
- **Songs We Love tab:** Add/edit/delete songs the couple wants played. Exportable list to share with DJ.
- **Songs We Hate tab:** Add/edit/delete songs the couple does NOT want played. "Do Not Play" list for DJ.
- Export all lists to CSV or printable format for DJ handoff.

**Meal Options (`/admin/meal-options`):**

- Add/edit/delete/reorder meal choices that appear in the RSVP dropdown
- Fields per option: name (e.g., "Herb-Crusted Chicken"), description, available toggle
- Summary count: how many guests selected each option

**Guest Book Moderation (`/admin/guest-book`):**

- Table of all guest book entries with: name, message, date, visibility toggle
- Hide/show individual entries (for moderation)
- Delete entries with confirmation

**Guest Communications (`/admin/communications`):**

A hub for sending mass update emails to guests. Built as a placeholder-ready system — the UI and data models ship fully functional, but the actual email-sending integration can be connected later (via `IEmailProvider`). Until an email provider is configured, a clear banner explains that emails will be queued but not delivered.

- **Campaigns tab — Create & manage email campaigns:**
  - "New Campaign" button → opens campaign composer
  - Campaign composer:
    - **Name** — internal label (e.g., "RSVP Reminder — March 2026")
    - **Template selector** — pick from saved templates or start blank
    - **Subject line** — supports merge variables: `{{firstName}}`, `{{lastName}}`, `{{rsvpStatus}}`, `{{weddingDate}}`, `{{rsvpDeadline}}`, `{{websiteUrl}}`
    - **Body editor** — rich text / markdown editor with merge variable insertion toolbar. Live preview pane showing how a sample guest would see the email.
    - **Audience picker** — choose recipients by filter:
      - All guests (with email addresses)
      - RSVP status: Pending / Attending / Declined
      - Guest group: Bride's Family, Groom's Friends, etc.
      - Has not responded (pending + no `rsvpRespondedAt`)
      - Custom filter (combine status + group)
    - **Recipient preview** — shows count and scrollable list of who will receive the email, with the option to manually exclude individuals
    - **Send options:**
      - "Send Now" — immediately queues all emails
      - "Schedule" — date/time picker for future send
      - "Save as Draft" — save without sending
    - **Send test email** — sends a preview to the admin's own email address before mass sending
  - Campaign list table: name, template used, audience, recipient count, status (draft / scheduled / sent / failed), sent date, open rate (future)
  - View campaign details: full send log per recipient (sent, delivered, bounced, failed)
  - Duplicate campaign (for re-sending similar updates)
  - Cancel scheduled campaign

- **Templates tab — Manage reusable email templates:**
  - Pre-seeded templates (editable but not deletable):
    1. **Save the Date** — "Mark your calendars! {{coupleName}} are getting married."
    2. **RSVP Reminder** — "We haven't heard from you yet! Please RSVP by {{rsvpDeadline}}."
    3. **RSVP Confirmation** — "Thank you for your RSVP, {{firstName}}! We're excited to celebrate with you."
    4. **Wedding Update** — Generic update template: "We have some exciting news to share about our wedding!"
    5. **Travel & Hotel Info** — "Here's everything you need to know about getting to our wedding."
    6. **Day-Of Reminder** — "Tomorrow's the big day! Here's what you need to know."
    7. **Thank You** — "Thank you for celebrating with us, {{firstName}}! It meant the world to have you there."
    8. **Photo Share Invite** — "We'd love to see your photos from our wedding! Upload them here: {{photoShareLink}}"
  - Create custom templates with the same rich text editor + merge variables
  - Edit / duplicate / delete templates
  - Each template lists its available merge variables

- **Send History tab:**
  - Chronological log of all sent campaigns
  - Per-campaign: total sent, delivered, bounced, failed counts
  - Expandable rows showing per-recipient delivery status
  - Export send history to CSV

- **Merge variables available in all templates:**

  | Variable              | Resolves To                               |
  | --------------------- | ----------------------------------------- |
  | `{{firstName}}`       | Guest's first name                        |
  | `{{lastName}}`        | Guest's last name                         |
  | `{{fullName}}`        | Guest's first + last name                 |
  | `{{rsvpStatus}}`      | "Attending", "Declined", or "Pending"     |
  | `{{rsvpDeadline}}`    | Formatted RSVP deadline from SiteSettings |
  | `{{weddingDate}}`     | Formatted wedding date from SiteSettings  |
  | `{{weddingTime}}`     | Wedding time from SiteSettings            |
  | `{{venueName}}`       | Venue name from SiteSettings              |
  | `{{venueAddress}}`    | Venue address from SiteSettings           |
  | `{{coupleName}}`      | Couple name from SiteSettings             |
  | `{{websiteUrl}}`      | The wedding website URL                   |
  | `{{rsvpLink}}`        | Direct link to RSVP page                  |
  | `{{photoShareLink}}`  | Photo sharing link from SiteSettings      |
  | `{{unsubscribeLink}}` | (Future) Per-guest opt-out link           |

- **Safety guardrails:**
  - Confirmation modal before any mass send: "You are about to send this email to **X guests**. This cannot be undone. Are you sure?"
  - Daily send limit indicator (based on email provider tier — e.g., Resend free tier: 100/day)
  - Duplicate send prevention: warn if the same template was sent to the same audience within the last 7 days
  - Guests without email addresses are automatically excluded (with count shown)
  - Rate-limited sending: emails are queued and sent in batches (e.g., 10/second) to avoid provider rate limits

**Settings (`/admin/settings`):**

- **Wedding date & time** pickers
- **RSVP deadline** date picker + enable/disable toggle
- **Contact emails:** Joint, Bride, Groom
- **Venue info:** Name, address
- **Dress code** text field
- **Photo share link** URL field
- **Registry links:** Add/edit/delete registry items (name, URL)
- **Admin password change**
- **Wedding hashtag** text field (displayed in footer, photo share page, guest book)
- **Social media links:** editable list of social profile URLs (Instagram, TikTok, etc.) shown in footer and contact page
- **Site password protection:**
  - Enable/disable toggle
  - Passphrase field (e.g., "forevercampbells") — this is the simple password guests enter to view the public site, NOT admin auth
  - When enabled, middleware checks for a valid cookie; if absent, shows a branded passphrase entry screen
- **RSVP email notifications:**
  - Enable/disable toggle
  - Notification email address (where alerts go)
  - Uses Resend (free tier) or nodemailer with Gmail app password
- **Email provider configuration (Settings → Email):**
  - Select provider: None (disabled), Resend, Nodemailer/Gmail, SendGrid (future)
  - Provider-specific fields (API key, SMTP host, etc.)
  - "From" name and email address (e.g., "Jacob & Ashley <hello@forevercampbells.com>")
  - "Reply-to" email address
  - Send test email button to verify configuration
  - Daily send limit display (based on provider tier)
  - Status indicator: connected / not configured / error
- **Social sharing / OG meta:**
  - Upload OG preview image (shown when link is shared on social/iMessage)
  - Edit OG description text
- **Post-wedding tagline:** Editable tagline that replaces the countdown after the wedding date passes
- **Admin Activity Log (Settings → Activity):**
  - Chronological log of all admin actions: content edits, guest imports, photo uploads, setting changes, email campaigns sent
  - Each entry: timestamp, action description, user (for future multi-admin support)
  - Filterable by action type and date range
  - Useful for auditing “who changed what and when”
- **Data Backup & Restore (Settings → Backup):**
  - **Export full site backup** — downloads a JSON file with all database content (settings, guests, FAQs, timeline, etc.) excluding uploaded files
  - **Import backup** — restore from a previously exported JSON file (with confirmation + preview of what will be overwritten)
  - **Export guest list** — separate CSV export of just the guest/RSVP data
  - Provides peace of mind that the couple won’t lose their data
- **Feature Flags (Settings → Features):**
  - Toggle grid for all feature flags with name, description, and enable/disable switch
  - Changes take effect immediately (no deploy needed)
  - Flags control public page visibility and API route availability
- **Integrations (Settings → Integrations):**
  - Auto-generated UI from module manifests (see Step 8.8)
  - Per-integration: enable/disable, configuration form, connection test, sync status
  - Add new integrations via the module manifest pattern — admin UI renders automatically
  - Webhook URL display for integrations that support push notifications

### Step 5: Apply the Celestial/Starry Night Theme

**Tailwind Config — Custom Theme Tokens:**

```js
colors: {
  midnight:  { DEFAULT: '#0B1D3A', light: '#122B54' },
  royal:     { DEFAULT: '#1E3A6E', light: '#2A4F8F' },
  gold:      { DEFAULT: '#D4A843', light: '#E8C76A', dark: '#C9952B' },
  forest:    { DEFAULT: '#2D5F3E', light: '#3A7A4F' },
  sage:      { DEFAULT: '#7A9E7E', light: '#9AB89D' },
  ivory:     { DEFAULT: '#FAF8F0' },
  cream:     { DEFAULT: '#F5F0E3' },
}
```

**Starry Sky Animation Component:**

- Canvas-based particle system OR pure CSS for twinkling dots
- Randomized star positions, sizes (1-3px), and twinkle timing
- Shooting star effect (occasional, subtle)
- Renders as a fixed/absolute background behind content

**Section Dividers:**

- SVG crescent moon dividers between page sections
- Constellation dot-and-line decorative elements
- Gold horizontal rule with star motif

**Component Styling Patterns:**

- Cards: dark navy background with gold border, slight glow
- Buttons: gold background with navy text; hover glow effect
- Navigation: transparent on hero, solid midnight on scroll (sticky)
- Form inputs: dark backgrounds with gold focus ring
- Headings: Playfair Display (Google Fonts), gold color on dark backgrounds
- Body text: Inter or Lato (Google Fonts), ivory on dark / navy on light

**Loading & Skeleton States:**

- Skeleton screens for all data-fetching pages (RSVP lookup, gallery grid, guest book entries)
- Skeletons styled with midnight-to-navy shimmer animation (not generic gray)
- Full-page loading spinner: animated crescent moon or rotating star constellation
- Button loading states: gold spinner replaces text, button disabled during submission
- Image placeholders: silhouette with subtle star twinkle until loaded

**Page Transitions & Micro-Animations:**

- Subtle fade-in on page load (CSS `@keyframes` or Framer Motion)
- Staggered entrance animations for card grids (wedding party, entertainment, FAQ)
- Smooth scroll behavior for anchor links
- Parallax-lite starfield effect on scroll (optional — performance gated)
- Toast notifications: slide in from top with gold accent border

**Error & 404 Pages:**

- **404 Not Found (`/app/not-found.tsx`):** Celestial-themed “lost in space” page. Starry background with a message like “Looks like you’ve drifted off course!” and a prominent “Back to Home” button. Include fun illustration of a shooting star or constellation.
- **Error boundary (`/app/error.tsx`):** Themed error page with “Something went wrong” message, retry button, and link to contact the couple. Should not expose technical details to guests.
- Both pages include the site navigation and footer for consistency.

**Print-Friendly Styles:**

- `@media print` stylesheet that:
  - Removes starry backgrounds, animations, navigation, and footer
  - Switches to light background with dark text for ink efficiency
  - Formats Event Details, Travel, and FAQ pages cleanly for printing
  - Includes venue address, date/time, and hotel info in print layout
  - Shows QR code linking to the website (auto-generated)
- Guests can print event details or travel info to bring to the wedding

### Step 6: Seed Data

On first run / database seed, populate:

1. **SiteSettings** singleton with all defaults from this plan
2. **WeddingPartyMember** records:
   - 6 Bridesmaids: Jessica, Sarena, Carolyn, Kayla, Rachel, Milan (side: "bride")
   - 6 Groomsmen: Lori, Semih, David, Andrew, Nathaniel, Cole (side: "groom")
   - 1 Flower Girl: Alara (role: "Flower Girl", side: "bride")
   - 3 Ring Bearers: Aiden, Arthur, Henry (role: "Ring Bearer", side: "groom")
3. **Hotel** records: Hilton Garden Inn Apopka City Center, Embassy Suites by Hilton, Hampton Inn Apopka
4. **RegistryItem**: Amazon (URL placeholder)
5. **FAQ** records: 10 default questions from the list above
6. **Entertainment** records: Caricature artist, Photo booth, Tattoos & Glitter bar, Paint by numbers, Themed crossword, DJ & Dancing, Raffle for theme park ticket
7. **TimelineEvent** placeholder records: Guest Arrival, Ceremony, Cocktail Hour, Reception, Bridal Party Entrance, First Dances, Dinner, Cake Cutting, Dancing, Late Night Snack, Send-Off
8. **MealOption** placeholder records: e.g., "Chicken", "Steak", "Fish", "Vegetarian" (couple will customize via admin)
9. **DJList** seed: empty (couple fills in via admin music page)
10. **Photo** categories available: "hero", "our-story", "photos-of-us", "gallery", "wedding-party"
11. **FeatureFlag** records: `rsvpEnabled` (true), `guestBookEnabled` (true), `photoUploadEnabled` (false), `registrySyncEnabled` (false), `songRequestsEnabled` (true), `entertainmentPageEnabled` (true), `guestPhotoSharingEnabled` (false), `liveGuestCountEnabled` (false), `massEmailEnabled` (true)
12. **IntegrationConfig** records: `amazon-registry` (disabled, empty config — ready to configure via admin)
13. **EmailTemplate** records: 8 pre-seeded templates (Save the Date, RSVP Reminder, RSVP Confirmation, Wedding Update, Travel & Hotel Info, Day-Of Reminder, Thank You, Photo Share Invite) — all with `isDefault: true` and `category: "system"`

### Step 7: Deployment & Hosting with GoDaddy Domain

The wedding website is a Next.js app, which requires a Node.js server (or serverless functions). GoDaddy's shared hosting does **not** support Node.js/Next.js. There are two recommended approaches:

---

#### Option A: Deploy on Vercel + Point GoDaddy Domain (Recommended)

This is the simplest, cheapest, and most reliable approach. Vercel is purpose-built for Next.js. The free Hobby tier is more than enough for a wedding website.

**Step 7A.1 — Deploy to Vercel:**

1. Push the repo to GitHub (private repo is fine)
2. Go to [vercel.com](https://vercel.com) → Sign up with GitHub → "Import Project" → select the wedding website repo
3. Vercel auto-detects Next.js. Set these **Environment Variables** in the Vercel dashboard:
   ```
   NEXTAUTH_SECRET=<random-secret>         # Generate with: openssl rand -base64 32
   NEXTAUTH_URL=https://forevercampbells.com
   ADMIN_EMAIL=<couple's admin email>
   ADMIN_PASSWORD=<hashed password>
   DATABASE_URL=<turso-database-url>       # See database section below
   TURSO_AUTH_TOKEN=<turso-auth-token>      # See database section below
   RESEND_API_KEY=<optional>               # For RSVP email notifications
   ```
4. Set **Build Command:** `npx prisma generate && npx prisma db push && next build`
5. Set **Install Command:** `npm install`
6. Click "Deploy" — Vercel builds and gives you a `.vercel.app` preview URL
7. Run the database seed after first deploy (see database section)

**Step 7A.2 — Production Database (Turso):**

SQLite files don't persist on Vercel's serverless architecture (ephemeral filesystem). Use **Turso** — a hosted SQLite-compatible database with a generous free tier (500 databases, 9 GB storage, 25M row reads/month):

1. Sign up at [turso.tech](https://turso.tech) (free, sign in with GitHub)
2. Install the CLI: `curl -sSfL https://get.tur.so/install.sh | bash` (or `brew install tursodatabase/tap/turso` on Mac)
3. Create a database:
   ```bash
   turso db create wedding-website
   turso db show wedding-website --url    # Copy the URL (libsql://...)
   turso db tokens create wedding-website  # Copy the auth token
   ```
4. Add `TURSO_AUTH_TOKEN` and update `DATABASE_URL` in Vercel env vars:
   ```
   DATABASE_URL=libsql://wedding-website-<your-username>.turso.io
   TURSO_AUTH_TOKEN=<token>
   ```
5. Update `prisma/schema.prisma` to use the `libsql` driver adapter for production (Prisma supports Turso via `@prisma/adapter-libsql`):
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
6. Install the Turso adapter: `npm install @libsql/client @prisma/adapter-libsql`
7. Update `lib/db.ts` to use the Turso adapter when `DATABASE_URL` starts with `libsql://`
8. After deploying, seed the production database:
   ```bash
   DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... npx tsx prisma/seed.ts
   ```

**Step 7A.3 — Connect GoDaddy Domain to Vercel:**

1. In **Vercel Dashboard** → your project → **Settings → Domains**
2. Add your domain: `forevercampbells.com` (or whatever you bought on GoDaddy)
3. Vercel will show you the DNS records to configure. You have two sub-options:

   **Option i — Use Vercel Nameservers (Simplest):**
   1. Vercel gives you nameservers like `ns1.vercel-dns.com` and `ns2.vercel-dns.com`
   2. Log in to **GoDaddy** → **My Products** → click **DNS** next to your domain
   3. Scroll down to **Nameservers** → click **Change** → select **"Enter my own nameservers (advanced)"**
   4. Replace GoDaddy's nameservers with the two Vercel nameservers
   5. Save. Propagation takes 1–48 hours (usually under 1 hour)
   6. Vercel automatically provisions a free SSL certificate
   7. **Note:** This means ALL DNS for this domain is managed in Vercel's dashboard (not GoDaddy). If you need email (MX records) or other DNS entries, add them in Vercel's DNS settings.

   **Option ii — Keep GoDaddy DNS, Add Records Manually:**
   1. In **GoDaddy DNS Manager**, add these records:
      - **A Record:** `@` → `76.76.21.21` (Vercel's IP)
      - **CNAME Record:** `www` → `cname.vercel-dns.com`
   2. Back in Vercel, click "Verify" next to your domain
   3. Vercel provisions SSL automatically
   4. **Pros:** You keep GoDaddy DNS for email / other services. **Cons:** Slightly more manual setup.

4. After DNS propagates, your site is live at `https://forevercampbells.com` with automatic HTTPS
5. Vercel also handles `www.forevercampbells.com` → redirects to the apex domain (or vice versa, your choice)

**Step 7A.4 — GoDaddy Email (Optional):**

If you have a GoDaddy email plan (e.g., `hello@forevercampbells.com`):

- If using **Vercel Nameservers (Option i):** Add your GoDaddy MX records in Vercel's DNS dashboard. GoDaddy's MX records are typically:
  - `@` → `mailstore1.secureserver.net` (priority 10)
  - `@` → `smtp.secureserver.net` (priority 0)
- If using **GoDaddy DNS (Option ii):** Email records are already in place, no changes needed.

---

#### Option B: Self-Host on a VPS (Full Control)

If you prefer to host everything yourself (or want to avoid Vercel), rent a small VPS and point your GoDaddy domain to it. This gives full control but requires more setup and maintenance.

**Step 7B.1 — Rent a VPS:**

Good cheap options:

- **DigitalOcean Droplet** — $4–6/month (1 vCPU, 512MB–1GB RAM)
- **Hetzner Cloud** — €3.79/month (best value in EU/US)
- **Linode (Akamai)** — $5/month
- **Vultr** — $3.50–6/month
- **Oracle Cloud Free Tier** — free forever (ARM, 4 vCPUs, 24GB RAM — generous but more setup)

Choose Ubuntu 22.04+ as the OS.

**Step 7B.2 — Server Setup:**

```bash
# SSH into your VPS
ssh root@<your-vps-ip>

# Update system
apt update && apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 (process manager to keep the app running)
npm install -g pm2

# Install Nginx (reverse proxy + SSL)
apt install -y nginx

# Install Certbot (free Let's Encrypt SSL)
apt install -y certbot python3-certbot-nginx

# Clone your repo
git clone https://github.com/<your-username>/wedding_website.git /var/www/wedding
cd /var/www/wedding

# Install dependencies & build
npm install
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
npm run build

# Start with PM2
pm2 start npm --name "wedding" -- start
pm2 save
pm2 startup  # Auto-restart on server reboot
```

**Step 7B.3 — Nginx Reverse Proxy:**

```nginx
# /etc/nginx/sites-available/wedding
server {
    listen 80;
    server_name forevercampbells.com www.forevercampbells.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable the site & get SSL
ln -s /etc/nginx/sites-available/wedding /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d forevercampbells.com -d www.forevercampbells.com
```

**Step 7B.4 — Point GoDaddy Domain to VPS:**

1. Log in to **GoDaddy** → **My Products** → **DNS** for your domain
2. Edit the existing **A Record**:
   - **Type:** A
   - **Name:** `@`
   - **Value:** `<your-VPS-IP-address>`
   - **TTL:** 600 (or 1 hour)
3. Add/edit a **CNAME Record** for www:
   - **Type:** CNAME
   - **Name:** `www`
   - **Value:** `forevercampbells.com`
   - **TTL:** 1 hour
4. Wait for DNS propagation (usually 15 min–1 hour)
5. Certbot handles SSL renewal automatically (cron job already set up)

**Step 7B.5 — Database (VPS):**

On a VPS, SQLite works perfectly — the filesystem is persistent. Keep `DATABASE_URL=file:./prisma/dev.db` (or `file:./data/wedding.db` for production). No need for Turso or Postgres.

Set up automated backups:

```bash
# Backup SQLite DB daily to a safe location
crontab -e
# Add: 0 3 * * * cp /var/www/wedding/prisma/dev.db /var/backups/wedding-$(date +\%Y\%m\%d).db
```

**Step 7B.6 — Deploying Updates (VPS):**

```bash
# SSH in and pull latest code
cd /var/www/wedding
git pull origin main
npm install
npx prisma generate
npx prisma db push
npm run build
pm2 restart wedding
```

Or set up a simple GitHub Actions workflow to auto-deploy on push to `main`:

```yaml
# .github/workflows/deploy.yml
name: Deploy to VPS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: root
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /var/www/wedding
            git pull origin main
            npm install
            npx prisma generate
            npx prisma db push
            npm run build
            pm2 restart wedding
```

---

#### Recommendation

**Use Option A (Vercel + GoDaddy DNS pointing).** It's free, zero-maintenance, auto-scales, has automatic HTTPS, instant deployments on `git push`, and is built specifically for Next.js. You keep your GoDaddy domain — you're just telling GoDaddy "send traffic to Vercel" via DNS records. GoDaddy remains your domain registrar; Vercel is just the host.

Only consider Option B if you need: persistent SQLite without Turso migration, full server access, or want to avoid any third-party platform dependency.

---

#### Common Configuration (Both Options)

- **Environment Variables:**
  ```
  NEXTAUTH_SECRET=<random-secret>
  NEXTAUTH_URL=https://forevercampbells.com
  ADMIN_EMAIL=<couple's admin email>
  ADMIN_PASSWORD=<hashed password>
  DATABASE_URL=file:./dev.db          # VPS: local SQLite
  # DATABASE_URL=libsql://...         # Vercel: Turso
  # TURSO_AUTH_TOKEN=<token>          # Vercel: Turso auth
  RESEND_API_KEY=<optional, for RSVP email notifications>
  ```
- **Build command:** `npx prisma generate && npx prisma db push && next build`
- **Seed command:** `npx prisma db seed`
- **Favicon:** Celestial-themed favicon set (star or crescent moon) in multiple sizes. Generate as `/app/favicon.ico` + `/app/icon.svg` + `/app/apple-icon.png`.
- **Open Graph meta (social preview):** In root layout `metadata` export:
  - `og:title` → "Jacob & Ashley — Forever Campbells"
  - `og:description` → from `SiteSettings.ogDescription`
  - `og:image` → from `SiteSettings.ogImage` (uploaded via admin)
  - `og:type` → "website"
  - Twitter card meta tags mirroring the above
  - This ensures a beautiful preview card when the URL is shared via text, iMessage, Facebook, Instagram, etc.
- **SEO — Sitemap & Robots:**
  - Generate `/sitemap.xml` dynamically using the Next.js `app/sitemap.ts` convention — include all public page routes
  - Generate `/robots.txt` via `app/robots.ts` — allow all public pages, disallow `/admin/*`
  - Add JSON-LD structured data (`Event` schema) to the homepage and `/event-details` page:
    ```json
    {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": "Jacob & Ashley Campbell Wedding",
      "startDate": "2026-11-13T16:00:00",
      "location": {
        "@type": "Place",
        "name": "The Highland Manor",
        "address": "Apopka, Florida"
      },
      "organizer": { "@type": "Person", "name": "Jacob & Ashley Campbell" }
    }
    ```
- **Analytics:** Use **Vercel Analytics** (zero-config on Vercel) or **Plausible** (self-hosted or cloud, works on any host). No Google Analytics — keeps the site lightweight and avoids cookie consent complexity. Enable via feature flag in admin.
- **PWA / Offline Support:**
  - Add a `manifest.json` (web app manifest) so guests can "Add to Home Screen" on mobile — gives an app-like experience
  - Include a basic **service worker** that caches the shell, event details, and travel pages so they're available offline at the venue (cell coverage can be spotty)
  - Cached pages include: `/event-details`, `/travel`, `/wedding-party`, `/entertainment`, `/faq`
  - Service worker generated via `next-pwa` or a lightweight `serwist` integration

### Step 8: Extensible Framework Architecture

The application is designed with a **modular, provider-based architecture** so that every major capability — storage, email, RSVP, photo management, registry integrations, and more — can be swapped, extended, or enhanced without rewriting core application code.

---

#### 8.1 Service Provider Layer (`/lib/providers/`)

Abstract each infrastructure concern behind a **Provider interface**. The app consumes only the interface; concrete implementations are injected via a central registry.

```
/lib/providers/
  index.ts                  → Provider registry & factory
  storage/
    storage.provider.ts     → IStorageProvider interface
    local.storage.ts        → LocalStorageProvider (MVP: /public/uploads)
    s3.storage.ts           → S3StorageProvider (future)
    vercel-blob.storage.ts  → VercelBlobProvider (future)
  email/
    email.provider.ts       → IEmailProvider interface
    resend.email.ts         → ResendEmailProvider (MVP)
    nodemailer.email.ts     → NodemailerProvider (Gmail fallback)
    noop.email.ts           → NoOpEmailProvider (logging-only stub)
  notifications/
    notification.provider.ts → INotificationProvider interface
    email.notification.ts    → EmailNotificationProvider
    webhook.notification.ts  → WebhookNotificationProvider (future: Slack, Discord)
```

**Provider interface example:**

```typescript
// /lib/providers/storage/storage.provider.ts
export interface IStorageProvider {
  upload(
    file: File | Buffer,
    path: string,
    options?: UploadOptions,
  ): Promise<StorageResult>;
  delete(path: string): Promise<void>;
  getUrl(path: string): string;
  list(prefix?: string): Promise<StorageItem[]>;
}

export interface UploadOptions {
  contentType?: string;
  maxSizeBytes?: number;
  allowedTypes?: string[];
  generateThumbnail?: boolean;
}

export interface StorageResult {
  url: string;
  path: string;
  size: number;
  contentType: string;
  thumbnailUrl?: string;
}
```

**Provider registry:**

```typescript
// /lib/providers/index.ts
import type { IStorageProvider } from "./storage/storage.provider";
import type { IEmailProvider } from "./email/email.provider";
import { LocalStorageProvider } from "./storage/local.storage";
import { NoOpEmailProvider } from "./email/noop.email";

const providers = {
  storage: new LocalStorageProvider() as IStorageProvider,
  email: new NoOpEmailProvider() as IEmailProvider,
};

export function getProvider<K extends keyof typeof providers>(key: K) {
  return providers[key];
}

export function registerProvider<K extends keyof typeof providers>(
  key: K,
  provider: (typeof providers)[K],
) {
  providers[key] = provider;
}
```

Swap implementations by changing a single line in initialization (or via env var):

```typescript
// /lib/providers/init.ts — called once at app startup
if (process.env.STORAGE_PROVIDER === "s3") {
  registerProvider(
    "storage",
    new S3StorageProvider({ bucket: process.env.S3_BUCKET! }),
  );
}
if (process.env.EMAIL_PROVIDER === "resend") {
  registerProvider(
    "email",
    new ResendEmailProvider(process.env.RESEND_API_KEY!),
  );
}
```

---

#### 8.2 Feature Module System (`/lib/modules/`)

Each major feature is organized as a **self-contained module** with its own data access, business logic, API handlers, and (optionally) UI components. This makes features independently testable, replaceable, and removable.

```
/lib/modules/
  rsvp/
    rsvp.service.ts        → Business logic (lookup, submit, validate, deadline check)
    rsvp.repository.ts     → Prisma data access (queries, mutations)
    rsvp.types.ts          → TypeScript types & Zod validation schemas
    rsvp.hooks.ts          → Event hooks this module emits & listens to
    rsvp.config.ts         → Module-level config (feature flags, limits)
  gallery/
    gallery.service.ts
    gallery.repository.ts
    gallery.types.ts
    gallery.hooks.ts
  registry/
    registry.service.ts
    registry.repository.ts
    registry.types.ts
    registry.hooks.ts
    integrations/          → Third-party registry connectors
      amazon.integration.ts
      target.integration.ts
      zola.integration.ts
      base.registry-integration.ts  → Abstract base class
  guest-book/
    guest-book.service.ts
    guest-book.repository.ts
    guest-book.types.ts
  photo-upload/
    photo-upload.service.ts  → Uses IStorageProvider under the hood
    photo-upload.repository.ts
    photo-upload.types.ts
  music/
    music.service.ts
    music.repository.ts
    music.types.ts
  notifications/
    notification.service.ts  → Orchestrates INotificationProvider
    notification.types.ts
    templates/               → Email/notification templates
      rsvp-confirmation.template.ts
      rsvp-admin-alert.template.ts
      guest-book-entry.template.ts
  communications/
    communications.service.ts  → Campaign creation, audience resolution, send orchestration
    communications.repository.ts → EmailCampaign, EmailLog, EmailTemplate data access
    communications.types.ts    → Zod schemas for campaign creation, audience filters
    communications.hooks.ts    → Events: campaign:sent, campaign:scheduled, email:bounced
    merge-variables.ts         → Variable resolution engine (maps {{var}} → guest/settings data)
    send-queue.ts              → Batched email sending with rate limiting & retry
    templates/                 → Pre-built email HTML layouts
      base-layout.template.ts  → Shared celestial-themed email wrapper (header, footer)
      save-the-date.template.ts
      rsvp-reminder.template.ts
      rsvp-confirmation.template.ts
      wedding-update.template.ts
      travel-info.template.ts
      day-of-reminder.template.ts
      thank-you.template.ts
      photo-share-invite.template.ts
```

**Module service example (RSVP):**

```typescript
// /lib/modules/rsvp/rsvp.service.ts
export class RsvpService {
  constructor(
    private repo: RsvpRepository,
    private notificationService: NotificationService,
    private eventBus: EventBus,
  ) {}

  async submitRsvp(data: RsvpSubmission): Promise<RsvpResult> {
    const validated = rsvpSubmissionSchema.parse(data);
    const guest = await this.repo.findGuestByName(
      validated.firstName,
      validated.lastName,
    );
    if (!guest) throw new GuestNotFoundError();

    const result = await this.repo.updateRsvp(guest.id, validated);

    // Emit event for any registered listeners (notifications, analytics, etc.)
    await this.eventBus.emit("rsvp:submitted", {
      guestId: guest.id,
      status: validated.rsvpStatus,
      guestName: `${guest.firstName} ${guest.lastName}`,
      details: validated,
    });

    return result;
  }
}
```

---

#### 8.3 Event Bus & Hook System (`/lib/events/`)

A lightweight **publish/subscribe event bus** allows modules to communicate without direct dependencies. This is the primary extensibility mechanism — new capabilities subscribe to existing events.

```typescript
// /lib/events/event-bus.ts
type EventHandler<T = unknown> = (payload: T) => Promise<void> | void;

class EventBus {
  private handlers = new Map<string, EventHandler[]>();

  on<T>(event: string, handler: EventHandler<T>): void {
    const list = this.handlers.get(event) ?? [];
    list.push(handler as EventHandler);
    this.handlers.set(event, list);
  }

  async emit<T>(event: string, payload: T): Promise<void> {
    const list = this.handlers.get(event) ?? [];
    await Promise.allSettled(list.map((h) => h(payload)));
  }

  off(event: string, handler: EventHandler): void {
    const list = this.handlers.get(event) ?? [];
    this.handlers.set(
      event,
      list.filter((h) => h !== handler),
    );
  }
}

export const eventBus = new EventBus();
```

**Standard events emitted by core modules:**

| Event Name           | Payload                                        | Emitted By     |
| -------------------- | ---------------------------------------------- | -------------- |
| `rsvp:submitted`     | `{ guestId, status, guestName, details }`      | RSVP module    |
| `rsvp:updated`       | `{ guestId, oldStatus, newStatus }`            | RSVP module    |
| `guest:created`      | `{ guestId, firstName, lastName }`             | Guest module   |
| `guest:imported`     | `{ count, source }`                            | Guest module   |
| `photo:uploaded`     | `{ photoId, category, url }`                   | Gallery module |
| `photo:deleted`      | `{ photoId }`                                  | Gallery module |
| `guestbook:signed`   | `{ entryId, name, message }`                   | Guest Book     |
| `registry:synced`    | `{ provider, itemCount }`                      | Registry       |
| `settings:updated`   | `{ changedFields[] }`                          | Settings       |
| `campaign:created`   | `{ campaignId, name, audienceCount }`          | Communications |
| `campaign:sent`      | `{ campaignId, recipientCount, successCount }` | Communications |
| `campaign:scheduled` | `{ campaignId, scheduledAt }`                  | Communications |
| `campaign:failed`    | `{ campaignId, error }`                        | Communications |
| `email:bounced`      | `{ campaignId, guestId, email, error }`        | Communications |

**Example: Wiring notifications to events:**

```typescript
// /lib/modules/notifications/notification.hooks.ts
import { eventBus } from "@/lib/events/event-bus";
import { notificationService } from "./notification.service";

// Automatically send admin email when an RSVP is submitted
eventBus.on("rsvp:submitted", async (payload) => {
  await notificationService.sendAdminAlert("rsvp-submitted", payload);
});

// Automatically send admin email when guest book is signed
eventBus.on("guestbook:signed", async (payload) => {
  await notificationService.sendAdminAlert("guestbook-signed", payload);
});
```

Adding a new integration (e.g., Slack alerts) requires only: implementing `INotificationProvider` and subscribing to the relevant events — zero changes to existing modules.

---

#### 8.4 Integration Framework (`/lib/integrations/`)

A standardized pattern for third-party service integrations, starting with registries but designed for any external API.

```
/lib/integrations/
  base.integration.ts        → Abstract base class with retry, error handling, caching
  integration.registry.ts    → Central registry of all active integrations
  registry/
    base.registry.ts         → IRegistryIntegration interface
    amazon.registry.ts       → Amazon Product API integration
    target.registry.ts       → Target registry integration (future)
    zola.registry.ts         → Zola registry integration (future)
    crate-and-barrel.registry.ts → (future)
  photo/
    base.photo-service.ts    → IPhotoServiceIntegration interface
    google-photos.ts         → Google Photos shared album API (future)
    cloudinary.ts            → Cloudinary upload/transform (future)
    imgur.ts                 → Imgur album integration (future)
  calendar/
    base.calendar.ts         → ICalendarIntegration interface
    google-calendar.ts       → Google Calendar API (future)
    outlook-calendar.ts      → Outlook Calendar API (future)
```

**Registry integration interface:**

```typescript
// /lib/integrations/registry/base.registry.ts
export interface IRegistryIntegration {
  readonly providerName: string;
  readonly providerSlug: string;
  readonly iconUrl: string;

  // Returns registry items with purchase status (if API supports it)
  fetchItems(): Promise<RegistryProduct[]>;

  // Returns a direct link to the couple's registry on this platform
  getRegistryUrl(): string;

  // Check if a specific item has been purchased (if API supports it)
  getItemStatus?(
    itemId: string,
  ): Promise<"available" | "purchased" | "reserved">;

  // Validate connection / API credentials
  testConnection(): Promise<boolean>;
}

export interface RegistryProduct {
  externalId: string;
  name: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  status: "available" | "purchased" | "reserved";
  productUrl: string;
  category?: string;
}
```

**Integration base class with built-in resilience:**

```typescript
// /lib/integrations/base.integration.ts
export abstract class BaseIntegration {
  abstract readonly name: string;

  // Built-in retry with exponential backoff
  protected async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    baseDelayMs = 500,
  ): Promise<T> {
    /* ... */
  }

  // Built-in response caching (TTL-based)
  protected async withCache<T>(
    key: string,
    fn: () => Promise<T>,
    ttlSeconds = 300,
  ): Promise<T> {
    /* ... */
  }

  // Standardized error wrapping
  protected handleError(error: unknown): IntegrationError {
    /* ... */
  }
}
```

**Adding a new registry integration is as simple as:**

1. Create `new-store.registry.ts` implementing `IRegistryIntegration`
2. Register it in `/lib/integrations/integration.registry.ts`
3. It automatically appears in the admin settings and public registry page

---

#### 8.5 Feature Flags & Dynamic Module Loading (`/lib/config/`)

A feature flag system controls which modules are active, allowing features to be toggled on/off from the admin panel or environment variables without code changes.

```typescript
// /lib/config/feature-flags.ts
export interface FeatureFlags {
  rsvpEnabled: boolean; // Master RSVP toggle
  guestBookEnabled: boolean; // Guest book feature
  photoUploadEnabled: boolean; // Guest photo uploads (not just admin)
  registrySyncEnabled: boolean; // Live registry API sync
  songRequestsEnabled: boolean; // Song request on RSVP form
  entertainmentPageEnabled: boolean; // Entertainment page visibility
  guestPhotoSharingEnabled: boolean; // In-app guest photo sharing (vs external link)
  liveGuestCountEnabled: boolean; // Show live RSVP count on public site
  massEmailEnabled: boolean; // Mass email campaigns from admin
}
```

**Prisma model addition:**

```prisma
model FeatureFlag {
  id          String  @id @default(cuid())
  key         String  @unique   // e.g., "rsvpEnabled"
  enabled     Boolean @default(false)
  description String  @default("")
  updatedAt   DateTime @updatedAt
}
```

Pages and API routes check feature flags before rendering or processing:

```typescript
// In a server component or API route
const flags = await getFeatureFlags();
if (!flags.rsvpEnabled) {
  return <FeatureDisabledMessage feature="RSVP" />;
}
```

The admin settings page gets a **"Features"** tab to toggle each flag with a description of what it controls.

---

#### 8.6 Extensible API Layer (`/app/api/v1/`)

All API routes follow a **versioned, RESTful** pattern with consistent request/response shapes, making it easy to add new resources and for future clients (mobile app, external tools) to consume.

```
/app/api/v1/
  guests/
    route.ts               → GET (list), POST (create)
    [id]/route.ts          → GET, PUT, DELETE
    import/route.ts        → POST (CSV bulk import)
    export/route.ts        → GET (CSV export)
  rsvp/
    lookup/route.ts        → POST (name lookup)
    submit/route.ts        → POST (submit RSVP)
  photos/
    route.ts               → GET (list), POST (upload)
    [id]/route.ts          → GET, PUT, DELETE
  gallery/
    route.ts               → GET (public gallery listing)
  registry/
    route.ts               → GET (all registries)
    sync/route.ts          → POST (trigger sync with external APIs)
    [provider]/route.ts    → GET (items from specific provider)
  guest-book/
    route.ts               → GET (entries), POST (sign)
    [id]/route.ts          → PUT (moderate), DELETE
  music/
    requests/route.ts      → GET, POST
    dj-lists/route.ts      → GET, POST, PUT, DELETE
    export/route.ts        → GET (DJ handoff export)
  communications/
    campaigns/route.ts     → GET (list), POST (create)
    campaigns/[id]/route.ts → GET, PUT, DELETE
    campaigns/[id]/send/route.ts → POST (trigger send)
    campaigns/[id]/test/route.ts → POST (send test email to admin)
    campaigns/[id]/cancel/route.ts → POST (cancel scheduled)
    campaigns/[id]/duplicate/route.ts → POST (clone campaign)
    campaigns/[id]/logs/route.ts → GET (per-recipient send log)
    templates/route.ts     → GET (list), POST (create)
    templates/[id]/route.ts → GET, PUT, DELETE
    audience/preview/route.ts → POST (preview recipient list for given filters)
    history/route.ts       → GET (all sent campaigns with stats)
    history/export/route.ts → GET (CSV export of send history)
  settings/
    route.ts               → GET, PUT
    feature-flags/route.ts → GET, PUT
  webhooks/
    route.ts               → POST (incoming webhooks from integrations)
    [provider]/route.ts    → POST (provider-specific webhook handler)
  health/
    route.ts               → GET (health check for monitoring)
```

**Consistent API response envelope:**

```typescript
// /lib/api/response.ts
export type ApiResponse<T> =
  | {
      success: true;
      data: T;
      meta?: { total?: number; page?: number; pageSize?: number };
    }
  | {
      success: false;
      error: { code: string; message: string; details?: unknown };
    };
```

**Middleware chain for API routes:**

```typescript
// /lib/api/middleware.ts
export function withApiMiddleware(...middlewares: ApiMiddleware[]) {
  // Composes: auth check → rate limiting → validation → handler
}

// Reusable middlewares
export const requireAdmin: ApiMiddleware; // NextAuth session check
export const rateLimit: (opts: RateLimitOptions) => ApiMiddleware;
export const validateBody: <T>(schema: ZodSchema<T>) => ApiMiddleware;
export const withCors: ApiMiddleware; // For future cross-origin access
```

---

#### 8.7 Webhook System (`/lib/webhooks/`)

Receive webhooks from external services (registry purchase updates, photo service events, etc.) and emit them into the event bus for any module to handle.

```typescript
// /lib/webhooks/webhook.handler.ts
export interface WebhookHandler {
  readonly provider: string;
  validateSignature(request: Request): Promise<boolean>;
  parsePayload(request: Request): Promise<WebhookEvent>;
}

export interface WebhookEvent {
  provider: string;
  eventType: string;
  payload: Record<string, unknown>;
  receivedAt: Date;
}

// Registry: incoming webhook listeners registered per provider
const webhookHandlers = new Map<string, WebhookHandler>();

export function registerWebhookHandler(handler: WebhookHandler) {
  webhookHandlers.set(handler.provider, handler);
}
```

**Prisma model for webhook logging:**

```prisma
model WebhookLog {
  id          String   @id @default(cuid())
  provider    String
  eventType   String
  payload     String   // JSON stringified
  status      String   @default("received") // received, processed, failed
  error       String?
  receivedAt  DateTime @default(now())
  processedAt DateTime?
}
```

---

#### 8.8 Plugin Manifest & Admin Extensibility

Each module/integration declares a **manifest** so the admin UI can dynamically render configuration panels for any registered plugin.

```typescript
// /lib/modules/module.manifest.ts
export interface ModuleManifest {
  id: string; // e.g., "rsvp", "amazon-registry"
  name: string; // Human-readable name
  description: string;
  version: string;
  category: "core" | "integration" | "enhancement";
  featureFlag?: string; // Links to FeatureFlag key
  configSchema?: ZodSchema; // Zod schema for admin config fields
  adminRoute?: string; // Route for admin management page
  publicRoute?: string; // Route for public-facing page
  requiredEnvVars?: string[]; // Env vars this module needs
  dependencies?: string[]; // Other module IDs this depends on
  events?: {
    emits: string[]; // Events this module publishes
    listensTo: string[]; // Events this module subscribes to
  };
}
```

**Example manifest:**

```typescript
// /lib/modules/registry/integrations/amazon.manifest.ts
export const amazonRegistryManifest: ModuleManifest = {
  id: "amazon-registry",
  name: "Amazon Wedding Registry",
  description:
    "Sync and display your Amazon wedding registry with live availability.",
  version: "1.0.0",
  category: "integration",
  featureFlag: "registrySyncEnabled",
  configSchema: z.object({
    registryId: z.string().min(1, "Amazon registry ID is required"),
    apiKey: z.string().optional(),
    syncIntervalMinutes: z.number().default(60),
  }),
  adminRoute: "/admin/settings/integrations/amazon-registry",
  publicRoute: "/registry",
  requiredEnvVars: ["AMAZON_AFFILIATE_TAG"],
  events: {
    emits: ["registry:synced", "registry:item-purchased"],
    listensTo: [],
  },
};
```

The admin **Settings → Integrations** page reads all registered manifests and renders:

- Enable/disable toggle (via feature flag)
- Configuration form (auto-generated from `configSchema`)
- Connection test button (calls `testConnection()`)
- Status indicator (connected, error, not configured)

---

#### 8.9 Data Import/Export Framework (`/lib/data/`)

Standardized import/export capabilities so any module's data can be moved in and out of the system.

```typescript
// /lib/data/data-transfer.ts
export interface IDataExporter<T> {
  exportToCsv(data: T[]): string;
  exportToJson(data: T[]): string;
  exportToPdf?(data: T[]): Buffer; // Optional: for DJ handoff, guest lists, etc.
}

export interface IDataImporter<T> {
  parseFromCsv(content: string): ParseResult<T>;
  parseFromJson(content: string): ParseResult<T>;
  validate(records: T[]): ValidationResult<T>;
  import(records: T[]): Promise<ImportResult>;
}

export interface ParseResult<T> {
  records: T[];
  errors: { row: number; field: string; message: string }[];
}
```

Used by: guest CSV import/export, DJ song list export, RSVP data export, registry item sync.

---

#### 8.10 Planned Extension Points (Future Roadmap)

The architecture above enables these future additions with minimal effort:

| Future Feature                     | Extension Approach                                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Guest photo uploads**            | New `photo-upload` module + `IStorageProvider` (S3/Cloudinary) + `photo:uploaded` event                 |
| **Amazon registry live sync**      | `IRegistryIntegration` implementation + webhook handler for purchase notifications                      |
| **Target / Zola / Crate & Barrel** | Additional `IRegistryIntegration` implementations — same pattern as Amazon                              |
| **SMS RSVP reminders**             | New `INotificationProvider` (Twilio) + event listener on `rsvp:deadline-approaching`                    |
| **Slack/Discord admin alerts**     | New `INotificationProvider` implementation + subscribe to any event bus events                          |
| **Seating chart tool**             | New module with its own Prisma model (`Table`, `Seat`) + admin UI route                                 |
| **Budget tracker**                 | New module (`Budget`, `Expense` models) + admin route — no public page needed                           |
| **Vendor management**              | New module (`Vendor`, `Contract` models) + admin CRUD                                                   |
| **Digital invitations**            | New module using email provider + guest data + template engine                                          |
| **Mobile app / PWA**               | Consume the versioned `/api/v1/` REST endpoints — no backend changes needed                             |
| **Analytics dashboard**            | Event bus listener that aggregates all events into analytics models                                     |
| **Multi-language support (i18n)**  | Content provider abstraction + locale-aware rendering — content modules already isolated                |
| **Guest messaging / updates**      | Already built into `/admin/communications` — extend with SMS via `INotificationProvider`                |
| **Automated email sequences**      | Cron-based triggers (e.g., auto-remind pending RSVPs 2 weeks before deadline) via communications module |
| **Email open/click tracking**      | Tracking pixel in email templates + webhook from email provider → updates `EmailLog.openedAt`           |

---

## Further Considerations

1. **RSVP approach:** Name-lookup from admin-uploaded guest list (prevents duplicates, controlled invitations).
2. **Photo storage:** Local `/public/uploads` for MVP. Swap to S3 or Vercel Blob by implementing a new `IStorageProvider` — no changes to upload UI or API routes.
3. **Guest photo sharing:** Link out to a Google Photos shared album (URL set via admin settings). Future: implement `IPhotoServiceIntegration` for in-app guest uploads with moderation.
4. **Mobile responsiveness:** All public pages must be fully responsive. Most guests will view on mobile.
5. **Accessibility:** Proper contrast ratios with the dark theme, semantic HTML, keyboard navigation, screen reader support.
6. **Performance:** Use Next.js Image component for optimized photo loading, lazy load gallery images, static generation where possible.
7. **Email service:** Use `IEmailProvider` — ship with `NoOpEmailProvider` (logs only) and `ResendEmailProvider` (free tier: 100 emails/day). New providers (SendGrid, Mailgun, SES) require only a new class implementing the interface.
8. **Site password vs. admin auth:** These are two separate systems. The site password is a simple shared passphrase (same for all guests, stored in a cookie). Admin auth is full NextAuth credentials login. Don't confuse them.
9. **Post-wedding site lifecycle:** After the wedding date, feature flags automatically: hide RSVP from nav, swap countdown for celebratory message, promote Gallery and Photo Share links, keep all other pages accessible as a keepsake.
10. **DJ handoff:** The admin music page should have a "Print / Export for DJ" button that produces a clean PDF or CSV via the `IDataExporter` framework.
11. **Registry integrations:** Start with simple link cards (`RegistryItem` model). When ready, enable `registrySyncEnabled` feature flag and add `IRegistryIntegration` implementations for Amazon, Target, Zola, etc. to show live item availability and purchase status.
12. **Third-party webhooks:** External services (Amazon, payment processors, photo services) can push updates to `/api/v1/webhooks/[provider]`. The webhook handler validates, logs, and emits events for any interested module.
13. **Testing strategy:** The provider/service architecture enables easy mocking — inject `NoOpEmailProvider` and in-memory storage in tests. Each module's service layer can be unit-tested independently of Next.js.
14. **Module independence:** Each feature module owns its own types, validation schemas, data access, and business logic. Removing a module (e.g., entertainment page) means deleting its folder, its Prisma model, and its feature flag — nothing else breaks.
15. **Mass email guardrails:** The communications system is designed to work gracefully without an email provider configured. Campaigns can be composed and saved as drafts. When no provider is active, the UI shows an inline banner: "Email sending is not configured. Set up an email provider in Settings → Email to start sending." This ensures the admin experience is complete even during early development.
16. **Email deliverability:** All mass emails include the couple's name as the sender, a clear subject line, and the wedding website URL. Pre-built templates use a clean, branded HTML layout matching the celestial theme. Future: add SPF/DKIM guidance for custom domain email.
17. **Email batching & rate limits:** The send queue respects provider rate limits (e.g., Resend: 10 emails/sec, 100/day on free tier). Large campaigns are automatically batched with progress tracking visible in the admin UI. Failed sends are retried up to 3 times with exponential backoff.
18. **Cookie consent:** Vercel Analytics is cookie-free, so no consent banner is required for analytics. The site-password cookie is essential (functional, not tracking), which is also exempt. If a third-party service requiring cookies is added in the future, implement a lightweight banner using the Feature Flag system to toggle it on.
19. **QR codes for printed invitations:** Include a utility to generate a QR code image linking to the website URL (or directly to the RSVP page). This can be downloaded from admin Settings and printed on physical invitations or save-the-date cards.
20. **Accessibility audit checklist:** Target WCAG 2.1 AA compliance. After implementation, run Lighthouse accessibility audit and `axe-core` checks. Key areas: color contrast (gold on dark navy must pass 4.5:1 for body text), focus indicators on all interactive elements, alt text for all images, ARIA labels for icon-only buttons, skip-to-content link.
21. **Security headers:** Configure in `next.config.js` or Vercel: Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), X-Content-Type-Options, X-Frame-Options, Referrer-Policy. The site-password page should also include rate limiting (5 attempts per minute per IP) to prevent brute-force guessing.
22. **Image optimization pipeline:** All uploaded photos processed through Next.js Image component with automatic WebP/AVIF conversion, responsive `srcset`, and blur placeholder generation. Gallery images lazy-load with intersection observer. Admin photo uploads are resized server-side (max 2048px wide) and generate a 64px blur hash for the loading placeholder.
23. **Announcements / Alert Banner:** A dismissible banner at the top of all public pages for time-sensitive messages (e.g., "RSVP deadline is May 1st!", "Hotel block discount expires soon!"). Managed from admin Settings with fields: banner text, link URL (optional), active/inactive toggle, background color (gold for info, forest green for positive). Stored in `SiteSettings` as `bannerText`, `bannerUrl`, `bannerActive`, `bannerColor`.
24. **Admin activity log:** Every admin write action (create, update, delete) across all sections is automatically logged to `AdminActivityLog`. The log is viewable under Settings → Activity. This creates an audit trail and helps recover from accidental changes by seeing what was modified.
