import { Upload } from '@/features/studio/icons'
import type { AssetRef } from '@/vendor/doory/types/adapter'
import { useEditor, useEditorState } from '../context'
import { useArtworkUploads } from '../hooks/useArtworkUploads'
import { useResolvedSrc } from '../hooks/useResolvedSrc'
import { Button } from '../ui/Button'
import { PreviewImage } from '../ui/PreviewImage'
import { Skeleton } from '../ui/Skeleton'
import styles from './UploadedArtwork.module.css'

type UploadMode = 'shape' | 'sticker' | 'background'
const COPY = {
  shape: { button: 'Upload SVG shape', hint: 'Add your own SVG. Select it on the canvas to edit its colors and background.', title: 'Your SVG shapes' },
  sticker: { button: 'Upload sticker', hint: 'SVG, PNG, JPG, WebP, GIF or AVIF. SVG colors stay editable.', title: 'Your uploaded artwork' },
  background: { button: 'Upload background image', hint: 'Upload a photo and apply it to this page.', title: 'Your uploaded images' },
} satisfies Record<UploadMode, { button: string; hint: string; title: string }>

function ArtworkThumbnail({ asset, selected, onPick }: { asset: AssetRef; selected: boolean; onPick: () => void }) {
  const src = useResolvedSrc(asset.thumbUrl || asset.url)
  return <button type="button" className={styles.tile} aria-label={`Use ${asset.name}`} aria-pressed={selected} title={asset.name} onClick={onPick}>
    {src ? <PreviewImage src={src} alt="" width={96} height={96} loading="lazy" draggable={false} /> : <Skeleton width="100%" height="100%" />}
  </button>
}

/** Engine actions preserve selection, storage and undo for uploaded artwork. */
export function UploadedArtwork({ mode, selectedSrc, onPick }: { mode: UploadMode; selectedSrc?: string; onPick?: (asset: AssetRef) => void }) {
  const editor = useEditor()
  const uploading = useEditorState(s => s.uploading > 0)
  const library = useArtworkUploads(mode === 'shape')
  const copy = COPY[mode]
  return <section className={styles.section} aria-label={copy.title}>
    <Button variant="soft" icon={<Upload size={17} />} disabled={uploading || editor.readOnly} onClick={() => void (mode === 'background' ? editor.insert.pickAndSetBackground() : editor.insert.pickAndInsertImages(mode === 'shape'))}>{copy.button}</Button>
    <p className={styles.hint}>{copy.hint}</p>
    {uploading ? <p className={styles.hint} role="status">Uploading your artwork…</p> : null}
    {library.loading && library.items.length === 0 ? <div className={styles.grid} aria-label="Loading your uploads" aria-busy="true">{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} height={64} />)}</div> : null}
    {library.items.length > 0 ? <details className={styles.library} open><summary>{copy.title}</summary><div className={styles.grid}>
      {library.items.map(asset => <ArtworkThumbnail key={asset.id} asset={asset} selected={asset.url === selectedSrc} onPick={() => onPick ? onPick(asset) : void editor.insert.imageFromAsset(asset)} />)}
    </div></details> : null}
    {library.error ? <div role="alert" className={styles.hint}>Could not load saved uploads. <Button size="sm" variant="ghost" onClick={library.reload}>Try again</Button></div> : null}
    {library.hasMore && !library.loading ? <Button size="sm" variant="ghost" onClick={library.loadMore}>Show more uploads</Button> : null}
  </section>
}
