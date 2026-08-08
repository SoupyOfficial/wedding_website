import { NextRequest } from "next/server";
import { createListHandlers, T } from "@/lib/api/crud-handler";
import { queryOne } from "@/lib/db";
import { errorResponse } from "@/lib/api";

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
    confirmed: { toSql: T.boolInt, toSqlCreate: T.boolInt },
  },
  required: { fields: ["name", "role", "side"], message: "Name, role, and side are required." },
  boolFields: ["confirmed"] as const,
  timestamps: true,
};

export const dynamic = "force-dynamic";
const { GET, POST: factoryPOST } = createListHandlers(config);

async function POST(req: NextRequest) {
  const body = await req.json();

  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM WeddingPartyMember
     WHERE LOWER(name) = LOWER(?) AND LOWER(role) = LOWER(?) AND side = ?`,
    [body.name, body.role, body.side]
  );

  if (existing) {
    return errorResponse(
      `A member named "${body.name}" with role "${body.role}" already exists on the ${body.side}'s side.`,
      409
    );
  }

  const newReq = new NextRequest(req.url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  return factoryPOST(newReq);
}

export { GET, POST };
