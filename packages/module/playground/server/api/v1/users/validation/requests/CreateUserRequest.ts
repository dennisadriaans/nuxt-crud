import { getInsertSchema } from '~~/server/database/validation'

const userInsertSchema = getInsertSchema('users')

export const CreateUserRequest = userInsertSchema.extend({})

// export const CreateUserRequest = userInsertSchema.extend({
//       email: z.email().min(1, 'Email is required'),
// }).omit({
//   id: true,
// });
