import { H3Event } from 'h3';
import { z } from 'zod';

export type RequestValidator<T = any, R = T> = {
  schema: z.ZodType<T>;
  validate: (data: T) => R | Promise<R>;
};

export function defineRequestValidator<T = any, R = T>(validator: RequestValidator<T, R>): RequestValidator<T, R> {
  return validator;
}

export async function validateRequest<T = any, R = T>(
  event: H3Event,
  validator: RequestValidator<T, R>,
  source: 'query' | 'params' | 'body' = 'body'
): Promise<R> {
  let data: any;

  // Get data from the appropriate source
  switch (source) {
    case 'query':
      data = getQuery(event);
      break;
    case 'params':
      data = getRouterParams(event);
      break;
    case 'body':
      data = await readBody(event);
      break;
  }

  // Parse with Zod schema
  try {
    const parsedData = validator.schema.parse(data);
    // Run custom validation logic
    return await Promise.resolve(validator.validate(parsedData));
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format Zod validation errors
      throw createError({
        statusCode: 422,
        statusMessage: 'Validation Error',
        data: error.format(),
      });
    }
    throw error;
  }
}

// Import these from h3 since they're used above
import { getQuery, getRouterParams, readBody, createError } from 'h3';