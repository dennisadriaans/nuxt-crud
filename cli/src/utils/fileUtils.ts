import fs from 'fs/promises';
import path from 'path';
import pluralize from 'pluralize';

export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  const dir = path.dirname(filePath);
  await ensureDirectoryExists(dir);
  await fs.writeFile(filePath, content, 'utf8');
}

export function toPascalCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

export function toKebabCase(str: string): string {
  return str.toLowerCase().replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
}

export function toPlural(str: string): string {
  return pluralize(str.toLowerCase());
}

export function toSingular(str: string): string {
  return pluralize.singular(str.toLowerCase());
}

export interface FieldDefinition {
  name: string;
  type: string;
  required?: boolean;
  unique?: boolean;
}

export function parseFields(fieldsString?: string): FieldDefinition[] {
  if (!fieldsString) return [];
  
  return fieldsString.split(',').map(field => {
    const [name, typeWithModifiers] = field.trim().split(':');
    const modifiers = typeWithModifiers.split('|');
    const type = modifiers[0];
    
    return {
      name: name.trim(),
      type: type.trim(),
      required: modifiers.includes('required'),
      unique: modifiers.includes('unique')
    };
  });
}

export function mapTypeToDrizzle(type: string): string {
  const typeMap: Record<string, string> = {
    'string': 'text',
    'text': 'text',
    'number': 'integer',
    'int': 'integer',
    'integer': 'integer',
    'float': 'real',
    'real': 'real',
    'boolean': 'integer', // SQLite doesn't have boolean, use integer
    'bool': 'integer',
    'date': 'text', // Store as ISO string
    'datetime': 'text',
    'timestamp': 'text',
    'json': 'text'
  };
  
  return typeMap[type.toLowerCase()] || 'text';
}

export function mapTypeToTypeScript(type: string): string {
  const typeMap: Record<string, string> = {
    'text': 'string',
    'integer': 'number',
    'real': 'number',
    'boolean': 'boolean',
    'bool': 'boolean',
    'date': 'Date',
    'datetime': 'Date',
    'timestamp': 'Date',
    'json': 'any'
  };
  
  return typeMap[type.toLowerCase()] || 'string';
}