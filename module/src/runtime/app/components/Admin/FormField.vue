<script setup lang="ts">
import { useField } from 'vee-validate'
import { computed } from 'vue'

interface FormField {
  name: string
  label: string
  component: string | object // Use string | object for Vue components
  props: Record<string, unknown> // Use unknown instead of any
  validation: string
  required: boolean
}

interface Props {
  field: FormField
  errors: Partial<Record<string, string | undefined>>
  disabled?: boolean
}

const props = defineProps<Props>()

// Use vee-validate's useField for this specific field
const { value } = useField(props.field.name)

// Format value for datetime-local input if needed
const formattedValue = computed({
  get() {
    if (props.field.props?.type === 'datetime-local' && value.value) {
      const date = new Date(value.value as string)
      if (Number.isNaN(date.getTime())) return ''
      const pad = (n: number) => n.toString().padStart(2, '0')
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
    }
    return value.value ?? ''
  },
  set(val) {
    if (props.field.props?.type === 'datetime-local' && val) {
      // Convert 'YYYY-MM-DDTHH:MM' back to ISO string
      value.value = new Date(val as string).toISOString()
    }
    else {
      value.value = val
    }
  },
})
</script>

<template>
  <UFormField
    :label="field.label"
    :name="field.name"
    :error="errors[field.name]"
  >
    <component
      :is="field.component"
      v-model="formattedValue"
      :placeholder="`Enter ${field.label
        .toLowerCase()
        .replace(' *', '')}`"
      :name="field.name"
      class="w-full rounded"
      v-bind="field.props"
      :required="field.required"
      :disabled="disabled"
      size="xl"
    />
  </UFormField>
</template>
