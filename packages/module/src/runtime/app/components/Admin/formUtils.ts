import type { z } from 'zod'

// Types
interface FieldConfig {
  component: unknown
  props: Record<string, unknown>
}

interface FormField {
  name: string
  label: string
  component: unknown
  props: Record<string, unknown>
  required: boolean
}

const AUDIT_FIELDS = ['createdAt', 'updatedAt']
const HIDDEN_FIELDS = ['id']

function isFieldOptional(schema: z.ZodTypeAny): boolean {
  return schema.isOptional() || schema.isNullable()
}

function generateFieldLabel(fieldName: string, isRequired: boolean): string {
  const label = fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/[_-]/g, ' ')
    .trim()

  return label + (isRequired ? ' *' : '')
}

function getFieldConfig(fieldName: string, fieldSchema: z.ZodTypeAny, UInput: unknown, UTextarea: unknown): FieldConfig {
  if (fieldSchema._def.typeName === 'ZodString' && (fieldSchema as z.ZodString)._def.checks.some(check => check.kind === 'email')) {
    return {
      component: UInput,
      props: { type: 'email' },
    }
  }

  if (fieldSchema._def.typeName === 'ZodString' && fieldSchema._def.description === 'textarea') {
    return {
      component: UTextarea,
      props: { rows: 4 },
    }
  }

  if (fieldName === 'updatedAt' || fieldName === 'createdAt') {
    return {
      component: UInput,
      props: { type: 'datetime-local' },
    }
  }

  return {
    component: UInput,
    props: { type: 'text' },
  }
}

function generateFormFields(schema: z.ZodObject<z.ZodRawShape>, UInput: unknown, UTextarea: unknown): FormField[] {
  const shape = schema.shape

  return Object.entries(shape)
    .filter(([fieldName]) => !HIDDEN_FIELDS.includes(fieldName))
    .map(([fieldName, fieldSchema]) => {
      const config = getFieldConfig(fieldName, fieldSchema as z.ZodTypeAny, UInput, UTextarea)
      const isRequired = !isFieldOptional(fieldSchema as z.ZodTypeAny)

      return {
        name: fieldName,
        label: generateFieldLabel(fieldName, isRequired),
        component: config.component,
        props: config.props,
        required: isRequired,
      }
    })
}

export const formUtils = {
  AUDIT_FIELDS,
  generateFormFields,
}
