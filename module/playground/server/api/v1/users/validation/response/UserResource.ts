import { createSelectSchema } from 'drizzle-zod'
import { users } from '~~/server/database/schema'

const baseSchema = createSelectSchema(users, {
  // additional fields
})

export const UserResource = baseSchema.strict()
