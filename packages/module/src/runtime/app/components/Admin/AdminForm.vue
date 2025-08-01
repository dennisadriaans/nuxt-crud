<script setup lang="ts">
import { computed, resolveComponent, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import type { z } from 'zod'
import AdminFormField from './FormField.vue'
import { formUtils } from './formUtils'

// Props
const props = defineProps<{
  schema: z.ZodObject<z.ZodRawShape>
  table: string
  initialData?: Record<string, unknown>
  mode?: 'create' | 'update'
}>()

// Emits
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: Record<string, unknown>): void
}>()

// Setup vee-validate form
const validationSchema = computed(() => toTypedSchema(props.schema))
const { handleSubmit, errors, resetForm } = useForm({
  validationSchema: validationSchema.value,
  initialValues: props.initialData,
})

// Form submission with validation
const onSubmit = handleSubmit((values) => {
  emit('submit', values)
})

// Form fields generation
const formFields = computed(() => formUtils.generateFormFields(props.schema, resolveComponent('UInput'), resolveComponent('UTexarea')))

// Helper: Separate audit fields for update layout
const mainFields = computed(() =>
  formFields.value.filter(f => !formUtils.AUDIT_FIELDS.includes(f.name)),
)
const auditFormFields = computed(() =>
  formFields.value.filter(f => formUtils.AUDIT_FIELDS.includes(f.name)),
)

// Apply initial data to form
watch(() => props.initialData, (newData) => {
  if (newData) {
    resetForm({
      values: newData,
    })
  }
}, { deep: true, immediate: true })
</script>

<template>
  <form
    :class="
      props.mode === 'update'
        ? 'grid grid-cols-3 gap-8'
        : 'grid grid-cols-2 gap-8'
    "
    @submit.prevent="onSubmit"
  >
    <template v-if="props.mode === 'update'">
      <div class="col-span-2">
        <UCard variant="subtle">
          <div class="space-y-4 p-4">
            <div
              v-for="field in mainFields"
              :key="field.name"
            >
              <AdminFormField
                :field="field"
                :errors="errors"
              />
            </div>
          </div>
        </UCard>
      </div>
      <div class="col-span-1">
        <!-- Extra fields section -->
        <UCard variant="subtle">
          <div class="space-y-4 p-4">
            <div
              v-for="field in auditFormFields"
              :key="field.name"
            >
              <AdminFormField
                :field="field"
                :errors="errors"
              />
            </div>
          </div>
        </UCard>
      </div>
    </template>
    <template v-else>
      <div
        v-for="field in mainFields"
        :key="field.name"
      >
        <AdminFormField
          :field="field"
          :errors="errors"
        />
      </div>
    </template>

    <ClientOnly>
      <!-- <Teleport
        v-if="props.mode === 'update'"
        to="#admin-form-actions"
      >
        <UButton
          type="button"
          class="flex w-full items-center justify-center"
          @click="onSubmit"
        >
          Save
        </UButton>
      </Teleport> -->
      <UButton
        type="button"
        class="flex w-full items-center justify-center"
        @click="onSubmit"
      >
        Submit
      </UButton>
    </ClientOnly>
  </form>
</template>
