import type { SQL } from 'drizzle-orm'

interface UseDrizzleTableQueryOptions<T> {
  query: Record<string, string | string[] | undefined>
  baseQuery: () => Promise<T[]>
  searchFilter?: (search: string) => SQL | undefined
  customFilters?: Record<string, (value: string) => SQL | undefined>
  countQuery: (filters: SQL[]) => Promise<number>
}

interface DrizzleTableQueryResult<T> {
  data: T[]
  totalItems: number
  currentPage: number
  pageSize: number
  totalPages: number
}

function getQueryValue(query: Record<string, string | string[] | undefined>, key: string, fallback = ''): string {
  const value = query[key]
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value[0] || fallback
  return fallback
}

export async function useDrizzleTableQuery<T extends Record<string, unknown>>({
  query,
  baseQuery,
  searchFilter,
  customFilters = {},
  countQuery,
}: UseDrizzleTableQueryOptions<T>): Promise<DrizzleTableQueryResult<T>> {
  const page = Number.parseInt(getQueryValue(query, 'page', '1'))
  const pageSize = Number.parseInt(getQueryValue(query, 'pageSize', '10'))
  const search = getQueryValue(query, 'search', '').trim()
  const sortBy = getQueryValue(query, 'sortBy', '')
  const sortDir = getQueryValue(query, 'sortDir', '') === 'desc' ? 'desc' : 'asc'

  // Build filters
  const filters: SQL[] = []

  // Apply search filter
  if (search && searchFilter) {
    const searchSQL = searchFilter(search)
    if (searchSQL) filters.push(searchSQL)
  }

  // Apply custom filters
  for (const [filterKey, filterFn] of Object.entries(customFilters)) {
    const filterValue = getQueryValue(query, filterKey, '')
    if (filterValue) {
      const filterSQL = filterFn(filterValue)
      if (filterSQL) filters.push(filterSQL)
    }
  }

  // Get total count
  const totalItems = await countQuery(filters)

  // Execute main query with all filters applied
  const data = await baseQuery()

  // Apply client-side pagination and sorting (For a more efficient approach, these should be done in the SQL query)
  let result = [...data]

  // Apply search on client side as fallback
  if (search && !searchFilter) {
    result = result.filter(item =>
      Object.values(item).some(value =>
        typeof value === 'string' && value.toLowerCase().includes(search.toLowerCase()),
      ),
    )
  }

  // Apply sorting on client side
  if (sortBy && result.length > 0) {
    result.sort((a, b) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      if (aValue == null && bValue == null) return 0
      if (aValue == null) return 1
      if (bValue == null) return -1
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDir === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }
      if (sortDir === 'asc') {
        return aValue > bValue ? 1 : -1
      }
      else {
        return aValue < bValue ? 1 : -1
      }
    })
  }

  // Apply pagination
  const offset = (page - 1) * pageSize
  const paginatedData = result.slice(offset, offset + pageSize)
  const totalPages = Math.ceil(totalItems / pageSize)

  return {
    data: paginatedData,
    totalItems,
    currentPage: page,
    pageSize,
    totalPages,
  }
}
