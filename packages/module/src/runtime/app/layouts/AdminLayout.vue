<template>
  <UDashboardGroup class="h-screen overflow-hidden">
    <AdminSidePanel />
    <UDashboardPanel class="overflow-y-auto">
      <UDashboardNavbar>
        <template #title>
          Admin
        </template>
        <template #right>
          <UColorModeButton />
        </template>
      </UDashboardNavbar>
      <UContainer class="pt-6 pb-8">
        <slot />
      </UContainer>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
