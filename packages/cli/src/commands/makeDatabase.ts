import { promises as fs } from 'fs'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'server', 'database', 'index.ts')
const TEMPLATE = `import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export const tables = schema;

/**
 * Returns a Drizzle instance.
 *
 * @returns {ReturnType<typeof drizzle<typeof schema>>} The Drizzle instance.
 */
export function useDB(): ReturnType<typeof drizzle<typeof schema>> {
  return drizzle(hubDatabase(), { schema });
}
`

export async function makeDatabase(): Promise<void> {
  try {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true })
    await fs.writeFile(DB_PATH, TEMPLATE, 'utf-8')
    console.log('Drizzle ORM database initialized at', DB_PATH)
  } catch (err) {
    console.error('Failed to initialize database:', err)
    process.exit(1)
  }
}

export default {
  command: 'make:database',
  describe: 'Create Drizzle ORM database file',
  handler: async () => {
    await makeDatabase()
  }
}
