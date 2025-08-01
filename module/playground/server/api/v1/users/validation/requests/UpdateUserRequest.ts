import { getUpdateSchema } from '~~/server/database/validation'

const userUpdateSchema = getUpdateSchema('users')

export const UpdateUserRequest = userUpdateSchema.extend({})

// export const UpdateUserRequest = userInsertSchema.extend({
//       email: z.email().min(1, 'Email is required'),
// }).omit({
//   id: true,
// });
