import {
  defineNuxtModule,
  addServerImports,
  addComponentsDir,
  createResolver,
  addServerScanDir,
  addLayout,
  addImports,
  extendPages,
  installModule,
} from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'nuxt-filament',
    configKey: 'nuxtFilament',
  },
  defaults: {},
  async setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    installModule('nuxt-charts')

    extendPages((pages) => {
      pages.push({
        name: 'admin-index',
        path: '/admin',
        file: resolver.resolve('./runtime/app/pages/admin/index.vue'),
        meta: {
          layout: 'admin',
        },
      })
      pages.push({
        name: 'admin-collections',
        path: '/admin/collections',
        file: resolver.resolve(
          './runtime/app/pages/admin/collections/index.vue',
        ),
        meta: {
          layout: 'admin',
        },
      })
      pages.push({
        name: 'admin-collections-table',
        path: '/admin/collections/:table',
        file: resolver.resolve(
          './runtime/app/pages/admin/collections/[table]/index.vue',
        ),
        meta: {
          layout: 'admin',
        },
      })
      pages.push({
        name: 'admin-collections-table-id',
        path: '/admin/collections/:table/:id',
        file: resolver.resolve(
          './runtime/app/pages/admin/collections/[table]/[id].vue',
        ),
        meta: {
          layout: 'admin',
        },
      })
    })

    addImports(
      [
        {
          name: 'useFilament', // name of the composable to be used
          from: resolver.resolve('runtime/app/composables/useFilament'), // path of composable
        },
        {
          name: 'useSortableHeader',
          from: resolver.resolve('runtime/app/composables/useSortableHeader'),
        },
      ],
    )

    // Auto-import baseEventHandler
    // Auto-import useDrizzleTableQuery
    addServerImports([
      {
        name: 'baseEventHandler',
        from: resolver.resolve('./runtime/server/utils/baseEventHandler'),
      },
      {
        name: 'useDrizzleTableQuery',
        from: resolver.resolve('./runtime/server/utils/useDrizzleTableQuery'),
      },
    ])

    addComponentsDir({
      path: resolver.resolve('./runtime/app/components/Admin'),
      prefix: 'Admin',
      global: true,
    })

    addLayout(
      {
        src: resolver.resolve('./runtime/app/layouts/AdminLayout.vue'),
        filename: 'admin.vue',
      },
      'admin',
    )
  },
})
