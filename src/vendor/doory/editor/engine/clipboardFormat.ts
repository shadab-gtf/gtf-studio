import type { DocObject } from '@/vendor/doory/types/document'
import { MAX_STUDIO_JSON_LENGTH, studioObjectsSchema } from '@/core/document/studio-schema'

export const CLIPBOARD_MIME = 'application/x-doory+json'
const TEXT_MARKER = 'doory-clipboard/v1'

export interface ClipboardPayload {
  kind: typeof TEXT_MARKER
  objects: DocObject[]
  /** Source page size, so pasted content can be re-centred on a differently sized page. */
  page: { width: number; height: number }
}

export function encodeClipboard(objects: DocObject[], page: { width: number; height: number }): string {
  const payload: ClipboardPayload = { kind: TEXT_MARKER, objects, page }
  return JSON.stringify(payload)
}

/** Parses clipboard text produced by `encodeClipboard`; returns null for anything else. */
export function decodeClipboard(text: string): ClipboardPayload | null {
  if (text.length > MAX_STUDIO_JSON_LENGTH) throw new Error('Clipboard content exceeds the 20 MB limit.')
  if (!text.startsWith('{') || !text.includes(TEXT_MARKER)) return null
  try {
    const parsed: unknown = JSON.parse(text)
    if (!parsed || typeof parsed !== 'object') return null
    const p = parsed as Partial<ClipboardPayload>
    if (p.kind !== TEXT_MARKER) return null
    if (!Array.isArray(p.objects) || !p.page) throw new Error('Invalid clipboard envelope')
    const objects = studioObjectsSchema.parse(p.objects)
    if (objects.length === 0) throw new Error('No objects')
    const { width, height } = p.page
    if (![width, height].every(value => typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= 8000)) throw new Error('Invalid page size')
    return { kind: TEXT_MARKER, objects, page: { width, height } }
  } catch {
    throw new Error('The copied design is malformed or exceeds the supported limits.')
  }
}
