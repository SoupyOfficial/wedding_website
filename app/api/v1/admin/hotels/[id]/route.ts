import { createDetailHandlers, T } from "@/lib/api/crud-handler";

const config = {
  table: "Hotel",
  label: "Hotel",
  orderBy: "sortOrder ASC",
  fields: {
    name: { toSql: T.trim },
    address: {},
    phone: {},
    website: {},
    bookingLink: {},
    blockCode: {},
    blockDeadline: { toSql: T.date },
    notes: {},
    distanceFromVenue: {},
    priceRange: {},
    amenities: {},
    sortOrder: {},
  },
};

const { PUT, DELETE } = createDetailHandlers(config);
export { PUT, DELETE };
