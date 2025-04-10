// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  // Configure nitro server to use our custom API router
  nitro: {
    routeRules: {
      '/api/**': { cors: true }
    }
  }
})
