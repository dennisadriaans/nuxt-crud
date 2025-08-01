<script setup lang="ts">
import { computed, useRoute } from '#imports'

const route = useRoute()

const items = computed(() => {
  const pathSegments = route.path.split('/').filter(segment => segment !== '')
  let currentPath = ''

  return pathSegments.map((segment) => {
    currentPath += `/${segment}`
    return {
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      to: currentPath,
    }
  })
})
</script>

<template>
  <UBreadcrumb :items="items" />
</template>
