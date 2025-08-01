import { CreateUserRequest } from './validation/requests/CreateUserRequest'
import { UserResource } from './validation/response/UserResource'
import { useDB } from '~~/server/database'
import { users } from '~~/server/database/schema'

export default baseEventHandler({
  handler: async (event) => {
    const body = event.context.validatedBody
    try {
      const [created] = await useDB().insert(users)
        .values({
          ...body,
        })
        .returning()
      setResponseStatus(event, 201)
      return created
    }
    catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create user',
      })
    }
  },
  validateBody: CreateUserRequest,
  validateResponse: UserResource,
})
