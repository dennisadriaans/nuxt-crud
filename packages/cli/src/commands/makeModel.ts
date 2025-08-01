import path from "path";
import inquirer from "inquirer";
import {
  writeFile,
  toPascalCase,
  toCamelCase,
  toPlural,
  parseFields,
  mapTypeToDrizzle,
  type FieldDefinition,
} from "../utils/fileUtils.js";

import { ensureDirectoryExists } from "../utils/fileUtils.js";

async function generateIndexEndpoint(
  apiDir: string,
  resourceName: string,
  tableName: string
): Promise<void> {
  const lowerResourceName = resourceName.toLowerCase();
  const modelName = resourceName;
  const collectionName = `${resourceName}Collection`;
  const tableQueryFn = `handle${resourceName}TableQuery`;
  const content = `import { ${collectionName} } from './validation/response/${collectionName}';

export default baseEventHandler({
  handler: async (event) => {
    try {
      const query = getQuery(event) as Record<string, string | string[] | undefined>;
      const { data, totalItems: count } = await ${tableQueryFn}({ query });
      return {
        data,
        count
      };
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch ${lowerResourceName}s'
      });
    }
  },
  validateResponse: ${collectionName}
});`;

  await writeFile(path.join(apiDir, "index.get.ts"), content);
}

async function generateGetByIdEndpoint(
  apiDir: string,
  resourceName: string,
  tableName: string
): Promise<void> {
  const content = `import { eq } from 'drizzle-orm';
import { useDB } from '~~/server/database';
import { ${tableName} } from '~~/server/database/schema';
import { ${resourceName}Resource } from './validation/response/${resourceName}Resource';

export default baseEventHandler({
  handler: async (event) => {
    const id = getRouterParam(event, 'id');
    if (!id || isNaN(Number(id))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid ID parameter'
      });
    }
    try {
      const item = await useDB().select()
        .from(${tableName})
        .where(eq(${tableName}.id, Number(id)))
        .get();
      if (!item) {
        throw createError({
          statusCode: 404,
          statusMessage: '${resourceName} not found'
        });
      }
      return item;
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch ${resourceName.toLowerCase()}'
      });
    }
  },
  validateResponse: ${resourceName}Resource
});`;

  await writeFile(path.join(apiDir, "[id].get.ts"), content);
}

async function generateCreateEndpoint(
  apiDir: string,
  resourceName: string,
  tableName: string
): Promise<void> {
  const content = `import { Create${resourceName}Request } from './validation/requests/Create${resourceName}Request'
import { ${resourceName}Resource } from './validation/response/${resourceName}Resource'
import { useDB } from '~~/server/database'
import { ${tableName} } from '~~/server/database/schema'

export default baseEventHandler({
  handler: async (event) => {
    const body = event.context.validatedBody
    try {
      const [created] = await useDB().insert(${tableName})
        .values({
          ...body
        })
        .returning()
      setResponseStatus(event, 201)
      return created
    }
    catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create ${resourceName.toLowerCase()}',
      })
    }
  },
  validateBody: Create${resourceName}Request,
  validateResponse: ${resourceName}Resource,
})
`;
  await writeFile(path.join(apiDir, "index.post.ts"), content);
}

async function generateUpdateEndpoint(
  apiDir: string,
  resourceName: string,
  tableName: string
): Promise<void> {
  const content = `import { eq } from 'drizzle-orm'
import { Update${resourceName}Request } from './validation/requests/Update${resourceName}Request'
import { ${resourceName}Resource } from './validation/response/${resourceName}Resource'
import { useDB } from '~~/server/database'
import { ${tableName} } from '~~/server/database/schema'

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
      const [updated] = await useDB().update(${tableName})
        .set(body)
        .where(eq(${tableName}.id, Number(id)))
        .returning()
      if (!updated) {
        throw createError({
          statusCode: 404,
          statusMessage: '${resourceName} not found',
        })
      }
      return updated
    }
    catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update ${resourceName.toLowerCase()}',
      })
    }
  },
  validateBody: Update${resourceName}Request,
  validateResponse: ${resourceName}Resource,
})
`;
  await writeFile(path.join(apiDir, "[id].patch.ts"), content);
}

