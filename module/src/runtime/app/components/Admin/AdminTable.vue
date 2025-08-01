<script setup lang="ts" generic="T = unknown">
import { ref, watch, type VNode, computed, resolveComponent, type Component } from 'vue'
import { useSortableHeader, navigateTo } from '#imports'

const sortBy = ref<string>('')
const sortDir = ref<string>('asc')

const sortButton = resolveComponent('UButton') as Component

const renderSortableHeader = useSortableHeader(sortButton, sortBy, sortDir)

// TanStack-style column definition
type TableColumnDef<TData = unknown> = {
  id: string
  header: string | (() => string | number | VNode)
  accessorKey?: string
  cell?: (row: TData) => string | number | VNode
  align?: 'left' | 'center' | 'right'
  meta?: Record<string, unknown>
}

type TableProps<T> = {
  visibleProps: string[]
  rows: T[]
  tableClass?: string
  total?: number
  pageCount?: number
}

const props = defineProps<TableProps<T>>()

const columns = computed<TableColumnDef<UserTableRow>[]>(() => [
  ...props.visibleProps.map(prop => ({
    id: prop,
    header: ({ column }) => renderSortableHeader(prop.charAt(0).toUpperCase() + prop.slice(1), column),
    accessorKey: prop,
  })),
  // {
  //   id: 'actions',
  //   header: () => 'Actions',
  //   cell: (row: UserTableRow) => h('button', { class: 'text-primary', onClick: () => openEdit(row) }, 'Edit'),
  //   align: 'right',
  // },
])

// Emit events for search, filter, and page changes
const emit = defineEmits<{
  (e: 'on-click', id: string | number): void
  (e: 'update:search', value: string): void
  (
    e: 'update:filters',
    value: Record<string, string | number | undefined>
  ): void
  (e: 'update:page', value: number): void
}>()

const search = ref('')
const filters = ref<Record<string, string | number | undefined>>({})
const page = ref(1)

// Watchers to emit changes upward
watch(search, value => emit('update:search', value))
watch(filters, value => emit('update:filters', value))
watch(page, value => emit('update:page', value))
</script>

<template>
  <UCard variant="subtle">
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center gap-4">
        <UInput
          v-model="search"
          variant="subtle"
          icon="i-lucide-search"
          placeholder="Search..."
          class="w-full sm:w-64"
          size="lg"
        />
        <!-- Example filter: status -->
        <!-- <USelect
          v-model="filters.status"
          variant="soft"
          :items="[
            { label: 'All', value: '' },
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ]"
          placeholder="Status"
          class="w-32"
        /> -->
      </div>
      <UTable
        :columns="columns"
        :data="props.rows"
        :class="props.tableClass"
        @select="(row) => navigateTo({
          name: 'admin-collections-table-id',
          params: {
            table: 'users',
            id: row.original.id,
          },
        })"
      />
      <div class="flex justify-end mt-2">
        <UPagination
          v-model="page"
          :page-count="props.pageCount || 1"
          :total="props.total || 0"
          :page="page"
        />
      </div>
    </div>
  </UCard>
</template>

<!-- No custom styles needed; use Tailwind/Nuxt UI utilities -->
