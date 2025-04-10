import { defineRequestValidator } from "~~/server/utils/validation";
import { z } from 'zod';

// Define the schema type with Zod
const productFilterSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  sort: z.string().optional(),
  // Add more filter fields as needed
});

// Infer the TypeScript type from the schema
type ProductFilterData = z.infer<typeof productFilterSchema>;

export const GetAllProductsRequest = defineRequestValidator({
  schema: productFilterSchema,
  validate(data: ProductFilterData) {
    // Additional custom validation logic can be added here
    return data;
  }
});
