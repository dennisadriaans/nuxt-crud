import { defineRequestValidator } from "~~/server/utils/validation";
import { z } from 'zod';

// Define the schema type with Zod
const productUpdateSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  // Add more fields as needed
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

// Infer the TypeScript type from the schema
type ProductUpdateData = z.infer<typeof productUpdateSchema>;

export const UpdateProductRequest = defineRequestValidator({
  schema: productUpdateSchema,
  validate(data: ProductUpdateData) {
    // Additional custom validation logic can be added here
    return data;
  }
});
