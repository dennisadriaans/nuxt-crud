<script setup lang="ts">
import { computed, ref, type BulletLegendItemInterface, CurveType, LegendPosition } from '#imports'

interface RevenueData {
  month: number
  revenue: number
}

interface OrdersData {
  month: number
  orders: number
}

interface CustomersData {
  month: number
  customers: number
}

// Mock data for demonstration
const revenueData = ref<RevenueData[]>([
  { month: 1, revenue: 125000 },
  { month: 2, revenue: 98000 },
  { month: 3, revenue: 145000 },
  { month: 4, revenue: 167000 },
  { month: 5, revenue: 189000 },
  { month: 6, revenue: 156000 },
  { month: 7, revenue: 178000 },
  { month: 8, revenue: 198000 },
  { month: 9, revenue: 134000 },
  { month: 10, revenue: 210000 },
  { month: 11, revenue: 187000 },
  { month: 12, revenue: 224000 },
])

const ordersData = ref<OrdersData[]>([
  { month: 1, orders: 342 },
  { month: 2, orders: 287 },
  { month: 3, orders: 398 },
  { month: 4, orders: 456 },
  { month: 5, orders: 521 },
  { month: 6, orders: 434 },
  { month: 7, orders: 489 },
  { month: 8, orders: 567 },
  { month: 9, orders: 378 },
  { month: 10, orders: 612 },
  { month: 11, orders: 543 },
  { month: 12, orders: 678 },
])

const customersData = ref<CustomersData[]>([
  { month: 1, customers: 1250 },
  { month: 2, customers: 1320 },
  { month: 3, customers: 1456 },
  { month: 4, customers: 1634 },
  { month: 5, customers: 1798 },
  { month: 6, customers: 1923 },
  { month: 7, customers: 2087 },
  { month: 2234 },
  { month: 9, customers: 2345 },
  { month: 10, customers: 2456 },
  { month: 11, customers: 2567 },
  { month: 12, customers: 2698 },
])

// Chart categories
const revenueCategories: Record<string, BulletLegendItemInterface> = {
  revenue: { name: 'Monthly Revenue', color: '#3b82f6' },
}

const ordersCategories: Record<string, BulletLegendItemInterface> = {
  orders: { name: 'Orders', color: '#10b981' },
}

const customersCategories: Record<string, BulletLegendItemInterface> = {
  customers: { name: 'Total Customers', color: '#8b5cf6' },
}

// Formatters
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US').format(value)
}

const formatMonth = (i: number, data: RevenueData[] | OrdersData[] | CustomersData[]) => {
  return new Date(`2025-${data[i]?.month}-02`).toLocaleDateString('en-US', {
    month: 'short',
  })
}

// Calculate stats
const totalRevenue = computed(() =>
  revenueData.value.reduce((sum, item) => sum + item.revenue, 0),
)

const totalOrders = computed(() =>
  ordersData.value.reduce((sum, item) => sum + item.orders, 0),
)

const totalCustomers = computed(() =>
  customersData.value[customersData.value.length - 1]?.customers || 0,
)

const newCustomersThisMonth = computed(() => {
  const currentMonth = customersData.value[customersData.value.length - 1]?.customers || 0
  const previousMonth = customersData.value[customersData.value.length - 2]?.customers || 0
  return currentMonth - previousMonth
})

// Growth calculations
const revenueGrowth = computed(() => {
  const current = revenueData.value[revenueData.value.length - 1]?.revenue || 0
  const previous = revenueData.value[revenueData.value.length - 2]?.revenue || 0
  return previous > 0 ? ((current - previous) / previous * 100) : 0
})

const ordersGrowth = computed(() => {
  const current = ordersData.value[ordersData.value.length - 1]?.orders || 0
  const previous = ordersData.value[ordersData.value.length - 2]?.orders || 0
  return previous > 0 ? ((current - previous) / previous * 100) : 0
})

const customersGrowth = computed(() => {
  const current = totalCustomers.value
  const previous = customersData.value[customersData.value.length - 2]?.customers || 0
  return previous > 0 ? ((current - previous) / previous * 100) : 0
})
</script>

