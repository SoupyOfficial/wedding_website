import { createDetailHandlers, T } from "@/lib/api/crud-handler";

const config = {
  table: "Entertainment",
  label: "Entertainment item",
  orderBy: "sortOrder ASC",
  boolFields: ["isVisible"] as const,
  fields: {
    name: { toSql: T.trim },
    description: {},
    icon: { toSql: T.nullable },
    sortOrder: {},
    isVisible: { toSql: T.boolInt },
  },
};

const { PUT, DELETE } = createDetailHandlers(config);
export { PUT, DELETE };
