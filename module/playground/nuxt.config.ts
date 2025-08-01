export default defineNuxtConfig({
  modules: ['../src/module', '@nuxthub/core', '@nuxt/ui'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  hub: {
    database: true,
  },
})
