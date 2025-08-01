import { eq } from 'drizzle-orm'
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
    try {
      const item = await useDB().select()
        .from(users)
        .where(eq(users.id, Number(id)))
        .get()
      if (!item) {
        throw createError({
          statusCode: 404,
          statusMessage: 'User not found',
        })
      }
      return item
    }
    catch (error) {
      if (error.statusCode) throw error
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch user',
      })
    }
  },
  validateResponse: UserResource,
})
