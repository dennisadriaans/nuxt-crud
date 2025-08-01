import { like, or, count, and, type SQL } from 'drizzle-orm'
import { useDB, tables } from '../database'
import type { User } from '../database/schema/user'

interface UserTableQueryOptions {
  query: Record<string, string | string[] | undefined>
}

export async function handleUserTableQuery({ query }: UserTableQueryOptions) {
  const db = useDB()

  return useDrizzleTableQuery<User>({
    query,
    baseQuery: async () => {
      const search = query.search ? String(query.search).toLowerCase().trim() : ''

      if (search) {
        return await db.select().from(tables.users).where(
          or(
            like(tables.users.name, `%${search}%`),
            like(tables.users.email, `%${search}%`),
            like(tables.users.id, `%${search}%`),
          ),
        )
      }

      return await db.select().from(tables.users)
    },
    searchFilter: (search: string) => {
      return or(
        like(tables.users.name, `%${search}%`),
        like(tables.users.email, `%${search}%`),
        like(tables.users.id, `%${search}%`),
      )
    },
    customFilters: {
      // Add custom filters here based on your needs
      // Example:
      // status: (value: string) => {
      //   if (['active', 'inactive'].includes(value.toLowerCase())) {
      //     return like(tables.users.status, value);
      //   }
      //   return undefined;
      // },
    },
    countQuery: async (filters: SQL[]) => {
      if (filters.length > 0) {
        const result = await db.select({ count: count() }).from(tables.users).where(and(...filters))
        return result[0]?.count || 0
      }

      const result = await db.select({ count: count() }).from(tables.users)
      return result[0]?.count || 0
    },
  })
}