async function generateDeleteEndpoint(
  apiDir: string,
  resourceName: string,
  tableName: string
): Promise<void> {
  const content = `import { eq } from 'drizzle-orm';
import { useDB } from '~~/server/database';
import { ${tableName} } from '~~/server/database/schema';

export default baseEventHandler({
  handler: async (event) => {
    const id = getRouterParam(event, 'id');
    if (!id || isNaN(Number(id))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid ID parameter'
      });
    }
    try {
      const [deleted] = await useDB().delete(${tableName})
        .where(eq(${tableName}.id, Number(id)))
        .returning();

      if (!deleted) {
        throw createError({
          statusCode: 404,
          statusMessage: '${resourceName} not found'
        });
      }
      
      setResponseStatus(event, 204);
      return null;
    } catch (error) {
      if (error.statusCode) throw error;
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete ${resourceName.toLowerCase()}'
      });
    }
  }
});`;

  await writeFile(path.join(apiDir, "[id].delete.ts"), content);
}

async function generateTableQuery(
  resourceName: string,
  tableName: string,
  modelName: string,
  fields: FieldDefinition[],
  tableQueryPath: string
): Promise<void> {
  const lowerResourceName = resourceName.toLowerCase();

  // Generate search filters based on field types
  const searchFields = fields
    .filter((field) => field.type === "string" || field.type === "text")
    .map((field) => `like(tables.${tableName}.${field.name}, \`%\${search}%\`)`)
    .join(",\n            ");

  // Add default fields for search
  const defaultSearchFields = `like(tables.${tableName}.id, \`%\${search}%\`)`;
  const allSearchFields = searchFields
    ? `${searchFields},\n            ${defaultSearchFields}`
    : defaultSearchFields;

  const tableQueryContent = `import { useDB, tables } from '../database';
import { like, or, count, and, type SQL } from 'drizzle-orm';
import type { ${modelName} } from '../database/schema/${lowerResourceName}';

interface ${resourceName}TableQueryOptions {
  query: Record<string, string | string[] | undefined>;
}

export async function handle${resourceName}TableQuery({ query }: ${resourceName}TableQueryOptions) {
  const db = useDB();

  return useDrizzleTableQuery<${modelName}>({
    query,
    baseQuery: async () => {
      const search = query.search ? String(query.search).toLowerCase().trim() : '';
      
      if (search) {
        return await db.select().from(tables.${tableName}).where(
          or(
            ${allSearchFields}
          )
        );
      }
      
      return await db.select().from(tables.${tableName});
    },
    searchFilter: (search: string) => {
      return or(
        ${allSearchFields}
      );
    },
    customFilters: {
      // Add custom filters here based on your needs
      // Example:
      // status: (value: string) => {
      //   if (['active', 'inactive'].includes(value.toLowerCase())) {
      //     return like(tables.${tableName}.status, value);
      //   }
      //   return undefined;
      // },
    },
    countQuery: async (filters: SQL[]) => {
      if (filters.length > 0) {
        const result = await db.select({ count: count() }).from(tables.${tableName}).where(and(...filters));
        return result[0]?.count || 0;
      }
      
      const result = await db.select({ count: count() }).from(tables.${tableName});
      return result[0]?.count || 0;
    },
  });
}
`;

  // Write to the correct utils directory in the Nuxt server folder
  await writeFile(tableQueryPath, tableQueryContent);
}

