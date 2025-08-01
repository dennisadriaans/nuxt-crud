import { eq } from 'drizzle-orm'
import { UpdateUserRequest } from './validation/requests/UpdateUserRequest'
import { UserResource } from './validation/response/UserResource'
import { useDB } from '~~/server/database'
import { users } from '~~/server/database/schema'

export default baseEventHandler({
  handler: async (event) => {
    const id = getRouterParam(event, 'id')
    if (!id || isNaN(Number(id))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid ID parameter',
      })
    }
    const body = event.context.validatedBody
    try {
      const [updated] = await useDB().update(users)
        .set(body)
        .where(eq(users.id, Number(id)))
        .returning()
      if (!updated) {
        throw createError({
          statusCode: 404,
          statusMessage: 'User not found',
        })
      }
      return updated
    }
    catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update user',
      })
    }
  },
  validateBody: UpdateUserRequest,
  validateResponse: UserResource,
})
