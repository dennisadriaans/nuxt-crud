export interface FilamentCollectionConfig {
  visibleFields: string[]
  getValidationRules?: () => Record<string, unknown>
}

export interface FilamentConfig {
  collections: string[]
  config: Record<string, FilamentCollectionConfig>
}

declare module 'nuxt/schema' {
  interface AppConfigInput {
    filament?: FilamentConfig
  }
}

declare module '@nuxt/schema' {
  interface AppConfigInput {
    filament?: FilamentConfig
  }
}