// --- Resource generation after model creation ---
export async function makeModel(
  name: string,
  fieldsString?: string
): Promise<void> {
  const modelName = toPascalCase(name);
  const tableName = toPlural(name.toLowerCase());

  let fields: FieldDefinition[] = parseFields(fieldsString);

  // If no fields provided, prompt for them
  if (fields.length === 0) {
    const { shouldAddFields } = await inquirer.prompt([
      {
        type: "confirm",
        name: "shouldAddFields",
        message: "Would you like to add fields to the model?",
        default: true,
      },
    ]);

    if (shouldAddFields) {
      fields = await promptForFields();
    }
  }

  // Generate schema file
  const schemaContent = generateSchemaFile(modelName, tableName, fields);
  const schemaPath = path.join(
    process.cwd(),
    "server",
    "database",
    "schema",
    `${name.toLowerCase()}.ts`
  );
  await writeFile(schemaPath, schemaContent);

  // Update schema index file
  await updateSchemaIndex(name.toLowerCase(), modelName);

  // --- Resource generation after model creation ---
  const resourceName = toPascalCase(name);
  const resourceNamePlural = toPlural(name);
  const tableNameCamel = toCamelCase(toPlural(resourceName.toLowerCase()));
  // Create API directory structure
  const apiDir = path.join(
    process.cwd(),
    "server",
    "api",
    "v1",
    resourceNamePlural.toLowerCase()
  );
  await ensureDirectoryExists(apiDir);

  // --- Create validation folders and files ---
  const validationDir = path.join(apiDir, "validation");
  const requestsDir = path.join(validationDir, "requests");
  const responseDir = path.join(validationDir, "response");
  await ensureDirectoryExists(requestsDir);
  await ensureDirectoryExists(responseDir);

  // --- Ensure global validation file in server/database/validation ---
  const globalValidationDir = path.join(process.cwd(), "server", "database", "validation");
  await ensureDirectoryExists(globalValidationDir);
  const globalValidationFile = path.join(globalValidationDir, "index.ts");
  const globalValidationContent = `import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import * as tables from "../schema";
import z from "zod/v4";

export const getInsertSchema = (table: string) => {
  const config = useAppConfig();
  const { getValidationRules } = config.filament?.config?.[table];
  return createInsertSchema(
    tables[table as keyof typeof tables],
    getValidationRules()
  ).extend({
    createdAt: z.preprocess(
      (arg) => {
        if (typeof arg === "string" || arg instanceof Date)
          return new Date(arg).toISOString();
        return undefined;
      },
      z.string().default(() => new Date().toISOString())
    ),
    updatedAt: z.preprocess(
      (arg) => {
        if (typeof arg === "string" || arg instanceof Date)
          return new Date(arg).toISOString();
        return undefined;
      },
      z.string().default(() => new Date().toISOString())
    ),
  });
};

export const getUpdateSchema = (table: string) => {
  const config = useAppConfig();
  const { getValidationRules } = config.filament?.config?.[table];
  return createUpdateSchema(
    tables[table as keyof typeof tables],
    getValidationRules()
  ).omit({ id: true });
};
`;
  await writeFile(globalValidationFile, globalValidationContent);

  // Create request validation files
  const createRequestFile = path.join(
    requestsDir,
    `Create${resourceName}Request.ts`
  );
  const updateRequestFile = path.join(
    requestsDir,
    `Update${resourceName}Request.ts`
  );
  const createRequestContent = `import { getInsertSchema } from '~~/server/database/validation';

const ${toCamelCase(
    resourceName
  )}InsertSchema = getInsertSchema('${resourceNamePlural.toLowerCase()}');

export const Create${resourceName}Request = ${toCamelCase(
    resourceName
  )}InsertSchema.extend({});

// export const Create${resourceName}Request = ${toCamelCase(
    resourceName
  )}InsertSchema.extend({
//       email: z.email().min(1, 'Email is required'),
// }).omit({
//   id: true,
// });
`;
  const updateRequestContent = `import { getUpdateSchema } from '~~/server/database/validation';

const ${toCamelCase(
    resourceName
  )}UpdateSchema = getUpdateSchema('${resourceNamePlural.toLowerCase()}');

export const Update${resourceName}Request = ${toCamelCase(
    resourceName
  )}UpdateSchema.extend({});

// export const Update${resourceName}Request = ${toCamelCase(
    resourceName
  )}InsertSchema.extend({
//       email: z.email().min(1, 'Email is required'),
// }).omit({
//   id: true,
// });
`;
  await writeFile(createRequestFile, createRequestContent);
  await writeFile(updateRequestFile, updateRequestContent);

  // Create response validation files
  const resourceFile = path.join(responseDir, `${resourceName}Resource.ts`);
  const collectionFile = path.join(responseDir, `${resourceName}Collection.ts`);
  const resourceContent = `import { createSelectSchema } from 'drizzle-zod';
import { ${resourceNamePlural.toLowerCase()} } from '~~/server/database/schema';

const baseSchema = createSelectSchema(${resourceNamePlural.toLowerCase()}, {
  // additional fields
});

export const ${resourceName}Resource = baseSchema.strict();
`;
  const collectionContent = `import { z } from 'zod/v4';
import { ${resourceName}Resource } from './${resourceName}Resource';

export const ${resourceName}Collection = z.object({
  data: z.array(${resourceName}Resource),
  count: z.number(),
}).strict();
`;
  await writeFile(resourceFile, resourceContent);
  await writeFile(collectionFile, collectionContent);

  // Generate API endpoints
  await generateIndexEndpoint(apiDir, resourceName, tableNameCamel);
  await generateGetByIdEndpoint(apiDir, resourceName, tableNameCamel);
  await generateCreateEndpoint(apiDir, resourceName, tableNameCamel);
  await generateUpdateEndpoint(apiDir, resourceName, tableNameCamel);
  await generateDeleteEndpoint(apiDir, resourceName, tableNameCamel);
  // Generate table query file in server/utils
  const tableQueryPath = path.join(
    process.cwd(),
    "server",
    "utils",
    `${resourceNamePlural.toLowerCase()}TableQuery.ts`
  );
  await generateTableQuery(
    resourceName,
    tableNameCamel,
    modelName,
    fields,
    tableQueryPath
  );
}

