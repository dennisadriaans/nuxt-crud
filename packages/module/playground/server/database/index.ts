import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'

export const tables = schema

/**
 * Returns a Drizzle instance.
 *
 * @returns {ReturnType<typeof drizzle<typeof schema>>} The Drizzle instance.
 */
export function useDB(): ReturnType<typeof drizzle<typeof schema>> {
  return drizzle(hubDatabase(), { schema })
}
