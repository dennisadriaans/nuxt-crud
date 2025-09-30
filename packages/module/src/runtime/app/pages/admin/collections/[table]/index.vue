<script lang="ts" setup>
import { debounce } from 'perfect-debounce'
import { computed, ref, resolveComponent, watch } from 'vue'
import { useAsyncData, useRoute, navigateTo } from '#app'
import { getInsertSchema } from '~~/server/database/validation'
import { useCrud } from '#imports'

const crud = await useCrud()

const route = useRoute()
const slug = route.params.table as string

/* Get relevant database schema from the server */
const CreateUserForm = getInsertSchema(slug)

/* Add extra validation rules */
// const CreateUserForm = userInsertSchema
//   .extend({
//     email: z.email().min(1, 'Email is required'),
//   })
//   .omit({
//     id: true,
//   })

const UModal = resolveComponent('UModal')

const isModalOpen = ref(false)

const query = ref({
  ...(route.query.search ? { search: route.query.search } : {}),
  ...route.query,
})

const { data, refresh } = await useAsyncData(slug, () => {
  return $fetch(`/api/v1/${slug}`, {
    method: 'GET',
    params: query.value,
  })
})

const visibleProps = crud.getVisibleFields(slug)

// Use all fields for each item, but only show visibleProps in columns
type Item = Record<string, unknown>

// Columns only for visibleProps

const rows = computed(
  () => (data.value?.data as Item[]) ?? [].map((i: Item) => ({ ...i })),
)

watch(
  () => route.query,
  (newQuery) => {
    query.value = {
      ...query.value,
      ...newQuery,
    }
  },
)

function openEdit(_row: Item) {
  // TODO: implement edit logic
}

function handleDelete(_row: Item) {
  // TODO: implement delete logic
}

async function handleCreate(payload) {
  const response = await $fetch(`/api/v1/${slug}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  data.value.data.push(response)
  isModalOpen.value = false
}

function openCreate() {
  isModalOpen.value = true
}

const debouncedSearch = debounce((value: string) => {
  query.value.search = value
  refresh(undefined, { query: { ...query.value } })
}, 300)

function handleSearch(_value: string) {
  debouncedSearch(_value)
}

function handleFilters(_value: Record<string, string | number | undefined>) {
  Object.assign(query.value, _value)
  refresh(undefined, { query: { ...query.value } })
}

function handlePage(_value: number) {
  query.value.page = _value
  refresh(undefined, { query: { ...query.value } })
}

function handleItemsPerPage(_value: number) {
  query.value.pageSize = _value
  refresh(undefined, { query: { ...query.value } })
}
</script>

<template>
  <div class="w-full">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-semibold text-[--ui-text]">
        {{ slug.charAt(0).toUpperCase() + slug.slice(1) }} Table
      </h3>
      <UButton
        color="primary"
        size="md"
        class="ml-4"
        @click="openCreate"
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
      :visible-props="visibleProps"
      :rows="rows"
      :table="slug"
      :total="data?.count"
      @on-edit="openEdit"
      @on-delete="handleDelete"
      @on-click="(id) => navigateTo(`/admin/collections/${slug}/${id}`)"
      @update:search="handleSearch"
      @update:filters="handleFilters"
      @update:page="handlePage"
      @update:items-per-page="handleItemsPerPage"
    />

    <!-- <UCard class="!bg-(--ui-bg)">
      <h2 class="text-highlighted text-2xl font-semibold">Users</h2>
    </UCard> -->

    <UModal
      v-model:open="isModalOpen"
      title="Create item"
    >
      <template #body>
        <AdminForm
          v-if="CreateUserForm"
          :schema="CreateUserForm"
          :table="slug"
          @close="isModalOpen = false"
          @submit="handleCreate"
        />
      </template>
    </UModal>
  </div>
</template>
