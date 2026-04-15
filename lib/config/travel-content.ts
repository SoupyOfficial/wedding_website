// Static travel content — extracted from the travel page for maintainability.
// Move to DB/admin in a future phase for runtime editing.

export interface Airport {
  name: string;
  code: string;
  subtitle: string;
  details: string[];
}

export interface TransportOption {
  name: string;
  description: string;
  details: string[];
}

export interface RailOrDriveOption {
  name: string;
  description: string;
  /** Use `{{parkingInfo}}` as a placeholder for the dynamic parking info from settings. */
  details: string[];
}

export interface FeaturedPark {
  name: string;
  icon: string;
  description: string;
  subParks: { name: string; description: string }[];
  details: string[];
}

export interface ThemePark {
  name: string;
  icon: string;
  distance: string;
  description: string;
}

export interface Restaurant {
  name: string;
  icon: string;
  meta: string;
  description: string;
}

export interface LocalActivity {
  name: string;
  icon: string;
  description: string;
}

// ─── Airports ────────────────────────────────────────────────────────

export const airports: Airport[] = [
  {
    name: "Orlando International Airport (MCO)",
    code: "MCO",
    subtitle: "Recommended — Most Flights",
    details: [
      "~35 minutes from the venue",
      "Major hub with direct flights from most U.S. cities",
      "All major airlines (Delta, United, American, Southwest, JetBlue, Spirit, Frontier)",
      "Car rental counters on-site at the terminal",
      "Rideshare pickup at Level 2 of the terminal garages",
    ],
  },
  {
    name: "Orlando Sanford International (SFB)",
    code: "SFB",
    subtitle: "Budget-Friendly Alternative",
    details: [
      "~40 minutes from the venue",
      "Smaller, less crowded airport",
      "Budget carriers (Allegiant Air, international charters)",
      "Fewer rental car options — book in advance",
      "Good option if coming from smaller regional airports",
    ],
  },
];

// ─── Ground Transportation ──────────────────────────────────────────

export const groundTransport: TransportOption[] = [
  {
    name: "Rental Cars",
    description:
      "Highly recommended for getting around Orlando. The venue and most attractions require driving.",
    details: [
      "Available at both airports",
      "Enterprise, Hertz, National, Budget, Avis",
      "Free parking available at the venue",
    ],
  },
  {
    name: "Rideshare",
    description:
      "Uber and Lyft are widely available throughout Orlando and surrounding areas.",
    details: [
      "Airport to venue: ~$25–40",
      "Available 24/7",
      "Great for evenings out or the wedding itself",
    ],
  },
  {
    name: "Shuttle & Taxi",
    description:
      "Hotel shuttles and taxi services are also available options.",
    details: [
      "Many hotels offer complimentary airport shuttles",
      "Mears Transportation for pre-booked shuttles",
      "Taxis available at airport taxi stands",
    ],
  },
];

// ─── Rail & Driving ─────────────────────────────────────────────────

export const railAndDriving: RailOrDriveOption[] = [
  {
    name: "Brightline High-Speed Rail",
    description:
      "Florida\u2019s high-speed rail service connects South Florida to Orlando in comfort and style.",
    details: [
      "Stations: Miami, Fort Lauderdale, Aventura, Boca Raton, West Palm Beach \u2192 Orlando",
      "Orlando station at the airport (MCO)",
      "Travel time: ~3\u20133.5 hours from Miami",
      "Smart (economy) and Premium class seating",
    ],
  },
  {
    name: "Driving Directions",
    description:
      "Orlando is centrally located in Florida and easily accessible by car.",
    details: [
      "From Miami: ~3.5 hours via Florida\u2019s Turnpike",
      "From Tampa: ~1.5 hours via I-4 East",
      "From Jacksonville: ~2 hours via I-95 South \u2192 I-4 West",
      "Key highways near the venue: I-4, FL-429, US-441",
      "{{parkingInfo}}",
    ],
  },
];

export const DEFAULT_PARKING_INFO = "Free parking is available on-site at the venue";

// ─── Featured Attraction ────────────────────────────────────────────

export const featuredPark: FeaturedPark = {
  name: "Universal Orlando Resort",
  icon: "\uD83C\uDFA2",
  description:
    "Home to some of the most thrilling rides and immersive experiences in the world. " +
    "With three incredible theme parks, there\u2019s something for everyone \u2014 from " +
    "The Wizarding World of Harry Potter to epic roller coasters and brand-new worlds to explore.",
  subParks: [
    {
      name: "Universal Studios",
      description: "Movies come to life \u2014 rides, shows, & Diagon Alley",
    },
    {
      name: "Islands of Adventure",
      description: "Hogwarts, Jurassic World, & thrill rides",
    },
    {
      name: "Epic Universe",
      description:
        "Brand new park \u2014 How to Train Your Dragon, Super Nintendo World, & more",
    },
  ],
  details: [
    "~30 minutes from the venue",
    "Multi-day and park-to-park tickets available",
    "On-site resort hotels with Early Park Admission perks",
    "CityWalk dining & nightlife included with park admission",
  ],
};

