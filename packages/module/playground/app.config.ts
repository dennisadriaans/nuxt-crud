import z from 'zod/v4'

export default defineAppConfig({
  // https://ui.nuxt.com/getting-started/theme#design-system
  app: {
    name: 'NUXT CRUD',
  },
  crud: {
    collections: ['users', 'products'],
    config: {
      users: {
        icon: 'i-lucide-user',
        visibleFields: ['name', 'email'],
        getValidationRules: () => {
          return {
            email: z.email().min(1, 'Email is required'),
          }
        },
      },
      products: {
        visibleFields: ['name'],
      },
    },
  },
  ui: {
    colors: {
      primary: 'emerald',
      neutral: 'neutral',
    },
    badge: {
      defaultVariants: {
        color: 'neutral',
        variant: 'outline',
      },
    },
    table: {
      slots: {
        thead: '[&>tr]:after:bg-(--ui-border)',
        th: 'py-2',
        // td: "py-4 px-6",
      },
    },
    breadcrumb: {
      variants: {
        active: {
          true: {
            link: 'text-dimmed font-normal',
          },
        },
      },
    },
    card: {
      slots: {
        body: 'sm:p-4',
        header: 'sm:p-4',
      },
    },
    button: {
      slots: {
        base: 'cursor-pointer',
      },
      defaultVariants: {
        // Set default button color to neutral
        color: 'neutral',
        size: 'lg',
      },
    },
    input: {
      slots: {
        base: '!ring-default',
      },
    },
    textarea: {
      slots: {
        base: '!ring-default',
      },
    },
    select: {
      slots: {
        base: 'cursor-pointer',
        itemLeadingIcon: '!size-4',
        leadingIcon: '!size-4',
      },
      defaultVariants: {
        // Set default button color to neutral
        color: 'neutral',
        size: 'lg',
      },
    },
  },
})
