import { createListHandlers, T } from "@/lib/api/crud-handler";

const config = {
  table: "Hotel",
  label: "Hotel",
  orderBy: "sortOrder ASC",
  fields: {
    name: { toSql: T.trim },
    address: { toSqlCreate: T.str },
    phone: { toSqlCreate: T.str },
    website: { toSqlCreate: T.str },
    bookingLink: { toSqlCreate: T.str },
    blockCode: { toSqlCreate: T.str },
    blockDeadline: { toSql: T.date },
    notes: { toSqlCreate: T.str },
    distanceFromVenue: { toSqlCreate: T.str },
    priceRange: { toSqlCreate: T.str },
    amenities: { toSqlCreate: T.str },
    sortOrder: { toSqlCreate: T.numDefault(0) },
  },
  required: { fields: ["name"], message: "Hotel name is required." },
};

export const dynamic = "force-dynamic";
const { GET, POST } = createListHandlers(config);
export { GET, POST };
