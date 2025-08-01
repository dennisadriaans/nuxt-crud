<script setup lang="ts">
import type { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { onMounted, watch, reactive, computed, ref } from 'vue'

const props = defineProps<{
  schema: z.ZodObject<z.ZodRawShape>
  table: string
  initialData?: Record<string, unknown>
  mode?: 'create' | 'update' // add mode prop
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// Helper function to extract the inner type from optional/nullable schemas
function getInnerType(schema: z.ZodTypeAny): z.ZodTypeAny {
  // Handle ZodOptional
  if (schema._def.typeName === 'ZodOptional') {
    return getInnerType(schema._def.innerType)
  }
  // Handle ZodNullable
  if (schema._def.typeName === 'ZodNullable') {
    return getInnerType(schema._def.innerType)
  }
  // Handle ZodDefault
  if (schema._def.typeName === 'ZodDefault') {
    return getInnerType(schema._def.innerType)
  }
  return schema
}

// Helper function to check if a field is optional
function isFieldOptional(schema: z.ZodTypeAny): boolean {
  if (schema._def.typeName === 'ZodOptional') {
    return true
  }
  if (schema._def.typeName === 'ZodNullable') {
    return true
  }
  if (schema._def.typeName === 'ZodDefault') {
    return isFieldOptional(schema._def.innerType)
  }
  return false
}

// Helper function to get field component and props based on Zod type
function getFieldConfig(fieldSchema: z.ZodTypeAny, fieldName: string) {
  const innerType = getInnerType(fieldSchema)
  // String types
  if (innerType._def.typeName === 'ZodString') {
    const stringChecks = innerType._def.checks || []
    const emailCheck = stringChecks.find((check: { kind: string, [key: string]: unknown }) => check.kind === 'email')
    const urlCheck = stringChecks.find((check: { kind: string, [key: string]: unknown }) => check.kind === 'url')
    const minCheck = stringChecks.find((check: { kind: string, [key: string]: unknown }) => check.kind === 'min')

    if (emailCheck) {
      return {
        component: UInput,
        props: { type: 'email' },
        validation: 'email',
      }
    }

    if (urlCheck) {
      return {
        component: UInput,
        props: { type: 'url' },
        validation: 'url',
      }
    }

    // Long text fields (textarea for min length > 100 or specific field names)
    if (
      minCheck?.value > 100
      || ['description', 'content', 'notes', 'comment'].includes(
        fieldName.toLowerCase(),
      )
    ) {
      return {
        component: UTextarea,
        props: { rows: 4 },
        validation: 'text',
      }
    }

    return {
      component: UInput,
      props: { type: 'text' },
      validation: 'text',
    }
  }

  // Number types
  if (innerType._def.typeName === 'ZodNumber') {
    return {
      component: UInputNumber,
      props: {},
      validation: 'number',
    }
  }

  // Boolean types
  if (innerType._def.typeName === 'ZodBoolean') {
    return {
      component: UCheckbox,
      props: {},
      validation: 'boolean',
    }
  }

  // Date types
  if (innerType._def.typeName === 'ZodDate') {
    return {
      component: UInput,
      props: { type: 'date' },
      validation: 'date',
    }
  }

  // Enum types
  if (innerType._def.typeName === 'ZodEnum') {
    const options = innerType._def.values.map((value: string) => ({
      label:
        value.charAt(0).toUpperCase() + value.slice(1).replace(/[_-]/g, ' '),
      value: value,
    }))

    return {
      component: USelect,
      props: {
        options,
        placeholder: `Select ${fieldName.toLowerCase()}`,
      },
      validation: 'select',
    }
  }

  // Union types (for select with limited options)
  if (innerType._def.typeName === 'ZodUnion') {
    const literalValues = innerType._def.options
      .filter((option: z.ZodTypeAny) => option._def.typeName === 'ZodLiteral')
      .map((option: z.ZodLiteral<unknown>) => option._def.value)

    if (literalValues.length > 0) {
      const options = literalValues.map((value: unknown) => ({
        label:
          String(value).charAt(0).toUpperCase()
          + String(value).slice(1).replace(/[_-]/g, ' '),
        value: value,
      }))

      return {
        component: USelect,
        props: {
          options,
          placeholder: `Select ${fieldName.toLowerCase()}`,
        },
        validation: 'select',
      }
    }
  }

  // Array types
  if (innerType._def.typeName === 'ZodArray') {
    return {
      component: UTextarea,
      props: {
        rows: 3,
        placeholder: 'Enter items separated by commas',
      },
      validation: 'array',
    }
  }

  // Default fallback
  return {
    component: UInput,
    props: { type: 'text' },
    validation: 'text',
  }
}

// Generate form fields from schema
const formFields = computed(() => {
  const shape = props.schema._def.shape()

  return (
    Object.entries(shape)
      .map(([fieldName, fieldSchema]) => {
        const config = getFieldConfig(fieldSchema as z.ZodTypeAny, fieldName)
        const isOptional = isFieldOptional(fieldSchema as z.ZodTypeAny)

        // Generate human-readable label
        const label = fieldName
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .replace(/[_-]/g, ' ')
          .trim()

        return {
          name: fieldName,
          label: label + (isOptional ? '' : ' *'),
          component: config.component,
          props: config.props,
          validation: config.validation,
          required: !isOptional,
        }
      })
      // Only show required fields in create mode, all fields in update mode
      .filter((field) => {
        if (props.mode === 'create') return field.required
        return true
      })
  )
})

// Create reactive state with proper default values
type FormState = Record<string, unknown>

const rawState = reactive<FormState>(
  formFields.value.reduce((acc, field) => {
    // Set appropriate default values based on field type
    switch (field.validation) {
      case 'boolean':
        acc[field.name] = false
        break
      case 'number':
        acc[field.name] = undefined
        break
      case 'array':
        acc[field.name] = ''
        break
      default:
        acc[field.name] = ''
    }
    return acc
  }, {} as FormState),
)

// Populate rawState with initialData values if provided
function applyInitialData() {
  if (!props.initialData) return
  for (const key of Object.keys(props.initialData)) {
    if (key in rawState) {
      rawState[key] = props.initialData[key]
    }
  }
}

onMounted(applyInitialData)
watch(() => props.initialData, applyInitialData, { deep: true })

// Computed state that transforms raw values to the correct types for Zod validation
const state = computed(() => {
  const transformedState: FormState = { ...rawState }

  formFields.value.forEach((field) => {
    const value = rawState[field.name]

    // Transform date strings to Date objects for validation
    if (field.validation === 'date' && typeof value === 'string' && value) {
      transformedState[field.name] = new Date(value)
    }

    // Transform array strings to arrays for validation
    if (field.validation === 'array' && typeof value === 'string' && value) {
      transformedState[field.name] = value
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0)
    }

    // Convert empty strings to undefined for optional fields
    if (!field.required && value === '') {
      transformedState[field.name] = undefined
    }
  })

  return transformedState
})

// Separate fields into primary content and meta fields
const primaryFields = computed(() => {
  const primaryFieldNames = [
    'title',
    'name',
    'content',
    'description',
    'body',
    'summary',
  ]
  return formFields.value.filter(
    field =>
      primaryFieldNames.some(name =>
        field.name.toLowerCase().includes(name),
      )
      || field.component === UTextarea
      || (field.validation === 'text' && !isMetaField(field.name)),
  )
})

const metaFields = computed(() => {
  return formFields.value.filter(
    field => !primaryFields.value.includes(field),
  )
})

// Helper to determine if a field is a meta field
function isMetaField(fieldName: string): boolean {
  const metaFieldNames = [
    'status',
    'category',
    'tag',
    'type',
    'priority',
    'visibility',
    'published',
    'featured',
    'active',
    'enabled',
    'public',
    'date',
    'created',
    'updated',
    'modified',
    'slug',
    'url',
    'order',
    'sort',
    'position',
    'weight',
    'id',
  ]

  return metaFieldNames.some(
    meta =>
      fieldName.toLowerCase().includes(meta)
      || fieldName.toLowerCase().endsWith(meta),
  )
}

type FormField = {
  name: string
  label: string
  component: unknown
  props: Record<string, unknown>
  validation: string
  required: boolean
}

// Enhanced field descriptions
function getFieldDescription(field: FormField): string {
  const descriptions: Record<string, string> = {
    title: 'The main title or headline for this entry',
    name: 'A unique identifier for this entry',
    content: 'The main content body for this entry',
    description: 'A brief description or summary',
    slug: 'URL-friendly version of the title',
    status: 'Current publication status',
    category: 'Primary category for organization',
    tags: 'Comma-separated tags for better discoverability',
    featured: 'Mark as featured content',
    published: 'Make this entry publicly visible',
  }

  return descriptions[field.name.toLowerCase()] || ''
}

// Enhanced placeholders
function getFieldPlaceholder(field: FormField): string {
  const placeholders: Record<string, string> = {
    title: 'Enter a compelling title...',
    name: 'Enter a unique name...',
    content: 'Start writing your content here...',
    description: 'Provide a brief description...',
    slug: 'auto-generated-from-title',
    email: 'user@example.com',
    url: 'https://example.com',
    tags: 'tag1, tag2, tag3',
  }

  return (
    placeholders[field.name.toLowerCase()]
    || field.props?.placeholder
    || `Enter ${field.label.toLowerCase().replace(' *', '')}...`
  )
}

// Enhanced field props with better styling
function getEnhancedFieldProps(field: FormField) {
  const baseProps = { ...field.props }

  // Add enhanced styling based on field type
  if (field.component === UTextarea) {
    return {
      ...baseProps,
      rows: baseProps.rows || 6,
      resize: false,
      class: 'min-h-[120px]',
    }
  }

  if (field.component === USelect) {
    return {
      ...baseProps,
      'searchable': true,
      'clear-on-close': false,
    }
  }

  return baseProps
}

// Loading state for form submission
const isSubmitting = ref(false)

async function onSubmit(event: FormSubmitEvent<FormState>) {
  isSubmitting.value = true

  try {
    const response = await (
      await fetch(`/api/${props.table}`, {
        method: props.mode === 'update' ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event.data),
      })
    ).json()

    console.log('Submission successful:', response)

    // Show success notification
    // You can add a toast notification here

    emit('close')
  }
  catch (exc) {
    console.error('Submission failed:', exc)
    // Handle error (e.g., show a toast notification)
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <UForm
      :schema="props.schema"
      :state="state"
      class="space-y-0"
      @submit="onSubmit"
    >
      <!-- Form Fields Grid -->
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <!-- Main Content Area -->
        <div class="space-y-8 lg:col-span-2">
          <div
            v-for="field in primaryFields"
            :key="field.name"
            class="group"
          >
            <div
              class="rounded-lg border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] p-6 transition-colors duration-200 hover:border-[var(--ui-border-accented)]"
            >
              <!-- Field Header -->
              <div class="mb-4">
                <label
                  :for="field.name"
                  class="mb-1 block text-sm font-medium text-[var(--ui-text)]"
                >
                  {{ field.label.replace(' *', '') }}
                  <span
                    v-if="field.required"
                    class="ml-1 text-[var(--ui-error)]"
                  >*</span>
                </label>
                <p
                  v-if="getFieldDescription(field)"
                  class="text-xs text-[var(--ui-text-dimmed)]"
                >
                  {{ getFieldDescription(field) }}
                </p>
              </div>

              <!-- Field Input -->
              <UFormField
                :name="field.name"
                class="mb-0"
              >
                <component
                  :is="field.component"
                  :id="field.name"
                  v-model="rawState[field.name as keyof FormState]"
                  :placeholder="getFieldPlaceholder(field)"
                  :name="field.name"
                  class="w-full"
                  v-bind="getEnhancedFieldProps(field)"
                  :required="field.required"
                />
              </UFormField>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Meta Information -->
          <div
            class="rounded-lg border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] p-6"
          >
            <h3
              class="mb-4 flex items-center text-sm font-medium text-[var(--ui-text)]"
            >
              <UIcon
                name="i-lucide-settings"
                class="mr-2 h-4 w-4"
              />
              Settings
            </h3>

            <div class="space-y-4">
              <div
                v-for="field in metaFields"
                :key="field.name"
                class="space-y-2"
              >
                <label
                  :for="field.name"
                  class="block text-xs font-medium tracking-wide text-[var(--ui-text-dimmed)] uppercase"
                >
                  {{ field.label.replace(' *', '') }}
                  <span
                    v-if="field.required"
                    class="ml-1 text-[var(--ui-error)]"
                  >*</span>
                </label>

                <UFormField
                  :name="field.name"
                  class="mb-0"
                >
                  <component
                    :is="field.component"
                    :id="field.name"
                    v-model="rawState[field.name as keyof FormState]"
                    :placeholder="getFieldPlaceholder(field)"
                    :name="field.name"
                    class="w-full"
                    v-bind="getEnhancedFieldProps(field)"
                    :required="field.required"
                    size="sm"
                  />
                </UFormField>
              </div>
            </div>
          </div>

          <!-- Actions Panel -->
          <div
            class="rounded-lg border border-[var(--ui-border)] bg-[var(--ui-bg-elevated)] p-6"
          >
            <h3
              class="mb-4 flex items-center text-sm font-medium text-[var(--ui-text)]"
            >
              <UIcon
                name="i-lucide-zap"
                class="mr-2 h-4 w-4"
              />
              Actions
            </h3>

            <div class="space-y-3">
              <UButton
                type="submit"
                class="w-full justify-center"
                size="md"
                :loading="isSubmitting"
              >
                <UIcon
                  name="i-lucide-save"
                  class="mr-2 h-4 w-4"
                />
                {{ props.mode === 'create' ? 'Create Entry' : 'Update Entry' }}
              </UButton>

              <UButton
                variant="outline"
                class="w-full justify-center"
                size="sm"
                @click="emit('close')"
              >
                <UIcon
                  name="i-lucide-x"
                  class="mr-2 h-4 w-4"
                />
                Cancel
              </UButton>
            </div>

            <!-- Additional Info -->
            <div class="mt-6 border-t border-[var(--ui-border)] pt-4">
              <div class="space-y-1 text-xs text-[var(--ui-text-dimmed)]">
                <div class="flex items-center">
                  <UIcon
                    name="i-lucide-info"
                    class="mr-2 h-3 w-3"
                  />
                  Required fields are marked with *
                </div>
                <div class="flex items-center">
                  <UIcon
                    name="i-lucide-save"
                    class="mr-2 h-3 w-3"
                  />
                  Changes are saved automatically
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UForm>
  </div>
</template>
