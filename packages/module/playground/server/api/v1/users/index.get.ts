import { UserCollection } from './validation/response/UserCollection'

export default baseEventHandler({
  handler: async (event) => {
    try {
      const query = getQuery(event) as Record<string, string | string[] | undefined>
      const { data, totalItems: count } = await handleUserTableQuery({ query })
      return {
        data,
        count,
      }
    }
    catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch users',
      })
    }
  },
  validateResponse: UserCollection,
})
