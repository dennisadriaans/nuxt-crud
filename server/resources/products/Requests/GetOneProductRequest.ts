import { defineRequestValidator } from "~~/server/utils/validation";
import { z } from 'zod';

// Define the schema type with Zod
const productParamSchema = z.object({
  id: z.string().refine((val) => !isNaN(parseInt(val)), {
    message: "ID must be a valid number",
  }),
});

// Infer the TypeScript type from the schema
type ProductParamData = z.infer<typeof productParamSchema>;

export const GetOneProductRequest = defineRequestValidator({
  schema: productParamSchema,
  validate(data: ProductParamData) {
    // Additional custom validation logic can be added here
    return data;
  }
});
