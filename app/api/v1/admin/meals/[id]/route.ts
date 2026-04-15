import { createDetailHandlers, T } from "@/lib/api/crud-handler";
import { MEAL_BOOLS } from "@/lib/db-types";

const config = {
  table: "MealOption",
  label: "Meal option",
  orderBy: "name ASC",
  boolFields: MEAL_BOOLS,
  fields: {
    name: { toSql: T.trim },
    description: {},
    isVegetarian: { toSql: T.boolInt },
    isVegan: { toSql: T.boolInt },
    isGlutenFree: { toSql: T.boolInt },
  },
};

const { PUT, DELETE } = createDetailHandlers(config);
export { PUT, DELETE };