async function promptForFields(): Promise<FieldDefinition[]> {
  const fields: FieldDefinition[] = [];

  while (true) {
    const { fieldName } = await inquirer.prompt([
      {
        type: "input",
        name: "fieldName",
        message: "Field name (or press Enter to finish):",
      },
    ]);

    if (!fieldName.trim()) break;

    const { fieldType, isRequired, isUnique } = await inquirer.prompt([
      {
        type: "list",
        name: "fieldType",
        message: "Field type:",
        choices: ["string", "number", "boolean", "date", "text", "json"],
      },
      {
        type: "confirm",
        name: "isRequired",
        message: "Is this field required?",
        default: false,
      },
      {
        type: "confirm",
        name: "isUnique",
        message: "Is this field unique?",
        default: false,
      },
    ]);

    fields.push({
      name: fieldName,
      type: fieldType,
      required: isRequired,
      unique: isUnique,
    });
  }

  return fields;
}

function generateSchemaFile(
  modelName: string,
  tableName: string,
  fields: FieldDefinition[]
): string {
  // Special case for User model
  if (modelName === 'User') {
    return `export const UserRoles = ['admin', 'user'] as const;
export type UserRole = typeof UserRoles[number];

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name'),
  email: text('email'),
  provider: text('provider'),
  role: text('role', { enum: UserRoles }).notNull().default('user'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
`;
  }

  const imports = ["sqliteTable", "text", "integer"];

  const fieldDefinitions = fields
    .map((field) => {
      const drizzleType = mapTypeToDrizzle(field.type);
      let fieldDef = `  ${field.name}: ${drizzleType}('${field.name}')`;
      const modifiers = [];
      if (field.required) modifiers.push("notNull()");
      if (field.unique) modifiers.push("unique()");
      if (modifiers.length > 0) {
        fieldDef += `.${modifiers.join(".")}`;
      }
      return fieldDef + ",";
    })
    .join("\n");

  // Remove SQL default fallback for createdAt and updatedAt
  return `import { ${imports.join(", ")} } from 'drizzle-orm/sqlite-core';\n
export const ${toCamelCase(
    tableName
  )} = sqliteTable('${tableName}', {\n  id: integer('id').primaryKey({ autoIncrement: true }),\n${fieldDefinitions}\n  createdAt: text('created_at')\n    .notNull(),\n  updatedAt: text('updated_at')\n    .notNull(),\n});\n\nexport type ${modelName} = typeof ${toCamelCase(
    tableName
  )}.$inferSelect;\nexport type New${modelName} = typeof ${toCamelCase(
    tableName
  )}.$inferInsert;\n`;
}

async function updateSchemaIndex(
  fileName: string,
  modelName: string
): Promise<void> {
  const indexPath = path.join(
    process.cwd(),
    "server",
    "database",
    "schema",
    "index.ts"
  );
  const tableName = toCamelCase(toPlural(fileName));
  const exportLine = `export { ${tableName}, type ${modelName}, type New${modelName} } from './${fileName}'`;
  try {
    const fs = await import("fs/promises");
    const existingContent = await fs.readFile(indexPath, "utf8");
    if (!existingContent.includes(exportLine)) {
      const updatedContent =
        existingContent.trimEnd() + "\n" + exportLine + "\n";
      await writeFile(indexPath, updatedContent);
    }
  } catch {
    await writeFile(indexPath, exportLine + "\n");
  }
}
