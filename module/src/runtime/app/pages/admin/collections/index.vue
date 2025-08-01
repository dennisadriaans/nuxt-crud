<script lang="ts" setup>
import { definePageMeta, navigateTo, useFilament } from '#imports'

const { collections } = useFilament()

const schemas = collections.map(collection => ({
  id: collection,
}))

definePageMeta({
  layout: 'admin',
})

const visibleProps = ['id']
</script>

<template>
  <div class="w-full">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-[--ui-text]">
        Tables
      </h3>
      <UButton
        color="primary"
        size="md"
        class="ml-4"
      >
        Create
        <template #leading>
          <UIcon
            name="i-lucide-plus"
            size="16"
          />
        </template>
      </UButton>
    </div>
    <AdminTable
      :rows="schemas"
      :visible-props="visibleProps"
      @on-click="(id: string) => navigateTo(`/admin/collections/${id}`)"
    />
  </div>
</template>
