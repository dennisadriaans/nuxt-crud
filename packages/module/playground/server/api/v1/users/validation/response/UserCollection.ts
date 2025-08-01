import { z } from 'zod/v4'
import { UserResource } from './UserResource'

export const UserCollection = z.object({
  data: z.array(UserResource),
  count: z.number(),
}).strict()