<template>
  <div class="space-y-8">
    <!-- Page Header -->
    <div>
      <h1 class="text-2xl font-semibold text-(--ui-text)">
        Dashboard
      </h1>
      <p class="text-(--ui-text-muted) mt-1">
        Welcome back! Here's what's happening with your business.
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total Revenue -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-(--ui-text-muted)">
              Total Revenue
            </p>
            <p class="text-2xl font-semibold text-(--ui-text) mt-1">
              {{ formatCurrency(totalRevenue) }}
            </p>
          </div>
          <div class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20">
            <UIcon
              name="i-lucide-dollar-sign"
              size="16"
              class="text-blue-600 dark:text-blue-400"
            />
          </div>
        </div>
        <div class="flex items-center mt-4">
          <UIcon
            :name="revenueGrowth >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
            :class="[
              'w-4 h-4 mr-2',
              revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600',
            ]"
          />
          <span
            :class="[
              'text-sm font-medium',
              revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600',
            ]"
          >          >
            {{ Math.abs(revenueGrowth).toFixed(1) }}%
          </span>
          <span class="text-sm text-(--ui-text-muted) ml-2">
            from last month
          </span>
        </div>
      </UCard>

      <!-- New Customers -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-(--ui-text-muted)">
              New Customers
            </p>
            <p class="text-2xl font-semibold text-(--ui-text) mt-1">
              {{ formatNumber(newCustomersThisMonth) }}
            </p>
          </div>
          <div class="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20">
            <UIcon
              name="i-lucide-users"
              size="20"
              class="text-green-600 dark:text-green-400"
            />
          </div>
        </div>
        <div class="flex items-center mt-4">
          <UIcon
            :name="customersGrowth >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
            :class="[
              'w-4 h-4 mr-2',
              customersGrowth >= 0 ? 'text-green-600' : 'text-red-600',
            ]"
          />
          <span
            :class="[
              'text-sm font-medium',
              customersGrowth >= 0 ? 'text-green-600' : 'text-red-600',
            ]"
          >
            {{ Math.abs(customersGrowth).toFixed(1) }}%
          </span>
          <span class="text-sm text-(--ui-text-muted) ml-2">
            from last month
          </span>
        </div>
      </UCard>

      <!-- New Orders -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-(--ui-text-muted)">
              New Orders
            </p>
            <p class="text-2xl font-semibold text-(--ui-text) mt-1">
              {{ formatNumber(ordersData[ordersData.length - 1]?.orders || 0) }}
            </p>
          </div>
          <div class="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20">
            <UIcon
              name="i-lucide-shopping-cart"
              size="20"
              class="text-purple-600 dark:text-purple-400"
            />
          </div>
        </div>
        <div class="flex items-center mt-4">
          <UIcon
            :name="ordersGrowth >= 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
            :class="[
              'w-4 h-4 mr-2',
              ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600',
            ]"
          />
          <span
            :class="[
              'text-sm font-medium',
              ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600',
            ]"
          >
            {{ Math.abs(ordersGrowth).toFixed(1) }}%
          </span>
          <span class="text-sm text-(--ui-text-muted) ml-2">
            from last month
          </span>
        </div>
      </UCard>

      <!-- Total Customers -->
      <UCard>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-(--ui-text-muted)">
              Total Customers
            </p>
            <p class="text-2xl font-semibold text-(--ui-text) mt-1">
              {{ formatNumber(totalCustomers) }}
            </p>
          </div>
          <div class="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20">
            <UIcon
              name="i-lucide-user-check"
              size="20"
              class="text-orange-600 dark:text-orange-400"
            />
          </div>
        </div>
        <div class="flex items-center mt-4">
          <UIcon
            name="i-lucide-trending-up"
            class="w-4 h-4 mr-2 text-green-600"
          />
          <span class="text-sm font-medium text-green-600">
            {{ formatNumber(totalOrders) }}
          </span>
          <span class="text-sm text-(--ui-text-muted) ml-2">
            total orders
          </span>
        </div>
      </UCard>
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Revenue Chart -->
      <UCard>
        <template #header>
          <div>
            <h3 class="text-lg font-medium text-(--ui-text)">
              Revenue Overview
            </h3>
            <p class="text-sm text-(--ui-text-muted) mt-1">
              Monthly revenue performance
            </p>
          </div>
        </template>

        <AreaChart
          :data="revenueData"
          :height="220"
          :categories="revenueCategories"
          :y-axis="['revenue']"
          :y-num-ticks="4"
          :curve-type="CurveType.Basis"
          :legend-position="LegendPosition.Top"
          :x-formatter="(i) => formatMonth(i, revenueData)"
          :y-formatter="formatCurrency"
        />

        <template #footer>
          <div class="flex justify-between items-center">
            <div class="text-sm text-(--ui-text-muted)">
              Best month: December ({{ formatCurrency(224000) }})
            </div>
            <UButton
              variant="link"
              color="neutral"
              size="sm"
            >
              <template #leading>
                <UIcon name="i-lucide-external-link" />
              </template>
              View details
            </UButton>
          </div>
        </template>
      </UCard>

      <!-- Orders Chart -->
      <UCard>
        <template #header>
          <div>
            <h3 class="text-lg font-medium text-(--ui-text)">
              Orders Per Month
            </h3>
            <p class="text-sm text-(--ui-text-muted) mt-1">
              Monthly order volume
            </p>
          </div>
        </template>

        <AreaChart
          :data="ordersData"
          :height="220"
          :categories="ordersCategories"
          :y-axis="['orders']"
          :y-num-ticks="4"
          :curve-type="CurveType.Basis"
          :legend-position="LegendPosition.Top"
          :x-formatter="(i) => formatMonth(i, ordersData)"
          :y-formatter="formatNumber"
        />

        <template #footer>
          <div class="flex justify-between items-center">
            <div class="text-sm text-(--ui-text-muted)">
              Peak: {{ formatNumber(678) }} orders in December
            </div>
            <UButton
              variant="link"
              color="neutral"
              size="sm"
            >
              <template #leading>
                <UIcon name="i-lucide-external-link" />
              </template>
              View orders
            </UButton>
          </div>
        </template>
      </UCard>
    </div>

    <!-- Customer Growth Chart - Full Width -->
    <UCard>
      <template #header>
        <div>
          <h3 class="text-lg font-medium text-(--ui-text)">
            Customer Growth Over Time
          </h3>
          <p class="text-sm text-(--ui-text-muted) mt-1">
            Total customer base growth throughout the year
          </p>
        </div>
      </template>

      <AreaChart
        :data="customersData"
        :height="350"
        :categories="customersCategories"
        :y-axis="['customers']"
        :y-num-ticks="5"
        :curve-type="CurveType.Basis"
        :legend-position="LegendPosition.Top"
        :x-formatter="(i) => formatMonth(i, customersData)"
        :y-formatter="formatNumber"
      />

      <template #footer>
        <div class="flex justify-between items-center">
          <div class="text-sm text-(--ui-text-muted)">
            Growth rate: {{ customersGrowth.toFixed(1) }}% this month
          </div>
          <UButton
            variant="link"
            color="neutral"
            size="sm"
          >
            <template #leading>
              <UIcon name="i-lucide-external-link" />
            </template>
            Customer analytics
          </UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>
