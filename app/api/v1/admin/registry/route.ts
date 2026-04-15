import { createListHandlers, T } from "@/lib/api/crud-handler";

const config = {
  table: "RegistryItem",
  label: "Registry item",
  orderBy: "sortOrder ASC",
  fields: {
    name: { toSql: T.trim },
    url: { toSql: T.trim },
    iconUrl: { toSql: T.nullable },
    sortOrder: { toSqlCreate: T.numDefault(0) },
    itemType: { toSqlCreate: T.strDefault("store") },
    price: { toSqlCreate: T.nullish },
    totalNeeded: { toSqlCreate: T.nullish },
    totalBought: { toSqlCreate: T.numDefault(0) },
    goalAmount: { toSqlCreate: T.nullish },
    raisedAmount: { toSqlCreate: T.numDefault(0) },
    description: { toSql: T.nullable },
    status: { toSqlCreate: T.strDefault("active") },
  },
  required: { fields: ["name"], message: "Name is required." },
};

export const dynamic = "force-dynamic";
const { GET, POST } = createListHandlers(config);
export { GET, POST };
