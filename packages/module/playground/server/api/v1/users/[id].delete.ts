import { eq } from 'drizzle-orm'
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
      const [deleted] = await useDB().delete(users)
        .where(eq(users.id, Number(id)))
        .returning()

      if (!deleted) {
        throw createError({
          statusCode: 404,
          statusMessage: 'User not found',
        })
      }

      setResponseStatus(event, 204)
      return null
    }
    catch (error) {
      if (error.statusCode) throw error
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete user',
      })
    }
  },
})
