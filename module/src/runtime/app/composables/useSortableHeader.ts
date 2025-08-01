import { h } from 'vue'
import type { Ref, Component } from 'vue'

export function useSortableHeader(UButton: Component, sortBy: Ref<string>, sortDir: Ref<string>) {
  return function renderSortableHeader(
    label: string,
    column: {
      getIsSorted: () => string | false
      toggleSorting: (desc: boolean) => void
      id?: string
    },
  ) {
    const isSorted = column.getIsSorted()

    return h(UButton, {
      color: 'neutral',
      variant: 'link',
      label,
      trailingIcon: isSorted
        ? isSorted === 'asc'
          ? 'i-lucide-arrow-up'
          : 'i-lucide-arrow-down'
        : 'i-lucide-chevrons-up-down',
      ui: {
        trailingIcon: 'size-3',
      },
      class: '-mx-2.5 font-semibold',
      onClick: () => {
        if (column.id) {
          if (sortBy.value === column.id) {
            sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
          }
          else {
            sortBy.value = column.id
            sortDir.value = 'asc'
          }
        }
        column.toggleSorting(sortDir.value === 'desc')
      },
    })
  }
}
