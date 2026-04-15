import { createListHandlers, T } from "@/lib/api/crud-handler";
import { GUEST_BOOLS } from "@/lib/db-types";

const config = {
  table: "Guest",
  label: "Guest",
  orderBy: "createdAt DESC",
  boolFields: GUEST_BOOLS,
  fields: {
    firstName: { toSql: T.trim },
    lastName: { toSql: T.trim },
    email: { toSql: T.nullable },
    group: { column: '"group"', toSql: T.nullable },
    plusOneAllowed: { toSql: T.boolInt },
    phone: { toSql: T.nullable },
    rsvpStatus: {},
    plusOneName: { toSql: T.nullable },
    plusOneAttending: { toSql: T.boolInt },
    mealPreference: { toSql: T.nullable },
    dietaryNeeds: { toSql: T.nullable },
    songRequest: { toSql: T.nullable },
    childrenCount: {},
    childrenNames: { toSql: T.nullable },
    tableNumber: { toSql: T.nullable },
    notes: { toSql: T.nullable },
  },
  postFields: ["firstName", "lastName", "email", "group", "plusOneAllowed"],
  postDefaults: { rsvpStatus: "pending", plusOneAttending: 0, childrenCount: 0 },
  required: { fields: ["firstName", "lastName"], message: "Name is required." },
  timestamps: true,
};

export const dynamic = "force-dynamic";
const { GET, POST } = createListHandlers(config);
export { GET, POST };
