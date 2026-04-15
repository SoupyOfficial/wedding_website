import { createDetailHandlers, T } from "@/lib/api/crud-handler";

const config = {
  table: "RegistryItem",
  label: "Registry item",
  orderBy: "sortOrder ASC",
  fields: {
    name: { toSql: T.trim },
    url: { toSql: T.trim },
    iconUrl: { toSql: T.nullable },
    sortOrder: {},
    itemType: {},
    price: {},
    totalNeeded: {},
    totalBought: {},
    goalAmount: {},
    raisedAmount: {},
    description: { toSql: T.nullable },
    status: {},
  },
};

const { PUT, DELETE } = createDetailHandlers(config);
export { PUT, DELETE };
