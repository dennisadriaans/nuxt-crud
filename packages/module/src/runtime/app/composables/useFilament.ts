import type { FilamentConfig } from '../../types/filament'
import { useAppConfig } from '#imports'
import { tables } from '~~/server/database'

export const useFilament = () => {
  const config = useAppConfig() as { filament?: FilamentConfig }

  const collections = Object.keys(tables ?? {}).filter(key =>
    config.filament?.collections?.includes(key),
  )

  function getVisibleFields(collection: string) {
    return (
      config.filament?.config?.[
        collection as keyof typeof config.filament.config
      ]?.visibleFields || []
    )
  }

  return {
    collections,
    getVisibleFields,
  }
}
