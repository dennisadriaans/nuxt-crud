<script lang="ts" setup>
import { useRoute } from '#imports';

defineProps<{
  to: string
  icon?: string
  label: string
}>()

const route = useRoute()
</script>

<template>
  <NuxtLink
    class="block"
    :to="to"
  >
    <UButton
      variant="link"
      color="neutral"
      active-variant="soft"
      active-color="neutral"
      class="w-full hover:bg-transparent"
      :active="route.path === to"
      :icon="icon"
      :ui="{
        leadingIcon: `mr-2 size-5 ${
          route.path === to ? '' : 'text-(--ui-text-dimmed)'
        }`,
      }"
    >{{ label }}</UButton>
  </NuxtLink>
</template>
