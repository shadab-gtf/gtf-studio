import type { AssetRef } from '@/vendor/doory/types/adapter'
import type { Asset } from '@/vendor/doory/types/api'
import { useEditor, useEditorStateShallow } from '../context'
import { useAsyncList } from './useAsyncList'

/** Merge durable uploads and new files without duplicating thumbnails. */
export function useArtworkUploads(svgOnly: boolean) {
  const editor = useEditor()
  const session = useEditorStateShallow(s => s.uploads)
  const library = useAsyncList<Asset>(page => editor.adapter.services.assets.list({ page, page_size: 18, kind: svgOnly ? 'svg' : undefined }), `artwork:${svgOnly}`)
  const assets = new Map<string, AssetRef>()
  for (const asset of session) {
    if (asset.kind !== 'audio' && (!svgOnly || asset.kind === 'svg')) assets.set(asset.id, asset)
  }
  for (const asset of library.items) {
    if (!assets.has(asset.id) && asset.kind !== 'audio' && (!svgOnly || asset.kind === 'svg')) assets.set(asset.id, { id: asset.id, name: asset.name, kind: asset.kind, url: asset.url, thumbUrl: asset.thumb_url, width: asset.width, height: asset.height })
  }
  return { ...library, items: [...assets.values()] }
}
