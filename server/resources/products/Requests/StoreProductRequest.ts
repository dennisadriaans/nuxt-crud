import { defineRequestValidator } from "~~/server/utils/validation";
import { z } from 'zod';

// Define the schema type with Zod
const productSchema = z.object({
  name: z.string().min(3).max(100),
  // Add more fields as needed
});

// Infer the TypeScript type from the schema
type ProductCreateData = z.infer<typeof productSchema>;

export const StoreProductRequest = defineRequestValidator({
  schema: productSchema,
  validate(data: ProductCreateData) {
    // Additional custom validation logic can be added here
    return data;
  }
});
