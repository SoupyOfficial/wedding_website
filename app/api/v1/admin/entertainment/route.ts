import { createListHandlers, T } from "@/lib/api/crud-handler";

const config = {
  table: "Entertainment",
  label: "Entertainment item",
  orderBy: "sortOrder ASC",
  boolFields: ["isVisible"] as const,
  fields: {
    name: { toSql: T.trim },
    description: { toSqlCreate: T.str },
    icon: { toSql: T.nullable },
    sortOrder: { toSqlCreate: T.numDefault(0) },
    isVisible: { toSql: T.boolInt, toSqlCreate: T.boolInt },
  },
  required: { fields: ["name"], message: "Entertainment name is required." },
};

export const dynamic = "force-dynamic";
const { GET, POST } = createListHandlers(config);
export { GET, POST };
