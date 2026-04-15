import { createListHandlers, T } from "@/lib/api/crud-handler";
import { MEAL_BOOLS } from "@/lib/db-types";

const config = {
  table: "MealOption",
  label: "Meal option",
  orderBy: "name ASC",
  boolFields: MEAL_BOOLS,
  fields: {
    name: { toSql: T.trim },
    description: { toSqlCreate: T.str },
    isVegetarian: { toSql: T.boolInt },
    isVegan: { toSql: T.boolInt },
    isGlutenFree: { toSql: T.boolInt },
  },
  postDefaults: { isAvailable: 1, sortOrder: 0 },
  required: { fields: ["name"], message: "Name is required." },
};

export const dynamic = "force-dynamic";
const { GET, POST } = createListHandlers(config);
export { GET, POST };
