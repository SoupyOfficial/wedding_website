import { createDetailHandlers, T } from "@/lib/api/crud-handler";

const config = {
  table: "WeddingPartyMember",
  label: "Member",
  orderBy: "side ASC, sortOrder ASC",
  fields: {
    name: { toSql: T.trim },
    role: { toSql: T.trim },
    side: { toSql: T.trim },
    bio: { toSql: T.str },
    photoUrl: { toSql: T.nullable },
    relationToBrideOrGroom: { toSql: T.str },
    spouseOrPartner: { toSql: T.str },
    sortOrder: {},
    confirmed: { toSql: T.boolInt },
  },
  boolFields: ["confirmed"] as const,
  timestamps: true,
};

const { PUT, DELETE } = createDetailHandlers(config);
export { PUT, DELETE };
