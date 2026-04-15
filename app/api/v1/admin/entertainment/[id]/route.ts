import { createDetailHandlers, T } from "@/lib/api/crud-handler";

const config = {
  table: "Entertainment",
  label: "Entertainment item",
  orderBy: "sortOrder ASC",
  fields: {
    name: { toSql: T.trim },
    description: {},
    icon: { toSql: T.nullable },
    sortOrder: {},
  },
};

const { PUT, DELETE } = createDetailHandlers(config);
export { PUT, DELETE };
