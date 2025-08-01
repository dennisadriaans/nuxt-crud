import { createInsertSchema, createUpdateSchema } from 'drizzle-zod'
import z from 'zod/v4'
import * as tables from '../schema'

export const getInsertSchema = (table: string) => {
  const config = useAppConfig()
  const { getValidationRules } = config.filament?.config?.[table]
  return createInsertSchema(
    tables[table as keyof typeof tables],
    getValidationRules(),
  ).extend({
    createdAt: z.preprocess(
      (arg) => {
        if (typeof arg === 'string' || arg instanceof Date)
          return new Date(arg).toISOString()
        return undefined
      },
      z.string().default(() => new Date().toISOString()),
    ),
    updatedAt: z.preprocess(
      (arg) => {
        if (typeof arg === 'string' || arg instanceof Date)
          return new Date(arg).toISOString()
        return undefined
      },
      z.string().default(() => new Date().toISOString()),
    ),
  })
}

export const getUpdateSchema = (table: string) => {
  const config = useAppConfig()
  const { getValidationRules } = config.filament?.config?.[table]
  return createUpdateSchema(
    tables[table as keyof typeof tables],
    getValidationRules(),
  ).omit({ id: true })
}
