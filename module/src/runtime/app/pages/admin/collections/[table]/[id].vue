<script lang="ts" setup>
import { navigateTo, ref, useAsyncData, useRoute } from '#imports'

import { getUpdateSchema } from '~~/server/database/validation'

const route = useRoute()
const table = route.params.table as string
const id = route.params.id as string

const schema = getUpdateSchema(table)

if (!schema.value || !schema.value.shape || Object.keys(schema.value.shape).length === 0) {
  console.error(`Schema not found or empty for table: ${table}. Cannot render form.`)
  // Optionally, navigate away or show a persistent error
}

// Get the item data
const { data, status: _status } = await useAsyncData(id, () => {
  return $fetch(`/api/v1/${table}/${id}`, {
    method: 'GET',
  })
})

const isLoading = ref(false)
const adminFormRef = ref()

async function handleUpdate(formData: Record<string, unknown>) {
  try {
    isLoading.value = true

    await $fetch(`/api/v1/${table}/${id}`, {
      method: 'PATCH',
      body: formData,
    })

    // Show success message
    const toast = useToast()
    toast.add({
      title: 'Success',
      description: 'Item updated successfully',
      color: 'success',
    })

    // Navigate back to the table list
    await navigateTo(`/admin/collections/${table}`)
  }
  catch (error: unknown) {
    console.error('Update failed:', error)
    const toast = useToast()
    toast.add({
      title: 'Error',
      description: error.message || 'Failed to update item',
      color: 'error',
    })
  }
  finally {
    isLoading.value = false
  }
}

function handleCancel() {
  navigateTo(`/admin/collections/${table}`)
}
</script>

<template>
  <div class="w-full mb-4">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold text-[--ui-text]">
          Edit {{ table.charAt(0).toUpperCase() + table.slice(1) }}
        </h3>
      </div>

      <div
        id="admin-form-actions"
        class="flex items-center gap-2"
      />
    </div>

    <AdminForm
      ref="adminFormRef"
      :schema="schema"
      :table="table"
      :initial-data="data"
      mode="update"
      :loading="isLoading"
      @submit="handleUpdate"
      @close="handleCancel"
    />

    <UButton
      icon="i-lucide-arrow-left"
      color="neutral"
      variant="ghost"
      size="md"
      class="mt-8"
      @click="handleCancel"
    >
      Back to {{ table }}
    </UButton>
  </div>
</template>
