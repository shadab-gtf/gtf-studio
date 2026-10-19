import { Check } from '@/features/studio/icons'
import { useMemo, useRef, useState } from 'react'
import type { PageBackground } from '@/vendor/doory/types/document'
import { useDocument, useEditor, useEditorState } from '../context'
import { documentColors } from '../engine/docOps'
import { gradientCss } from '../engine/objects/fills'
import { t } from '../strings'
import { Button } from '../ui/Button'
import { ColorButton } from '../ui/ColorButton'
import { Segmented } from '../ui/Segmented'
import { GRADIENT_PRESETS, palettes } from '../ui/swatches'
import { FillEditor } from '../ui/FillEditor'
import { Popover } from '../ui/Popover'
import { UploadedArtwork } from './UploadedArtwork'
import ed from '../chrome/ed.module.css'
import { backgroundFill, fillToBackground } from './backgroundFill'
import { PATTERN_IDS, type PatternId, patternUrl, tileSize } from './patterns'
import styles from './Panel.module.css'

export function BackgroundPanel() {
  const editor = useEditor()
  const doc = useDocument()
  const activeId = useEditorState((s) => s.activePageId)
  const gradientAnchor = useRef<HTMLButtonElement>(null)
  const [gradientOpen, setGradientOpen] = useState(false)
  const page = doc.pages.find((p) => p.id === activeId) ?? doc.pages[0]
  const bg = page.background
  const docColors = useMemo(() => documentColors(doc, 12), [doc])
  const preset = palettes.get('doory')?.colors ?? []
  const colors = [...new Set([...docColors, ...preset, ...(palettes.get('vivid')?.colors ?? [])])].slice(0, 18)

  const set = (b: PageBackground, key?: string): void => editor.pages.setBackground(page.id, b, key)
  const [ink, setInk] = useState('#7a64e0')
  const [paper, setPaper] = useState('#ffffff')
  const size = editor.pageSizeOf(page.id)
  const tile = tileSize(size.width, size.height)
  const setPattern = (id: PatternId, fg = ink, bgc = paper): void => set({ type: 'image', src: patternUrl(id, fg, bgc, tile), fit: 'tile' })

  return (
    <div className={styles.panel}>
      <section className={styles.section}>
        <p className={ed.sectionTitle}>{t.panels.pageBackground}</p>
        <div className={styles.fieldRow}>
          <span className={styles.hint}>Background color</span>
          <ColorButton label="Background color" value={bg.type === 'solid' ? backgroundFill(bg) : { type: 'solid', color: '#ffffff' }} solidOnly onChange={(f) => set(fillToBackground(f), 'bg-fill')} />
        </div>
        <div className={styles.swatchGrid} role="group" aria-label={t.panels.swatches}>
          {colors.map((c) => (
            <button key={c} type="button" className={styles.swatchBtn} style={{ background: c }} aria-label={t.backgroundPanel.set(c)} title={c} onClick={() => set({ type: 'solid', color: c })} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <p className={ed.sectionTitle}>{t.panels.gradient}</p>
        <Button ref={gradientAnchor} variant="soft" aria-haspopup="dialog" aria-expanded={gradientOpen} onClick={() => {
          if (bg.type !== 'gradient') set({ type: 'gradient', kind: 'linear', angle: 90, stops: [{ offset: 0, color: bg.type === 'solid' ? bg.color : '#ffffff' }, { offset: 1, color: '#e24397' }] })
          setGradientOpen(true)
        }}>Create custom gradient</Button>
        <Popover open={gradientOpen} onClose={() => setGradientOpen(false)} anchorRef={gradientAnchor} label="Custom background gradient" placement="bottom-start">
          <FillEditor value={backgroundFill(bg)} onChange={fill => set(fillToBackground(fill), `bg-gradient:${page.id}`)} />
        </Popover>
        <p className={styles.hint}>Mix your own colors, add stops, and choose a linear or radial gradient.</p>
        <div className={`${styles.grid} ${styles.grid}`}>
          {GRADIENT_PRESETS.map((g) => (
            <button
              key={g.id}
              type="button"
              className={styles.swatchBtn}
              style={{ background: gradientCss({ type: 'gradient', kind: 'linear', angle: g.angle, stops: g.stops }), aspectRatio: '3 / 2' }}
              aria-label={t.backgroundPanel.gradientOf(g.label)}
              title={g.label}
              onClick={() => set({ type: 'gradient', kind: 'linear', angle: g.angle, stops: g.stops })}
            />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <p className={ed.sectionTitle}>{t.backgroundPanel.patterns}</p>
        <div className={styles.fieldRow}>
          <span className={styles.hint}>{t.backgroundPanel.patternColor}</span>
          <ColorButton label={t.backgroundPanel.patternColor} value={{ type: 'solid', color: ink }} solidOnly onChange={(f) => f.type === 'solid' && setInk(f.color)} />
        </div>
        <div className={styles.fieldRow}>
          <span className={styles.hint}>{t.backgroundPanel.patternBackground}</span>
          <ColorButton label={t.backgroundPanel.patternBackground} value={{ type: 'solid', color: paper }} solidOnly onChange={(f) => f.type === 'solid' && setPaper(f.color)} />
        </div>
        <div className={styles.grid}>
          {PATTERN_IDS.map((id) => (
            <button key={id} type="button" className={styles.patternBtn} style={{ backgroundImage: `url("${patternUrl(id, ink, paper, 24)}")` }} aria-label={t.backgroundPanel.patternOf(t.backgroundPanel.patternNames[id])} title={t.backgroundPanel.patternNames[id]} data-testid={`bg-pattern-${id}`} onClick={() => setPattern(id)} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <p className={ed.sectionTitle}>{t.panels.image}</p>
        <UploadedArtwork mode="background" selectedSrc={bg.type === 'image' ? bg.src : undefined} onPick={asset => set({ type: 'image', src: asset.url, fit: bg.type === 'image' ? bg.fit : 'cover' })} />
        {bg.type === 'image' ? (
          <>
            <Segmented
              label={t.panels.fit}
              value={bg.fit}
              onChange={(fit) => set({ ...bg, fit })}
              options={[
                { value: 'cover', label: t.panels.cover },
                { value: 'contain', label: t.panels.contain },
                { value: 'tile', label: t.panels.tile },
              ]}
            />
            <Button variant="ghost" onClick={() => set({ type: 'solid', color: '#ffffff' })}>
              {t.panels.removeBackgroundImage}
            </Button>
          </>
        ) : null}
      </section>

      <Button variant="soft" icon={<Check size={18} />} disabled={doc.pages.length < 2} onClick={() => editor.pages.setBackgroundAll(page.background)}>
        {t.panels.applyToAll}
      </Button>
    </div>
  )
}
