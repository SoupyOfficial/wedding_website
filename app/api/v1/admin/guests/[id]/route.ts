import { createDetailHandlers, T } from "@/lib/api/crud-handler";
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
    phone: { toSql: T.nullable },
    group: { column: '"group"', toSql: T.nullable },
    rsvpStatus: {},
    plusOneAllowed: { toSql: T.boolInt },
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
  validatePut: (body: Record<string, unknown>) => {
    if (body.rsvpStatus !== undefined) {
      const valid = ["pending", "attending", "declined"];
      if (!valid.includes(body.rsvpStatus as string)) {
        return "Invalid rsvpStatus. Must be: pending, attending, or declined.";
      }
    }
    return null;
  },
  timestamps: true,
};

const { PUT, DELETE } = createDetailHandlers(config);
export { PUT, DELETE };
