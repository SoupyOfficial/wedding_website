import "dotenv/config";
import { createClient } from "@libsql/client";
import crypto from "crypto";

const client = createClient({
  url:
    process.env.TURSO_DATABASE_URL ||
    process.env.DATABASE_URL ||
    "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});


// ─── Production safety guard ───
// This seed inserts defaults into empty tables but never overwrites existing
// data. Running against production without explicit intent is still blocked.
// Test/staging Turso URLs (containing "test", "staging", or "localhost") pass
// automatically. For real production, set the explicit opt-in:
//   SEED_ALLOW_PRODUCTION=I_UNDERSTAND_THIS_WIPES_PRODUCTION_DATA
const tursoUrl = process.env.TURSO_DATABASE_URL;
if (tursoUrl) {
  const isNonProd = /test|staging|localhost/i.test(new URL(tursoUrl).hostname);
  const hasOptIn = process.env.SEED_ALLOW_PRODUCTION === "I_UNDERSTAND_THIS_WIPES_PRODUCTION_DATA";
  if (!isNonProd && !hasOptIn) {
    console.error(
      "\n❌ REFUSING TO SEED PRODUCTION DATABASE\n" +
      "   TURSO_DATABASE_URL is set and does not appear to be a test/staging DB.\n" +
      "   This script inserts seed data and could affect production.\n" +
      "\n   To proceed anyway: SEED_ALLOW_PRODUCTION=I_UNDERSTAND_THIS_WIPES_PRODUCTION_DATA npm run seed\n"
    );
    process.exit(1);
  }
}

async function main() {
  console.log("🌟 Seeding database...");

  const now = new Date().toISOString();

  // ─── Site Settings ───
  await client.execute({
    sql: `INSERT OR IGNORE INTO SiteSettings (
      id, coupleName, weddingDate, venueName, venueAddress, ceremonyType,
      weddingTime, receptionTime, dressCode, heroTagline, heroTaglinePostWedding, childrenPolicy,
      parkingInfo, weatherInfo, ogDescription, weddingHashtag, bannerColor,
      unpluggedCeremonyNotice, rafflePrize, raffleTicketCount,
      contactPhoneAshley, contactPhoneJacob, contactPhoneMaryLorraine, contactPhoneMollie,
      dressCodePinterestLink, dressCodeImages, ourStoryContent,
      updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      "singleton",
      "Jacob & Ashley",
      "2026-11-13T00:00:00.000Z",
      "The Highland Manor",
      "Apopka, Florida",
      "Outdoor Ceremony & Indoor Reception",
      "16:15",
      "",
      "Creative Cocktail meets Celestial Formal. Dress your best and go as crazy as you like to fit the celestial theme. Dressing on theme is encouraged but NOT required. No cream or ivory. No casual wear. The ceremony is outdoors — keep an eye on the weather.",
      "Written in the stars",
      "The stars aligned ✨",
      "Children are welcome! Age limits and kid-specific activities are being planned. Family members of the bridal party will be available to help supervise.",
      "Yes, free parking is available on-site at The Highland Manor.",
      "Central Florida can be warm and humid. The ceremony is outdoors, so we recommend light, breathable fabrics. The reception is indoors and air-conditioned.",
      "We're getting married! Join us for our celebration under the stars.",
      "#ForeverCampbells",
      "gold",
      "We kindly ask for an unplugged ceremony — please silence phones and put cameras away so we can all be present in the moment. Our professional photographer will capture every moment!",
      "Theme Park Tickets",
      4,
      "954-299-0036",
      "321-698-1359",
      "931-303-7990",
      "321-480-9941",
      "https://www.pinterest.com/rachelzoeg/creative-cocktail-meets-celestial-formal/",
      JSON.stringify([
        "https://i.pinimg.com/736x/b3/97/47/b397479ef222e1e14ad8c51437ae74d8.jpg",
        "https://i.pinimg.com/736x/06/70/8d/06708d6e1eadd2b8c2a452bdf7f35f7a.jpg",
        "https://i.pinimg.com/736x/57/ef/e5/57efe5ed180b104d23ed0b8e4f62cae6.jpg",
        "https://i.pinimg.com/736x/84/63/eb/8463eb42b06d40ed6077314cd6015e55.jpg",
        "https://i.pinimg.com/736x/d2/85/a4/d285a4c06a296c6cdb1dd52ff467f710.jpg",
        "https://i.pinimg.com/736x/5b/39/61/5b396152689a13694577c14e06ed752c.jpg"
      ]),
      `<h2>Our First Date</h2>
<p><strong>1. The Selfie.</strong> Jacob posted his <em>illegal</em> locker room mirror selfie. Ashley, of course, went out of her way to message him and threaten to report him — it had nothing to do with how good he looked in uniform. She finally scored a date. ;)</p>
<p><strong>2. First Look.</strong> Google Maps can take the blame for always directing guests to the wrong side of Ashley's apartment — but that's how she saw him first. Jacob was leaning against his car, waiting for her to come down the wrong stairs. When he turned, she saw that smile in person for the very first time.</p>
<p><strong>3. Sushi.</strong> The gentleman he is, Jacob let Ashley pick their first date. She chose sushi. He sweetly let her eat most of what they ordered. It wasn't until much later that she found out he's not a big fan of sushi.</p>
<p><strong>4. The Best Uber Ride.</strong> Jacob was pledging a fraternity and on "duty" that night — meaning he was on call as a driver for whatever the frat needed. It turned out to be the perfect recipe for endless conversation and nonstop laughter.</p>
<p><strong>5. The After-Party.</strong> They ended the night at his apartment, hanging out with roommates and friends, playing games, and laughing until late. The rest, as they say, is history.</p>
<h2>Snowboarding</h2>
<p>Jacob taught Ashley how to snowboard — patiently, over many seasons — and it's become one of the things they look forward to most each winter. From those first shaky runs to chasing fresh powder on trips across the country, the mountains have been the backdrop for some of their favorite memories together. When Jacob broke his arm on the very first day of one trip, Ashley stepped up without hesitation — keeping spirits high, handling everything, and refusing to let him hang up his board for good. She's been helping him push through the ailments of old age ever since. (He's 29.) Whether it's a quick weekend getaway or a full week on the slopes, snowboarding is <em>their</em> adventure.</p>
<h2>Universal</h2>
<p>They matched on Tinder, but both working at Universal had an even bigger impact. Their first conversation began when Ashley responded to a selfie Jacob posted at work. Many of their early dates were at the parks — endless new experiences and countless chances to learn about each other.</p>
<p>Their Universal dates never stopped. Over the years, they've brought both families, nieces and nephews, to the parks for fun and relaxation. Jacob pushed Ashley to go after the job she loves there, helping her grow into the person she is today.</p>
<p>Jacob proposed in front of the Universal globe, followed by an unforgettable weekend at Universal and Volcano Bay with their families. They took their engagement photos at Epic Universe. Full circle. ♡</p>`,
      now,
    ],
  });

  // ─── Wedding Party: Bridesmaids ───
  const bridesmaids = [
    { name: "Jessica", role: "Bridesmaid", side: "bride", sortOrder: 1 },
    { name: "Sarena", role: "Bridesmaid", side: "bride", sortOrder: 2 },
    { name: "Carolyn", role: "Bridesmaid", side: "bride", sortOrder: 3 },
    { name: "Kayla", role: "Bridesmaid", side: "bride", sortOrder: 4 },
    { name: "Rachel", role: "Bridesmaid", side: "bride", sortOrder: 5 },
    { name: "Milan", role: "Bridesmaid", side: "bride", sortOrder: 6 },
  ];

  // ─── Wedding Party: Groomsmen ───
  const groomsmen = [
    { name: "Lori", role: "Best Man", side: "groom", sortOrder: 1 },
    { name: "Semih", role: "Groomsman", side: "groom", sortOrder: 2 },
    { name: "David", role: "Groomsman", side: "groom", sortOrder: 3 },
    { name: "Andrew", role: "Groomsman", side: "groom", sortOrder: 4 },
    { name: "Nathaniel", role: "Groomsman", side: "groom", sortOrder: 5 },
    { name: "Cole", role: "Groomsman", side: "groom", sortOrder: 6 },
  ];

  // ─── Special Roles ───
  const specialRoles = [
    { name: "Alara", role: "Flower Girl", side: "bride", sortOrder: 7 },
    { name: "Aiden", role: "Ring Bearer", side: "groom", sortOrder: 7 },
    { name: "Arthur", role: "Ring Bearer", side: "groom", sortOrder: 8 },
    { name: "Henry", role: "Ring Bearer", side: "groom", sortOrder: 9 },
  ];

  const allPartyMembers = [...bridesmaids, ...groomsmen, ...specialRoles];

  for (const member of allPartyMembers) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO WeddingPartyMember (id, name, role, side, sortOrder, createdAt, updatedAt)
            SELECT ?, ?, ?, ?, ?, ?, ?
            WHERE NOT EXISTS (
              SELECT 1 FROM WeddingPartyMember WHERE name = ? AND role = ?
            )`,
      args: [
        crypto.randomUUID(),
        member.name,
        member.role,
        member.side,
        member.sortOrder,
        now,
        now,
        member.name,
        member.role,
      ],
    });
  }

  // ─── Hotels ───
  const hotels = [
    {
      name: "Hilton Garden Inn Apopka City Center",
      address: "Apopka, FL",
      phone: "1-800-HILTONS",
      bookingLink: "https://www.hilton.com/en/attend-my-event/garcia-campbell-wedding/",
      blockCode: "93E",
      blockDeadline: "2026-10-13",
      notes: "On-site venue hotel — book by phone with code \"93E\" or use the booking link.",
      sortOrder: 1,
    },
    {
      name: "Embassy Suites by Hilton",
      address: "Near Apopka, FL",
      sortOrder: 2,
    },
    {
      name: "Hampton Inn Apopka",
      address: "Apopka, FL",
      sortOrder: 3,
    },
  ];

  for (const hotel of hotels) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO Hotel (id, name, address, phone, bookingLink, blockCode, blockDeadline, notes, sortOrder)
            SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?
            WHERE NOT EXISTS (
              SELECT 1 FROM Hotel WHERE name = ?
            )`,
      args: [
        crypto.randomUUID(),
        hotel.name,
        hotel.address,
        hotel.phone ?? "",
        hotel.bookingLink ?? "",
        hotel.blockCode ?? "",
        hotel.blockDeadline ?? null,
        hotel.notes ?? "",
        hotel.sortOrder,
        hotel.name,
      ],
    });
  }

  // ─── Registry Items ───
  const registryItems = [
    {
      name: "Amazon",
      url: "https://www.amazon.com/wedding/registry",
      sortOrder: 1,
      itemType: "store",
      description: null as string | null,
      status: "active",
    },
    {
      name: "GoFundMe",
      url: "",
      sortOrder: 2,
      itemType: "fund",
      description: "Help us start our life together in a new home.",
      status: "active",
      goalAmount: null as number | null,
    },
    {
      name: "House Fund",
      url: "",
      sortOrder: 3,
      itemType: "fund",
      description: "Every contribution brings us closer to our dream home.",
      status: "active",
      goalAmount: null as number | null,
    },
  ];

  for (const item of registryItems) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO RegistryItem (id, name, url, sortOrder, itemType, description, status, goalAmount)
            SELECT ?, ?, ?, ?, ?, ?, ?, ?
            WHERE NOT EXISTS (
              SELECT 1 FROM RegistryItem WHERE name = ?
            )`,
      args: [
        crypto.randomUUID(),
        item.name,
        item.url,
        item.sortOrder,
        item.itemType,
        item.description,
        item.status,
        (item as any).goalAmount ?? null,
        item.name,
      ],
    });
  }

  // ─── FAQs ───
  const faqs = [
    {
      question: "Where can I find all the wedding details?",
      answer:
        "Everything you need is at forevercampbells.com — RSVP, event schedule, travel info, registry, and more. Bookmark it and check back for updates!",
      sortOrder: 0,
    },
    {
      question: "What is the dress code?",
      answer: "Creative Cocktail meets Celestial Formal. Dress your best and go as crazy as you like to fit the celestial theme. Dressing on theme is encouraged but NOT required. No cream or ivory. No casual wear. The ceremony is outdoors — keep an eye on the weather.",
      sortOrder: 1,
    },
    {
      question: "Can I bring a plus one?",
      answer:
        "Plus ones are by invitation only. Please check your RSVP for details.",
      sortOrder: 2,
    },
    {
      question: "Are children welcome?",
      answer:
        "Children are welcome! Age limits and kid-specific activities are being planned. Family members of the bridal party will be available to help supervise.",
      sortOrder: 3,
    },
    {
      question: "Can I take photos during the ceremony?",
      answer:
        "We kindly ask for an unplugged ceremony — no phones or cameras. Our professional photographer will capture every moment, and we'll share the photos with you afterward!",
      sortOrder: 4,
    },
    {
      question: "What's the weather like?",
      answer:
        "Central Florida can be warm and humid. The ceremony is outdoors, so we recommend light, breathable fabrics. The reception is indoors and air-conditioned.",
      sortOrder: 5,
    },
    {
      question: "Is there parking?",
      answer:
        "Yes, free parking is available on-site at The Highland Manor.",
      sortOrder: 6,
    },
    {
      question: "Will there be an open bar?",
      answer:
        "Yes! We'll have a full open bar with signature cocktails, wine, beer, and non-alcoholic options.",
      sortOrder: 7,
    },
    {
      question: "Where should I stay?",
      answer:
        "We've arranged room blocks at hotels near the venue. Check our Travel & Stay page for details and booking links.",
      sortOrder: 8,
    },
    {
      question: "What time should I arrive?",
      answer:
        "Please arrive 30 minutes before the ceremony start time. Check our Schedule page for the full schedule.",
      sortOrder: 9,
    },
    {
      question: "How do I share my photos from the wedding?",
      answer:
        "We'll have a photo sharing link available on our website after the wedding. Don't forget to tag your posts with our wedding hashtag!",
      sortOrder: 10,
    },
  ];

  for (const faq of faqs) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO FAQ (id, question, answer, sortOrder)
            SELECT ?, ?, ?, ?
            WHERE NOT EXISTS (
              SELECT 1 FROM FAQ WHERE question = ?
            )`,
      args: [
        crypto.randomUUID(),
        faq.question,
        faq.answer,
        faq.sortOrder,
        faq.question,
      ],
    });
  }

  // ─── Entertainment ───
  const entertainment = [
    {
      name: "Caricature Artist",
      description:
        "Get a fun caricature drawn by a professional artist — a perfect keepsake!",
      icon: "🎨",
      sortOrder: 1,
    },
    {
      name: "Photo Booth",
      description:
        "Strike a pose with fun props and backdrops. Take home your photo prints!",
      icon: "📸",
      sortOrder: 2,
    },
    {
      name: "Tattoos & Glitter Bar",
      description:
        "Temporary tattoos and glitter for a touch of sparkle and fun.",
      icon: "✨",
      sortOrder: 3,
    },
    {
      name: "Paint by Numbers",
      description:
        "Unleash your inner artist with themed paint-by-number canvases.",
      icon: "🖌️",
      sortOrder: 4,
    },
    {
      name: "Themed Crossword Puzzles",
      description:
        "Test your knowledge about the couple with fun crossword puzzles at your table.",
      icon: "📝",
      sortOrder: 5,
    },
    {
      name: "DJ & Dancing",
      description:
        "Dance the night away! Request your favorite songs to get on the dance floor.",
      icon: "🎶",
      sortOrder: 6,
    },
    {
      name: "Theme Park Ticket Raffle",
      description:
        "Enter for a chance to win theme park tickets! Details at the reception.",
      icon: "🎢",
      sortOrder: 7,
    },
  ];

  for (const item of entertainment) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO Entertainment (id, name, description, icon, sortOrder)
            SELECT ?, ?, ?, ?, ?
            WHERE NOT EXISTS (
              SELECT 1 FROM Entertainment WHERE name = ?
            )`,
      args: [
        crypto.randomUUID(),
        item.name,
        item.description,
        item.icon,
        item.sortOrder,
        item.name,
      ],
    });
  }

  // ─── Timeline Events ───
  const timelineEvents = [
    {
      title: "Guest Arrival",
      time: "TBD",
      description: "Welcome to The Highland Manor!",
      eventType: "wedding-day",
      sortOrder: 1,
    },
    {
      title: "Ceremony",
      time: "TBD",
      description:
        "Join us for our outdoor ceremony. Please note: unplugged ceremony — no phones or cameras.",
      eventType: "wedding-day",
      sortOrder: 2,
    },
    {
      title: "Cocktail Hour",
      time: "TBD",
      description:
        "Enjoy cocktails and appetizers while we take photos.",
      eventType: "wedding-day",
      sortOrder: 3,
    },
    {
      title: "Reception",
      time: "TBD",
      description: "Let the celebration begin!",
      eventType: "wedding-day",
      sortOrder: 4,
    },
    {
      title: "Bridal Party Entrance",
      time: "TBD",
      description: "Welcome the wedding party!",
      eventType: "wedding-day",
      sortOrder: 5,
    },
    {
      title: "First Dance",
      time: "TBD",
      description: "Our first dance as a married couple.",
      eventType: "wedding-day",
      sortOrder: 6,
    },
    {
      title: "Dinner",
      time: "TBD",
      description: "Sit-down dinner service.",
      eventType: "wedding-day",
      sortOrder: 7,
    },
    {
      title: "Cake Cutting",
      time: "TBD",
      description: "Time for dessert!",
      eventType: "wedding-day",
      sortOrder: 8,
    },
    {
      title: "Dancing",
      time: "TBD",
      description: "Hit the dance floor!",
      eventType: "wedding-day",
      sortOrder: 9,
    },
    {
      title: "Late Night Snack",
      time: "TBD",
      description: "A late-night treat to keep the party going.",
      eventType: "wedding-day",
      sortOrder: 10,
    },
    {
      title: "Send-Off",
      time: "TBD",
      description:
        "DIY light wands and ribbon wands for a magical send-off!",
      eventType: "wedding-day",
      sortOrder: 11,
    },
  ];

  for (const event of timelineEvents) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO TimelineEvent (id, title, description, time, icon, eventType, sortOrder, createdAt, updatedAt)
            SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?
            WHERE NOT EXISTS (
              SELECT 1 FROM TimelineEvent WHERE title = ? AND eventType = ?
            )`,
      args: [
        crypto.randomUUID(),
        event.title,
        event.description,
        event.time,
        null,
        event.eventType,
        event.sortOrder,
        now,
        now,
        event.title,
        event.eventType,
      ],
    });
  }

  // ─── Feature Flags ───
  const featureFlags = [
    {
      key: "rsvpEnabled",
      enabled: 1,
      description: "Enable RSVP form on the public site",
    },
    {
      key: "photoUploadEnabled",
      enabled: 1,
      description: "Allow guests to upload photos",
    },
    {
      key: "registrySyncEnabled",
      enabled: 1,
      description: "Enable live registry synchronization",
    },
    {
      key: "songRequestsEnabled",
      enabled: 1,
      description: "Enable song requests on RSVP form",
    },
    {
      key: "entertainmentPageEnabled",
      enabled: 1,
      description: "Show entertainment page on the public site",
    },
    {
      key: "guestPhotoSharingEnabled",
      enabled: 1,
      description: "Allow guest photo sharing via the website",
    },
    {
      key: "liveGuestCountEnabled",
      enabled: 0,
      description: "Show live guest count on admin dashboard",
    },
    {
      key: "massEmailEnabled",
      enabled: 1,
      description: "Enable mass email campaigns",
    },
    {
      key: "registryPageEnabled",
      enabled: 1,
      description: "Show the Registry page with gift registry links",
    },
    {
      key: "rafflePageEnabled",
      enabled: 1,
      description: "Show the Raffle page on the public site",
    },
  ];

  for (const flag of featureFlags) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO FeatureFlag (id, key, enabled, description, updatedAt) VALUES (?, ?, ?, ?, ?)`,
      args: [crypto.randomUUID(), flag.key, flag.enabled, flag.description, now],
    });
  }

  // ─── Integration Configs ───
  const integrations = [
    {
      moduleId: "amazon-registry",
      enabled: 0,
    },
  ];

  for (const integration of integrations) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO IntegrationConfig (id, moduleId, enabled)
            SELECT ?, ?, ?
            WHERE NOT EXISTS (
              SELECT 1 FROM IntegrationConfig WHERE moduleId = ?
            )`,
      args: [
        crypto.randomUUID(),
        integration.moduleId,
        integration.enabled,
        integration.moduleId,
      ],
    });
  }

  // ─── Email Templates ───
  const emailTemplates = [
    {
      slug: "save-the-date",
      name: "Save the Date",
      subject: "Save the Date — {{coupleName}}",
      body: "Dear {{guestName}},\n\nWe're thrilled to announce that we're getting married! Please save the date for our wedding celebration.\n\nDate: {{weddingDate}}\nVenue: {{venueName}}\n\nMore details to come. We can't wait to celebrate with you!\n\nWith love,\n{{coupleName}}",
      category: "system",
      variables:
        '["guestName", "coupleName", "weddingDate", "venueName"]',
      isDefault: 1,
    },
    {
      slug: "rsvp-reminder",
      name: "RSVP Reminder",
      subject: "Reminder: Please RSVP for {{coupleName}}'s Wedding",
      body: "Dear {{guestName}},\n\nThis is a friendly reminder to RSVP for our wedding. The deadline is {{rsvpDeadline}}.\n\nRSVP here: {{websiteUrl}}/rsvp\n\nWe hope to see you there!\n\nWith love,\n{{coupleName}}",
      category: "system",
      variables:
        '["guestName", "coupleName", "rsvpDeadline", "websiteUrl"]',
      isDefault: 1,
    },
    {
      slug: "rsvp-confirmation",
      name: "RSVP Confirmation",
      subject: "RSVP Confirmed — {{coupleName}}'s Wedding",
      body: "Dear {{guestName}},\n\nThank you for your RSVP! We've received your response.\n\nStatus: {{rsvpStatus}}\n\nIf you need to make any changes, please visit {{websiteUrl}}/rsvp or contact us.\n\nWith love,\n{{coupleName}}",
      category: "system",
      variables:
        '["guestName", "coupleName", "rsvpStatus", "websiteUrl"]',
      isDefault: 1,
    },
    {
      slug: "wedding-update",
      name: "Wedding Update",
      subject: "Wedding Update from {{coupleName}}",
      body: "Dear {{guestName}},\n\nWe have an exciting update to share about our upcoming wedding!\n\n{{customMessage}}\n\nVisit our website for full details: {{websiteUrl}}\n\nWith love,\n{{coupleName}}",
      category: "system",
      variables:
        '["guestName", "coupleName", "customMessage", "websiteUrl"]',
      isDefault: 1,
    },
    {
      slug: "travel-hotel-info",
      name: "Travel & Hotel Info",
      subject: "Travel & Hotel Info for {{coupleName}}'s Wedding",
      body: "Dear {{guestName}},\n\nHere's everything you need to know about travel and accommodations for our wedding.\n\nVenue: {{venueName}} — {{venueAddress}}\n\nVisit our travel page for hotel recommendations and booking links: {{websiteUrl}}/travel\n\nWith love,\n{{coupleName}}",
      category: "system",
      variables:
        '["guestName", "coupleName", "venueName", "venueAddress", "websiteUrl"]',
      isDefault: 1,
    },
    {
      slug: "day-of-reminder",
      name: "Day-Of Reminder",
      subject: "Tomorrow's the Day! — {{coupleName}}'s Wedding",
      body: "Dear {{guestName}},\n\nThe big day is almost here! Here's a quick reminder:\n\nDate: {{weddingDate}}\nVenue: {{venueName}}\n\nPlease arrive 30 minutes before the ceremony. See the full timeline: {{websiteUrl}}/schedule\n\nWe can't wait to celebrate with you!\n\nWith love,\n{{coupleName}}",
      category: "system",
      variables:
        '["guestName", "coupleName", "weddingDate", "venueName", "websiteUrl"]',
      isDefault: 1,
    },
    {
      slug: "thank-you",
      name: "Thank You",
      subject: "Thank You! — From {{coupleName}}",
      body: "Dear {{guestName}},\n\nThank you so much for being part of our special day! It meant the world to us to have you there.\n\nCheck out photos from the wedding: {{websiteUrl}}/gallery\n\nWith love and gratitude,\n{{coupleName}}",
      category: "system",
      variables: '["guestName", "coupleName", "websiteUrl"]',
      isDefault: 1,
    },
    {
      slug: "photo-share-invite",
      name: "Photo Share Invite",
      subject: "Share Your Photos from {{coupleName}}'s Wedding!",
      body: "Dear {{guestName}},\n\nWe'd love to see your photos from the wedding! Upload and share them here:\n\n{{photoShareLink}}\n\nDon't forget to tag your social posts with {{weddingHashtag}}!\n\nWith love,\n{{coupleName}}",
      category: "system",
      variables:
        '["guestName", "coupleName", "photoShareLink", "weddingHashtag"]',
      isDefault: 1,
    },
  ];

  for (const template of emailTemplates) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO EmailTemplate (id, slug, name, subject, body, category, variables, isDefault, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        crypto.randomUUID(),
        template.slug,
        template.name,
        template.subject,
        template.body,
        template.category,
        template.variables,
        template.isDefault,
        now,
        now,
      ],
    });
  }

  // ─── Photo Tags ───
  const photoTags = [
    { name: "Ceremony", type: "event", color: "#C9A84C", sortOrder: 1 },
    { name: "Cocktail Hour", type: "event", color: "#F59E0B", sortOrder: 2 },
    { name: "Reception", type: "event", color: "#3B82F6", sortOrder: 3 },
    { name: "First Dance", type: "event", color: "#EC4899", sortOrder: 4 },
    { name: "Cake Cutting", type: "event", color: "#8B5CF6", sortOrder: 5 },
    { name: "Send-Off", type: "event", color: "#10B981", sortOrder: 6 },
    { name: "Getting Ready", type: "event", color: "#06B6D4", sortOrder: 7 },
    { name: "Rehearsal Dinner", type: "event", color: "#F97316", sortOrder: 8 },
    { name: "Jacob", type: "person", color: "#3B82F6", sortOrder: 1 },
    { name: "Ashley", type: "person", color: "#EC4899", sortOrder: 2 },
    { name: "Wedding Party", type: "person", color: "#8B5CF6", sortOrder: 3 },
    { name: "Family", type: "person", color: "#10B981", sortOrder: 4 },
    { name: "Guests", type: "person", color: "#F59E0B", sortOrder: 5 },
    { name: "The Highland Manor", type: "location", color: "#06B6D4", sortOrder: 1 },
    { name: "Engagement", type: "custom", color: "#EC4899", sortOrder: 1 },
    { name: "Details & Décor", type: "custom", color: "#C9A84C", sortOrder: 2 },
    { name: "Photo Booth", type: "custom", color: "#8B5CF6", sortOrder: 3 },
  ];

  for (const tag of photoTags) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO PhotoTag (id, name, type, color, sortOrder)
            SELECT ?, ?, ?, ?, ?
            WHERE NOT EXISTS (
              SELECT 1 FROM PhotoTag WHERE name = ? AND type = ?
            )`,
      args: [
        crypto.randomUUID(),
        tag.name,
        tag.type,
        tag.color,
        tag.sortOrder,
        tag.name,
        tag.type,
      ],
    });
  }

  // ─── Test Guests ───
  interface GuestSeed {
    firstName: string;
    lastName: string;
    email: string | null;
    phone?: string | null;
    rsvpStatus: string;
    plusOneAllowed: boolean;
    plusOneName?: string | null;
    dietaryNeeds?: string | null;
    childrenCount?: number;
    childrenNames?: string | null;
    inviteToken?: string | null;
    rsvpRespondedAt?: string | null;
  }

  const testGuests: GuestSeed[] = [
    // ── Already responded ──
    {
      firstName: "Robert", lastName: "Garcia", email: "robert.garcia@example.com", phone: "407-555-1001",
      rsvpStatus: "attending", plusOneAllowed: false,
      dietaryNeeds: "No dairy", rsvpRespondedAt: "2026-06-01T12:00:00.000Z",
    },
    {
      firstName: "Maria", lastName: "Garcia", email: "maria.garcia@example.com", phone: "407-555-1002",
      rsvpStatus: "attending", plusOneAllowed: false,
      rsvpRespondedAt: "2026-06-01T12:00:00.000Z",
    },
    {
      firstName: "Emily", lastName: "Chen", email: "emily.chen@example.com",
      rsvpStatus: "attending", plusOneAllowed: true, plusOneName: "David Kim",
      dietaryNeeds: "Vegetarian", rsvpRespondedAt: "2026-06-03T14:30:00.000Z",
    },
    {
      firstName: "James", lastName: "Wilson", email: "james.wilson@example.com", phone: "321-555-2001",
      rsvpStatus: "declined", plusOneAllowed: false,
      rsvpRespondedAt: "2026-06-05T09:15:00.000Z",
    },
    {
      firstName: "Sarah", lastName: "Thompson", email: "sarah.t@example.com",
      rsvpStatus: "attending", plusOneAllowed: true,
      dietaryNeeds: "Gluten-free", rsvpRespondedAt: "2026-06-10T16:45:00.000Z",
    },
    // ── Pending — family ──
    {
      firstName: "Patricia", lastName: "Campbell", email: "patricia.campbell@example.com", phone: "352-555-3001",
      rsvpStatus: "pending", plusOneAllowed: false,
    },
    {
      firstName: "Michael", lastName: "Campbell", email: null, phone: "352-555-3002",
      rsvpStatus: "pending", plusOneAllowed: false,
    },
    {
      firstName: "Linda", lastName: "Martinez", email: "linda.m@example.com",
      rsvpStatus: "pending", plusOneAllowed: false, childrenCount: 2,
      childrenNames: "Sofia, Diego",
    },
    {
      firstName: "Carlos", lastName: "Martinez", email: "carlos.m@example.com",
      rsvpStatus: "pending", plusOneAllowed: false, childrenCount: 2,
    },
    // ── Pending — friends ──
    {
      firstName: "Amanda", lastName: "Brooks", email: "amanda.brooks@example.com",
      rsvpStatus: "pending", plusOneAllowed: true,
    },
    {
      firstName: "Ryan", lastName: "Taylor", email: "ryan.taylor@example.com", phone: "407-555-4001",
      rsvpStatus: "pending", plusOneAllowed: false,
    },
    {
      firstName: "Jessica", lastName: "Moore", email: "jessica.moore@example.com",
      rsvpStatus: "pending", plusOneAllowed: true,
    },
    {
      firstName: "Daniel", lastName: "Lee", email: "daniel.lee@example.com", phone: "321-555-5001",
      rsvpStatus: "pending", plusOneAllowed: false,
      dietaryNeeds: "Nut allergy",
    },
    {
      firstName: "Olivia", lastName: "Brown", email: null,
      rsvpStatus: "pending", plusOneAllowed: true,
    },
    // ── Pending — with invite tokens (for token-based lookup testing) ──
    {
      firstName: "Thomas", lastName: "Anderson", email: "thomas.anderson@example.com",
      rsvpStatus: "pending", plusOneAllowed: false,
      inviteToken: "TK-ANDERSON-001",
    },
    {
      firstName: "Rachel", lastName: "Anderson", email: "rachel.anderson@example.com",
      rsvpStatus: "pending", plusOneAllowed: false,
      inviteToken: "TK-ANDERSON-002",
    },
    {
      firstName: "William", lastName: "Davis", email: "will.davis@example.com", phone: "407-555-6001",
      rsvpStatus: "pending", plusOneAllowed: true,
      inviteToken: "TK-DAVIS-001",
    },
    // ── Pending — extended family ──
    {
      firstName: "Barbara", lastName: "Johnson", email: null, phone: "352-555-7001",
      rsvpStatus: "pending", plusOneAllowed: false,
    },
    {
      firstName: "Christopher", lastName: "Smith", email: "chris.smith@example.com",
      rsvpStatus: "pending", plusOneAllowed: true, childrenCount: 1,
      childrenNames: "Emma", dietaryNeeds: "No shellfish",
    },
    {
      firstName: "Megan", lastName: "Williams", email: "megan.w@example.com",
      rsvpStatus: "pending", plusOneAllowed: false,
      dietaryNeeds: "Vegan",
    },
  ];

  for (const g of testGuests) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO Guest (
              id, firstName, lastName, email, phone, rsvpStatus,
              plusOneAllowed, plusOneName, dietaryNeeds, childrenCount,
              childrenNames, inviteToken, rsvpRespondedAt, createdAt, updatedAt
            )
            SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            WHERE NOT EXISTS (
              SELECT 1 FROM Guest WHERE firstName = ? AND lastName = ?
            )`,
      args: [
        crypto.randomUUID(), g.firstName, g.lastName,
        g.email ?? null, g.phone ?? null, g.rsvpStatus,
        g.plusOneAllowed ? 1 : 0, g.plusOneName ?? null, g.dietaryNeeds ?? null,
        g.childrenCount ?? 0, g.childrenNames ?? null, g.inviteToken ?? null,
        g.rsvpRespondedAt ?? null, now, now,
        g.firstName, g.lastName,
      ],
    });
  }

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => {
    client.close();
  });
