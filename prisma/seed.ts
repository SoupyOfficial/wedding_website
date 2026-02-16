import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

function createClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoUrl && tursoToken) {
    console.log("🔗 Connecting to Turso...");
    const adapter = new PrismaLibSQL({ url: tursoUrl, authToken: tursoToken });
    return new PrismaClient({ adapter });
  }

  console.log("📁 Connecting to local SQLite...");
  return new PrismaClient();
}

const prisma = createClient();

async function main() {
  console.log("🌟 Seeding database...");

  // ─── Site Settings ───
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {
      weddingDate: new Date("2026-11-13T00:00:00.000Z"),
    },
    create: {
      id: "singleton",
      coupleName: "Jacob & Ashley",
      weddingDate: new Date("2026-11-13T00:00:00.000Z"),
      venueName: "The Highland Manor",
      venueAddress: "Apopka, Florida",
      ceremonyType: "Outdoor Ceremony & Indoor Reception",
      dressCode: "Formal / Semi-Formal attire",
      heroTagline: "We're getting married!",
      heroTaglinePostWedding: "We did it! 🎉",
      childrenPolicy:
        "Children are welcome! Age limits and kid-specific activities to be determined. Babysitter(s) will be arranged for the event.",
      parkingInfo:
        "Yes, free parking is available on-site at The Highland Manor.",
      weatherInfo:
        "Central Florida can be warm and humid. The ceremony is outdoors, so we recommend light, breathable fabrics. The reception is indoors and air-conditioned.",
      ogDescription:
        "We're getting married! Join us for our celebration under the stars.",
      weddingHashtag: "#ForeverCampbells",
      bannerColor: "gold",
    },
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
    const existing = await prisma.weddingPartyMember.findFirst({
      where: { name: member.name, role: member.role },
    });
    if (!existing) {
      await prisma.weddingPartyMember.create({ data: member });
    }
  }

  // ─── Hotels ───
  const hotels = [
    {
      name: "Hilton Garden Inn Apopka City Center",
      address: "Apopka, FL",
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
    const existing = await prisma.hotel.findFirst({
      where: { name: hotel.name },
    });
    if (!existing) {
      await prisma.hotel.create({ data: hotel });
    }
  }

  // ─── Registry Items ───
  const registryItems = [
    {
      name: "Amazon",
      url: "https://www.amazon.com/wedding/registry",
      sortOrder: 1,
    },
  ];

  for (const item of registryItems) {
    const existing = await prisma.registryItem.findFirst({
      where: { name: item.name },
    });
    if (!existing) {
      await prisma.registryItem.create({ data: item });
    }
  }

  // ─── FAQs ───
  const faqs = [
    {
      question: "What is the dress code?",
      answer: "Formal / Semi-Formal attire. Please dress to impress!",
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
        "Children are welcome! Age limits and kid-specific activities are being planned. Babysitter(s) will be arranged for the event.",
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
        "Please arrive 30 minutes before the ceremony start time. Check our Event Details page for the full schedule.",
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
    const existing = await prisma.fAQ.findFirst({
      where: { question: faq.question },
    });
    if (!existing) {
      await prisma.fAQ.create({ data: faq });
    }
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
    const existing = await prisma.entertainment.findFirst({
      where: { name: item.name },
    });
    if (!existing) {
      await prisma.entertainment.create({ data: item });
    }
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
      title: "First Dances",
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
    const existing = await prisma.timelineEvent.findFirst({
      where: { title: event.title, eventType: event.eventType },
    });
    if (!existing) {
      await prisma.timelineEvent.create({ data: event });
    }
  }

  // ─── Meal Options ───
  const mealOptions = [
    {
      name: "Chicken",
      description: "Herb-crusted chicken breast",
      sortOrder: 1,
    },
    {
      name: "Steak",
      description: "Grilled filet mignon",
      sortOrder: 2,
    },
    {
      name: "Fish",
      description: "Pan-seared salmon",
      sortOrder: 3,
    },
    {
      name: "Vegetarian",
      description: "Garden vegetable medley",
      sortOrder: 4,
    },
  ];

  for (const option of mealOptions) {
    const existing = await prisma.mealOption.findFirst({
      where: { name: option.name },
    });
    if (!existing) {
      await prisma.mealOption.create({ data: option });
    }
  }

  // ─── Feature Flags ───
  const featureFlags = [
    {
      key: "rsvpEnabled",
      enabled: true,
      description: "Enable RSVP form on the public site",
    },
    {
      key: "guestBookEnabled",
      enabled: true,
      description: "Enable guest book signing on the public site",
    },
    {
      key: "photoUploadEnabled",
      enabled: true,
      description: "Allow guests to upload photos",
    },
    {
      key: "registrySyncEnabled",
      enabled: true,
      description: "Enable live registry synchronization",
    },
    {
      key: "songRequestsEnabled",
      enabled: true,
      description: "Enable song requests on RSVP form",
    },
    {
      key: "entertainmentPageEnabled",
      enabled: true,
      description: "Show entertainment page on the public site",
    },
    {
      key: "guestPhotoSharingEnabled",
      enabled: true,
      description: "Allow guest photo sharing via the website",
    },
    {
      key: "liveGuestCountEnabled",
      enabled: false,
      description: "Show live guest count on admin dashboard",
    },
    {
      key: "massEmailEnabled",
      enabled: true,
      description: "Enable mass email campaigns",
    },
  ];

  for (const flag of featureFlags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {},
      create: flag,
    });
  }

  // ─── Integration Configs ───
  const integrations = [
    {
      moduleId: "amazon-registry",
      enabled: false,
    },
  ];

  for (const integration of integrations) {
    const existing = await prisma.integrationConfig.findFirst({
      where: { moduleId: integration.moduleId },
    });
    if (!existing) {
      await prisma.integrationConfig.create({ data: integration });
    }
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
      isDefault: true,
    },
    {
      slug: "rsvp-reminder",
      name: "RSVP Reminder",
      subject: "Reminder: Please RSVP for {{coupleName}}'s Wedding",
      body: "Dear {{guestName}},\n\nThis is a friendly reminder to RSVP for our wedding. The deadline is {{rsvpDeadline}}.\n\nRSVP here: {{websiteUrl}}/rsvp\n\nWe hope to see you there!\n\nWith love,\n{{coupleName}}",
      category: "system",
      variables:
        '["guestName", "coupleName", "rsvpDeadline", "websiteUrl"]',
      isDefault: true,
    },
    {
      slug: "rsvp-confirmation",
      name: "RSVP Confirmation",
      subject: "RSVP Confirmed — {{coupleName}}'s Wedding",
      body: "Dear {{guestName}},\n\nThank you for your RSVP! We've received your response.\n\nStatus: {{rsvpStatus}}\n\nIf you need to make any changes, please visit {{websiteUrl}}/rsvp or contact us.\n\nWith love,\n{{coupleName}}",
      category: "system",
      variables:
        '["guestName", "coupleName", "rsvpStatus", "websiteUrl"]',
      isDefault: true,
    },
    {
      slug: "wedding-update",
      name: "Wedding Update",
      subject: "Wedding Update from {{coupleName}}",
      body: "Dear {{guestName}},\n\nWe have an exciting update to share about our upcoming wedding!\n\n{{customMessage}}\n\nVisit our website for full details: {{websiteUrl}}\n\nWith love,\n{{coupleName}}",
      category: "system",
      variables:
        '["guestName", "coupleName", "customMessage", "websiteUrl"]',
      isDefault: true,
    },
    {
      slug: "travel-hotel-info",
      name: "Travel & Hotel Info",
      subject: "Travel & Hotel Info for {{coupleName}}'s Wedding",
      body: "Dear {{guestName}},\n\nHere's everything you need to know about travel and accommodations for our wedding.\n\nVenue: {{venueName}} — {{venueAddress}}\n\nVisit our travel page for hotel recommendations and booking links: {{websiteUrl}}/travel\n\nWith love,\n{{coupleName}}",
      category: "system",
      variables:
        '["guestName", "coupleName", "venueName", "venueAddress", "websiteUrl"]',
      isDefault: true,
    },
    {
      slug: "day-of-reminder",
      name: "Day-Of Reminder",
      subject: "Tomorrow's the Day! — {{coupleName}}'s Wedding",
      body: "Dear {{guestName}},\n\nThe big day is almost here! Here's a quick reminder:\n\nDate: {{weddingDate}}\nVenue: {{venueName}}\n\nPlease arrive 30 minutes before the ceremony. See the full timeline: {{websiteUrl}}/event-details\n\nWe can't wait to celebrate with you!\n\nWith love,\n{{coupleName}}",
      category: "system",
      variables:
        '["guestName", "coupleName", "weddingDate", "venueName", "websiteUrl"]',
      isDefault: true,
    },
    {
      slug: "thank-you",
      name: "Thank You",
      subject: "Thank You! — From {{coupleName}}",
      body: "Dear {{guestName}},\n\nThank you so much for being part of our special day! It meant the world to us to have you there.\n\nCheck out photos from the wedding: {{websiteUrl}}/gallery\n\nWith love and gratitude,\n{{coupleName}}",
      category: "system",
      variables: '["guestName", "coupleName", "websiteUrl"]',
      isDefault: true,
    },
    {
      slug: "photo-share-invite",
      name: "Photo Share Invite",
      subject: "Share Your Photos from {{coupleName}}'s Wedding!",
      body: "Dear {{guestName}},\n\nWe'd love to see your photos from the wedding! Upload and share them here:\n\n{{photoShareLink}}\n\nDon't forget to tag your social posts with {{weddingHashtag}}!\n\nWith love,\n{{coupleName}}",
      category: "system",
      variables:
        '["guestName", "coupleName", "photoShareLink", "weddingHashtag"]',
      isDefault: true,
    },
  ];

  for (const template of emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { slug: template.slug },
      update: {},
      create: template,
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
    const existing = await prisma.photoTag.findFirst({
      where: { name: tag.name, type: tag.type },
    });
    if (!existing) {
      await prisma.photoTag.create({ data: tag });
    }
  }

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
