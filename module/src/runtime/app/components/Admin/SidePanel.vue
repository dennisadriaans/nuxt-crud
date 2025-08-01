<script lang="ts" setup>
import { useFilament } from '#imports'

const { collections } = await useFilament()
</script>

<template>
  <aside
    class=""
  >
    <nav
      class="space-y-6 overflow-auto"
    >
      <div class="flex items-center text-lg font-bold">
        Nuxt CRUD
      </div>

      <div class="w-64 px-4">
        <h3
          class="mb-3 px-3 text-xs font-semibold tracking-wider text-muted uppercase"
        >
          Content
        </h3>
        <div class="space-y-2">
          <NuxtLink to="/admin">
            <UButton
              variant="ghost"
              color="neutral"
              class="w-full justify-start"
            >
              <Icon
                name="i-lucide-chart-spline"
                class="mr-1"
              />
              Admin
            </UButton>
          </NuxtLink>
          <NuxtLink
            to="/admin/collections"
            class="pl-4"
          >
            <UButton
              variant="ghost"
              color="neutral"
              class="w-full justify-start"
            >
              <Icon
                name="i-lucide-folder"
                class="mr-1"
              />
              collections
            </UButton>
          </NuxtLink>
          <div class="space-y-1 pl-8">
            <NuxtLink
              v-for="(table, tableKey) in collections"
              :key="tableKey"
              :label="table"
              :to="`/admin/collections/${table}`"
              class="block"
            >
              <UButton
                variant="ghost"
                color="neutral"
                class="w-full justify-start"
              >
                <Icon
                  name="i-lucide-user"
                  class="mr-1"
                />
                {{ table }}
              </UButton>
            </NuxtLink>
          </div>
        </div>
      </div>

      <div class="absolute bottom-0 left-0 w-full space-y-4 p-4">
        <div>
          <AdminMenuItem
            to="/"
            icon="i-lucide-share-2"
            label="Settings"
          />
          <AdminMenuItem
            to="/"
            icon="i-lucide-log-out"
            label="Log out"
          />
        </div>
      </div>
    </nav>
  </aside>
</template>
