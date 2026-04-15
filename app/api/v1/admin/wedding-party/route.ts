import { createListHandlers, T } from "@/lib/api/crud-handler";

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
    sortOrder: { toSqlCreate: T.numDefault(0) },
  },
  required: { fields: ["name", "role", "side"], message: "Name, role, and side are required." },
  timestamps: true,
};

export const dynamic = "force-dynamic";
const { GET, POST } = createListHandlers(config);
export { GET, POST };
