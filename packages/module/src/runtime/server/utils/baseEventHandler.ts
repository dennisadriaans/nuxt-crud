import type { H3Event, EventHandlerRequest, EventHandler, H3EventContext } from 'h3'
import {
  defineEventHandler,
  createError,
  getValidatedRouterParams,
  readValidatedBody,
  getValidatedQuery,
} from 'h3'
import { ZodError, type z, type ZodSchema } from 'zod'

// Extend H3Event context to include our validated data placeholders
// This part remains the same, providing a base for our more specific types.
declare module 'h3' {
  interface H3EventContext {
    validatedBody?: unknown
    validatedParams?: unknown
    validatedQuery?: unknown
  }
}

// Define a clear structure for our validation error responses
interface ErrorResponse {
  statusCode: number
  statusMessage: string
  message: string
  data?: unknown
}

// --- NEW: Type Helpers for Inference ---

/**
 * Infers the TypeScript type from a Zod schema. If the schema is undefined,
 * it resolves to `never`, preventing accidental access.
 */
type InferValidatedType<T> = T extends ZodSchema ? z.infer<T> : never

/**
 * Creates a strongly-typed H3Event for our handler, where the context
 * contains the validated and typed data based on the provided schemas.
 */
type ValidatedEvent<
  TValidateBody extends z.ZodSchema | undefined,
  TValidateParams extends z.ZodSchema | undefined,
  TvalidateQuery extends z.ZodSchema | undefined,
> = Omit<H3Event<EventHandlerRequest>, 'context'> & {
  context: H3EventContext & {
    validatedBody: InferValidatedType<TValidateBody>
    validatedParams: InferValidatedType<TValidateParams>
    validatedQuery: InferValidatedType<TvalidateQuery>
  }
}

// --- CHANGED: Updated Options and Handler Signature ---
interface MyEventHandlerOptions<
  TBody extends z.ZodSchema | undefined = undefined,
  TParams extends z.ZodSchema | undefined = undefined,
  TQuery extends z.ZodSchema | undefined = undefined,
  TResponse extends z.ZodSchema | undefined = undefined,
> {
  /**
   * The main handler function for the route. It receives an event with a typed context,
   * providing autocompletion and type safety for validated data.
   */
  // CHANGED: The handler now receives our strongly-typed `ValidatedEvent`
  handler: (
    event: ValidatedEvent<TBody, TParams, TQuery>
  ) => unknown | Promise<unknown>

  validateBody?: TBody
  validateParams?: TParams
  validateQuery?: TQuery
  validateResponse?: TResponse
  onRequest?: Array<
    (event: H3Event<EventHandlerRequest>) => void | Promise<void>
  >
  onBeforeResponse?: Array<
    (event: H3Event<EventHandlerRequest>, response: unknown) => void | Promise<void>
  >
  [key: string]: unknown
}

/**
 * A wrapper around `defineEventHandler` that provides built-in Zod validation for
 * request body, parameters, queries, and responses with full end-to-end type safety.
 */
export function baseEventHandler<
  TValidateBody extends z.ZodSchema | undefined = undefined,
  TValidateParams extends z.ZodSchema | undefined = undefined,
  TValidateQuery extends z.ZodSchema | undefined = undefined,
  TValidateResponse extends z.ZodSchema | undefined = undefined,
>(
  options: MyEventHandlerOptions<
    TValidateBody,
    TValidateParams,
    TValidateQuery,
    TValidateResponse
  >,
): EventHandler {
  const {
    handler,
    validateBody,
    validateParams,
    validateQuery,
    validateResponse,
    onRequest: customOnRequest = [],
    onBeforeResponse: customOnBeforeResponse = [],
    ...restOptions
  } = options

  const validationHook = async (event: H3Event<EventHandlerRequest>) => {
    try {
      if (
        validateBody
        && ['POST', 'PUT', 'PATCH'].includes(event.node.req.method || '')
      ) {
        // Using H3's built-in helper for conciseness
        event.context.validatedBody = await readValidatedBody(
          event,
          validateBody.parse,
        )
      }

      if (validateParams) {
        // H3's helper handles parsing and returns the typed object
        event.context.validatedParams = await getValidatedRouterParams(
          event,
          validateParams.parse,
        )
      }

      if (validateQuery) {
        // H3's helper for queries
        event.context.validatedQuery = await getValidatedQuery(
          event,
          validateQuery.parse,
        )
      }
    }
    catch (error: unknown) {
      // Error handling remains the same. It is robust.
      if (error instanceof ZodError) {
        const zodErr = error as ZodError
        const errorDetails = zodErr.errors
          .map(e => `${e.path.join('.')}: ${e.message}`)
          .join(', ')
        const errorResponse: ErrorResponse = {
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: 'Validation Error: ' + errorDetails,
          data: zodErr.errors,
        }
        throw createError(errorResponse)
      }
      else {
        const errorResponse: ErrorResponse = {
          statusCode: 500,
          statusMessage: 'Internal Server Error',
          message: `An unexpected error occurred during request processing.`,
        }
        console.error('Unexpected validation error:', error)
        throw createError(errorResponse)
      }
    }
  }

  const responseValidationHook = async (
    event: H3Event<EventHandlerRequest>,
    response: unknown, // `response` here is the raw data returned by the handler
  ) => {
    if (validateResponse) {
      try {
        // We parse the data returned by the handler
        validateResponse.parse(response)
      }
      catch (error: unknown) {
        const zodErr = error as ZodError
        console.error(
          'Response validation failed for request:',
          event.path,
          '\nError:',
          error instanceof ZodError ? zodErr.errors : error,
        )
        throw createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error',
          message: 'The server returned an invalid response format.',
        })
      }
    }
  }

  // The core logic of defineEventHandler remains the same
  return defineEventHandler({
    onRequest: [validationHook, ...customOnRequest],

    // The handler now correctly passes the typed event through
    handler: async (event) => {
      const result = await handler(event as ValidatedEvent<
        TValidateBody,
        TValidateParams,
        TValidateQuery
      >)

      // Run response validation before returning
      if (validateResponse) {
        await responseValidationHook(event, result)
      }

      return result
    },

    // onBeforeResponse can still be used for other purposes
    onBeforeResponse: [...customOnBeforeResponse],

    ...restOptions,
  })
}
