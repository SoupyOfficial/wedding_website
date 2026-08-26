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
    plusOneAllowed: { toSql: T.boolInt },
    phone: { toSql: T.nullable },
    rsvpStatus: {},
    plusOneName: { toSql: T.nullable },
    plusOneAttending: { toSql: T.boolInt },
    dietaryNeeds: { toSql: T.nullable },
    songRequest: { toSql: T.nullable },
    danceSong: { toSql: T.nullable },
    firstDanceSong: { toSql: T.nullable },
    childrenCount: {},
    childrenNames: { toSql: T.nullable },
    tableNumber: { toSql: T.nullable },
    notes: { toSql: T.nullable },
  },
  postFields: ["firstName", "lastName", "email", "plusOneAllowed"],
  postDefaults: { rsvpStatus: "pending", plusOneAttending: 0, childrenCount: 0 },
  required: { fields: ["firstName", "lastName"], message: "Name is required." },
  // Server-side duplicate guard: 409 on an exact firstName+lastName match
  // (email included in the match only when the request provides one).
  // Near-matches still get the client-side "Add Anyway" warning via
  // /api/v1/admin/guests/check-duplicate.
  preventDuplicateFields: ["firstName", "lastName", "email"],
  duplicateMessage: "A guest with this first and last name already exists.",
  timestamps: true,
};

export const dynamic = "force-dynamic";
const { GET, POST } = createListHandlers(config);
export { GET, POST };
