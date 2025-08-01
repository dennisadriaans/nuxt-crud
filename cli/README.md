# Nuxt CRUD CLI

A Laravel Artisan-inspired CLI tool for generating CRUD backend files in Nuxt 3 projects with Drizzle ORM and SQLite.

## Installation

```bash
npm install
```

## Usage

### Generate a Model

Create a new Drizzle schema file:

```bash
# Basic model
npm run make:model User

# Model with fields
npm run make:model User -- --fields="name:string,email:string|unique,age:number"
```

Field types supported:
- `string`, `text` - Text fields
- `number`, `int`, `integer` - Integer fields  
- `float`, `real` - Float fields
- `boolean`, `bool` - Boolean fields (stored as integer in SQLite)
- `date`, `datetime`, `timestamp` - Date fields (stored as ISO strings)
- `json` - JSON fields

Field modifiers:
- `|required` - Makes field required
- `|unique` - Makes field unique

### Generate a Resource

Create complete CRUD API endpoints with validation schemas:

```bash
# Generate resource (will look for matching model)
npm run make:resource Users

# Generate resource with specific model
npm run make:resource Posts -- --model=Post
```

This generates:
- `server/api/v1/{resource}/index.ts` - List all items
- `server/api/v1/{resource}/[id].ts` - Get single item
- `server/api/v1/{resource}/create.post.ts` - Create new item
- `server/api/v1/{resource}/update.put.ts` - Update existing item
- `server/api/v1/{resource}/validation/` - Validation schemas using drizzle-zod

## Generated Structure

```
server/
├── api/v1/{resource}/
│   ├── index.ts              # GET /api/v1/{resource}
│   ├── [id].ts              # GET /api/v1/{resource}/{id}
│   ├── create.post.ts       # POST /api/v1/{resource}/create
│   ├── update.put.ts        # PUT /api/v1/{resource}/update/{id}
│   └── validation/
│       ├── create{Model}Schema.ts
│       ├── update{Model}Schema.ts
│       ├── {model}ResponseSchema.ts
│       └── {model}ListResponseSchema.ts
└── database/schema/
    ├── index.ts             # Schema exports
    └── {model}.ts           # Drizzle schema definition
```

## Example

```bash
# 1. Create a User model
npm run make:model User -- --fields="name:string|required,email:string|unique|required,age:number"

# 2. Generate CRUD endpoints for users
npm run make:resource Users
```

This creates a complete CRUD API at `/api/v1/users` with proper validation and type safety.

## Requirements

Your Nuxt project should have:
- Drizzle ORM configured
- drizzle-zod installed
- Database connection at `~~/server/database`

## Development

```bash
# Run CLI in development
npm run dev make:model User

# Build for production
npm run build
```