// ─── Theme Parks ────────────────────────────────────────────────────

export const themeParks: ThemePark[] = [
  {
    name: "Walt Disney World",
    icon: "\uD83C\uDFF0",
    distance: "~30 min from venue",
    description:
      "Four theme parks \u2014 Magic Kingdom, EPCOT, Hollywood Studios, and Animal Kingdom. Plus Disney Springs for shopping & dining.",
  },
  {
    name: "SeaWorld Orlando",
    icon: "\uD83D\uDC2C",
    distance: "~35 min from venue",
    description:
      "Marine life encounters, roller coasters, and shows. Also check out Aquatica water park nearby.",
  },
  {
    name: "LEGOLAND Florida",
    icon: "\uD83C\uDF0A",
    distance: "~45 min from venue",
    description:
      "Perfect for families with younger kids. Interactive rides, building experiences, and a water park.",
  },
  {
    name: "TopGolf Orlando",
    icon: "\uD83C\uDFCC\uFE0F",
    distance: "~25 min from venue",
    description:
      "High-tech driving range with games, food, drinks, and entertainment for groups.",
  },
  {
    name: "Orlando Premium Outlets",
    icon: "\uD83D\uDECD\uFE0F",
    distance: "~30 min from venue",
    description:
      "Two locations with 150+ designer and name-brand stores at discounted prices.",
  },
  {
    name: "Wekiwa Springs State Park",
    icon: "\uD83C\uDF3F",
    distance: "~15 min from venue",
    description:
      "Natural Florida at its best \u2014 crystal-clear springs, kayaking, hiking trails, and wildlife.",
  },
];

// ─── Dining ─────────────────────────────────────────────────────────

export const restaurants: Restaurant[] = [
  {
    name: "The Catfish Place",
    icon: "\uD83E\uDD69",
    meta: "~10 min \u00B7 Casual \u00B7 $$",
    description:
      "A beloved local spot for Southern comfort food \u2014 catfish, gator bites, and hush puppies.",
  },
  {
    name: "Ciao Italian Grill",
    icon: "\uD83C\uDF55",
    meta: "~15 min \u00B7 Italian \u00B7 $$",
    description:
      "Cozy Italian restaurant with homemade pastas, wood-fired pizzas, and great wine selections.",
  },
  {
    name: "Hunger Street Tacos",
    icon: "\uD83C\uDF2E",
    meta: "~20 min \u00B7 Mexican \u00B7 $",
    description:
      "Trendy taqueria with creative street tacos, fresh guac, and craft margaritas.",
  },
  {
    name: "First Watch",
    icon: "\uD83C\uDF73",
    meta: "~15 min \u00B7 Brunch \u00B7 $$",
    description:
      "Perfect for a morning-after brunch \u2014 fresh juices, avocado toast, and egg specialties.",
  },
  {
    name: "4 Rivers Smokehouse",
    icon: "\uD83C\uDF54",
    meta: "~20 min \u00B7 BBQ \u00B7 $$",
    description:
      "Award-winning Central Florida BBQ \u2014 brisket, burnt ends, and legendary sides.",
  },
  {
    name: "Dragonfly Robata Grill",
    icon: "\uD83C\uDF63",
    meta: "~25 min \u00B7 Sushi/Japanese \u00B7 $$$",
    description:
      "Upscale Japanese izakaya experience with inventive sushi rolls, small plates, and craft cocktails.",
  },
];

// ─── Local Activities ───────────────────────────────────────────────

export const localActivities: LocalActivity[] = [
  {
    name: "Kayaking & Paddleboarding",
    icon: "\uD83D\uDEA3",
    description:
      "Explore the Wekiva River, Rock Springs Run, or King\u2019s Landing \u2014 all within 20 minutes of the venue.",
  },
  {
    name: "Beach Day Trips",
    icon: "\uD83C\uDFD6\uFE0F",
    description:
      "New Smyrna Beach and Cocoa Beach are about an hour away \u2014 perfect for a quick beach escape.",
  },
  {
    name: "Orlando Museum of Art",
    icon: "\uD83C\uDFA8",
    description:
      "Beautiful galleries showcasing American art, plus rotating exhibitions in Loch Haven Park.",
  },
  {
    name: "Harry P. Leu Gardens",
    icon: "\uD83C\uDF3A",
    description:
      "50 acres of stunning botanical gardens \u2014 a peaceful escape and great for photos.",
  },
  {
    name: "Wine & Cocktail Bars",
    icon: "\uD83C\uDF77",
    description:
      "Check out the bars on Park Avenue in Winter Park or downtown Orlando\u2019s cocktail scene.",
  },
  {
    name: "Winter Park",
    icon: "\uD83C\uDFEC",
    description:
      "Charming town with boutique shopping on Park Ave, scenic boat tours, and excellent restaurants.",
  },
];
