<script lang="ts" setup>
import { useCrud } from '#imports'

const { collections } = await useCrud()
const config = useAppConfig()

const mainLinks = computed(() => [
  {
    label: 'Admin',
    icon: 'i-lucide-chart-spline',
    to: '/admin',
  },
  {
    label: 'Collections',
    icon: 'i-lucide-folder',
    to: '/admin/collections',
    open: true,
    children: collections.map(collection => ({
      label: collection,
      icon: config.crud?.config?.[collection as keyof typeof config.crud.config]?.icon,
      to: `/admin/collections/${collection}`,
    })),
  },
])

const bottomLinks = [
  {
    label: 'Settings',
    icon: 'i-lucide-settings',
    to: '/admin/settings',
  },
  {
    label: 'Log out',
    icon: 'i-lucide-log-out',
    to: '/admin/logout',
  },
]
</script>

<template>
  <UDashboardSidebar
    id="default"
    resizable
    class="bg-elevated/25"
  >
    <template #header="{ collapsed }">
      <span class="text-lg font-bold">
        {{ config.app?.name }}
      </span>
    </template>

    <template #default="{ collapsed }">
      <!-- <UDashboardSearchButton
        :collapsed="collapsed"
        class="bg-transparent ring-default"
      /> -->

      <UNavigationMenu
        :collapsed="collapsed"
        :items="mainLinks"
        orientation="vertical"
        tooltip
        popover
      />

      <UNavigationMenu
        :collapsed="collapsed"
        :items="bottomLinks"
        orientation="vertical"
        tooltip
        class="mt-auto"
      />
    </template>

    <template #footer="{ collapsed }">
      <UserMenu :collapsed="collapsed" />
    </template>
  </UDashboardSidebar>
</template>
