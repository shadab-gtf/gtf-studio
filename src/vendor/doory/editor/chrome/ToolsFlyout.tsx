import { type ReactNode, useCallback, useRef, useState } from 'react'
import { Grid3x3, Minus, MousePointer2, PencilLine, Shapes, StickyNote, Type } from '@/features/studio/icons'
import type { ShapeKind } from '../engine/api/insert'
import { type FillSpec, fillCssPreview, sortStops } from '../engine/objects/fills'
import { useEditor } from '../context'
import { type PanelDefinition } from '../panels/registry'
import { Popover } from '../ui/Popover'
import { Tooltip } from '../ui/Tooltip'
import { t } from '../strings'
import { SwatchGrid } from './ColorTool'
import { useChrome } from './ChromeContext'
import rail from './ToolRail.module.css'
import styles from './ToolsFlyout.module.css'

/* ------------------------------------------------------------------ palettes */

const STICKY_COLORS = ['#fde68a', '#fdba74', '#fca5a5', '#f9a8d4', '#a5b4fc', '#6ee7b7', '#c4b5fd', '#e5e7eb']

/* --------------------------------------------------------------------- icons */

function SignatureIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 16c2.5 0 3.2-9 5-9s1 6.5 2.8 6.5S14 9 16 9s1.2 3 3 3" />
      <path d="M4 20h16" />
    </svg>
  )
}

/* ------------------------------------------------------------- the main column */

type SubId = 'draw' | 'shapes' | 'line' | 'sticky' | 'tables'

function ColButton({ label, icon, active, hasSub, onClick }: { label: string; icon: ReactNode; active?: boolean; hasSub?: boolean; onClick: () => void }) {
  return (
    <Tooltip label={label} side="right" disabled={active}>
      <button type="button" className={`${styles.tool} ${active ? styles.toolOn : ''}`} aria-label={label} aria-pressed={active} aria-haspopup={hasSub ? 'menu' : undefined} aria-expanded={hasSub ? !!active : undefined} onClick={onClick}>
        {icon}
        {hasSub ? <span className={styles.caret} aria-hidden="true" /> : null}
      </button>
    </Tooltip>
  )
}

function Swatches({ colors, onPick, label }: { colors: readonly string[]; onPick: (c: string) => void; label: string }) {
  return (
    <div className={styles.swatches} role="group" aria-label={label}>
      {colors.map((c) => (
        <button key={c} type="button" className={styles.swatch} style={{ background: c }} aria-label={c} onClick={() => onPick(c)} />
      ))}
    </div>
  )
}

/* --------------------------------------------------------------- draw instruments */

/** An SVG gradient definition sized to the nib's bounding box, so a gradient stroke shows on the instrument nib. */
function GradientDefs({ id, spec }: { id: string; spec: Extract<FillSpec, { type: 'gradient' }> }) {
  const stops = sortStops(spec.stops).map((s, i) => <stop key={i} offset={`${Math.round(s.offset * 100)}%`} stopColor={s.color} />)
  if (spec.kind === 'radial') {
    return (
      <defs>
        <radialGradient id={id} cx="50%" cy="50%" r="60%">
          {stops}
        </radialGradient>
      </defs>
    )
  }
  const rad = (spec.angle * Math.PI) / 180
  const dx = Math.cos(rad) * 0.5
  const dy = Math.sin(rad) * 0.5
  return (
    <defs>
      <linearGradient id={id} x1={`${(0.5 - dx) * 100}%`} y1={`${(0.5 - dy) * 100}%`} x2={`${(0.5 + dx) * 100}%`} y2={`${(0.5 + dy) * 100}%`}>
        {stops}
      </linearGradient>
    </defs>
  )
}

/** Horizontal marker icon: a light barrel with a nib painted the currently selected draw colour or gradient. */
function Instrument({ kind, fill }: { kind: 'pen' | 'marker' | 'highlighter' | 'brush'; fill: FillSpec }) {
  const gradId = `ed-draw-nib-${kind}`
  const c = fill.type === 'solid' ? fill.color : `url(#${gradId})`
  return (
    <svg width={34} height={20} viewBox="0 0 34 20" fill="none" aria-hidden="true">
      {fill.type === 'gradient' ? <GradientDefs id={gradId} spec={fill} /> : null}
      {kind === 'pen' && (
        <>
          <rect x="2" y="7.5" width="20" height="5" rx="2.5" fill="#9aa3b2" />
          <path d="M22 7.5 L29 9.4 L33 10 L29 10.6 L22 12.5 Z" fill={c} />
        </>
      )}
      {kind === 'marker' && (
        <>
          <rect x="2" y="5.5" width="17" height="9" rx="2.5" fill="#d7dbe3" />
          <path d="M19 5.5 L27 7 L27 13 L19 14.5 Z" fill={c} />
          <rect x="27" y="7.3" width="4" height="5.4" rx="1.2" fill={c} />
        </>
      )}
      {kind === 'highlighter' && (
        <>
          <rect x="2" y="5" width="15" height="10" rx="2.5" fill="#e6e9ef" />
          <path d="M17 5 L25 7.5 L25 12.5 L17 15 Z" fill={c} />
          <rect x="25" y="6.3" width="6" height="7.4" rx="1.4" fill={c} fillOpacity={0.5} />
        </>
      )}
      {kind === 'brush' && (
        <>
          <rect x="2" y="7" width="17" height="6" rx="3" fill="#d7dbe3" />
          <path d="M19 6 C26 6 30 8 33 10 C30 12 26 14 19 14 Z" fill={c} />
        </>
      )}
    </svg>
  )
}

function WeightIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" stroke="currentColor" strokeLinecap="round" fill="none" aria-hidden="true">
      <line x1="4" y1="7" x2="20" y2="7" strokeWidth="1.5" />
      <line x1="4" y1="12" x2="20" y2="12" strokeWidth="3" />
      <line x1="4" y1="17.5" x2="20" y2="17.5" strokeWidth="5" />
    </svg>
  )
}

const INSTRUMENTS: { id: 'pen' | 'marker' | 'highlighter' | 'brush'; label: string; mult: number; op: number }[] = [
  { id: 'pen', label: '', mult: 0.6, op: 1 },
  { id: 'marker', label: '', mult: 1, op: 0.9 },
  { id: 'highlighter', label: '', mult: 2.2, op: 0.4 },
  { id: 'brush', label: '', mult: 1.4, op: 1 },
]

/* --------------------------------------------------------------- sub-flyouts */

function DrawPanel({ onClose }: { onClose: () => void }) {
  const editor = useEditor()
  const [fill, setFill] = useState<FillSpec>({ type: 'solid', color: '#1f2430' })
  const [weight, setWeight] = useState(10)
  const [opacity, setOpacity] = useState(100)
  const [panel, setPanel] = useState<'none' | 'colors' | 'weight'>('none')
  const pick = (mult: number, baseOp: number): void => {
    editor.draw.start({ fill, width: Math.max(1, Math.round(weight * mult)), opacity: Math.min(baseOp, opacity / 100) })
    onClose()
  }
  const labelFor = { pen: t.toolbox.pen, marker: t.toolbox.marker, highlighter: t.toolbox.highlighter, brush: t.toolbox.brush }
  return (
    <div className={styles.drawWrap}>
      <div className={styles.drawStrip} role="group" aria-label={t.toolbox.draw}>
        {INSTRUMENTS.map((ins) => (
          <Tooltip key={ins.id} label={labelFor[ins.id]} side="right">
            <button type="button" className={styles.instrument} aria-label={labelFor[ins.id]} onClick={() => pick(ins.mult, ins.op)}>
              <Instrument kind={ins.id} fill={fill} />
            </button>
          </Tooltip>
        ))}
        <span className={styles.drawSep} />
        <Tooltip label={t.toolbox.color} side="right" disabled={panel === 'colors'}>
          <button type="button" className={`${styles.colorDot} ${panel === 'colors' ? styles.ctrlOn : ''}`} style={{ background: fillCssPreview(fill) }} aria-label={t.toolbox.color} aria-pressed={panel === 'colors'} onClick={() => setPanel((p) => (p === 'colors' ? 'none' : 'colors'))} />
        </Tooltip>
        <Tooltip label={t.toolbox.brushSize} side="right" disabled={panel === 'weight'}>
          <button type="button" className={`${styles.weightBtn} ${panel === 'weight' ? styles.ctrlOn : ''}`} aria-label={t.toolbox.brushSize} aria-pressed={panel === 'weight'} onClick={() => setPanel((p) => (p === 'weight' ? 'none' : 'weight'))}>
            <WeightIcon />
          </button>
        </Tooltip>
      </div>
      {panel === 'colors' ? (
        <div className={styles.colorColumn} role="group" aria-label={t.toolbox.color}>
          <SwatchGrid value={fill} onChange={(f) => setFill(f)} allowGradient testId="ed-draw-color" />
        </div>
      ) : null}
      {panel === 'weight' ? (
        <div className={styles.drawSettings} role="group" aria-label={t.toolbox.brushSize}>
          <label className={styles.slider}>
            <span className={styles.subLabel}>
              {t.toolbox.brushSize}: {weight}
            </span>
            <input type="range" min={1} max={72} value={weight} onChange={(e) => setWeight(Number(e.target.value))} aria-label={t.toolbox.brushSize} />
          </label>
          <label className={styles.slider}>
            <span className={styles.subLabel}>
              {t.toolbox.opacity}: {opacity}
            </span>
            <input type="range" min={5} max={100} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} aria-label={t.toolbox.opacity} />
          </label>
        </div>
      ) : null}
    </div>
  )
}

const SHAPE_KINDS: { kind: ShapeKind; d: string }[] = [
  { kind: 'rect', d: 'M4 6h16v12H4z' },
  { kind: 'rounded', d: 'M7 6h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3z' },
  { kind: 'ellipse', d: 'M12 6a8 6 0 1 0 0 12 8 6 0 0 0 0-12z' },
  { kind: 'triangle', d: 'M12 5l8 14H4z' },
  { kind: 'diamond', d: 'M12 4l8 8-8 8-8-8z' },
  { kind: 'polygon', d: 'M12 4l7 5-2.7 8H7.7L5 9z' },
  { kind: 'star', d: 'M12 4l2.3 5 5.7.5-4.3 3.7 1.3 5.6L12 20.8 7 17.8l1.3-5.6L4 9.5 9.7 9z' },
]

function ShapesPanel({ onClose }: { onClose: () => void }) {
  const editor = useEditor()
  const add = (kind: ShapeKind): void => {
    void editor.insert.shape(kind)
    onClose()
  }
  return (
    <div className={styles.sub} role="group" aria-label={t.toolbox.shapes}>
      <div className={styles.shapeGrid}>
        {SHAPE_KINDS.map(({ kind, d }) => (
          <button key={kind} type="button" className={styles.shapeBtn} aria-label={kind} onClick={() => add(kind)}>
            <svg width={22} height={22} viewBox="0 0 24 24" aria-hidden="true">
              <path d={d} fill="currentColor" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}

function LinePanel({ onClose }: { onClose: () => void }) {
  const editor = useEditor()
  const add = (kind: ShapeKind): void => {
    void editor.insert.shape(kind)
    onClose()
  }
  return (
    <div className={styles.sub} role="group" aria-label={t.toolbox.line}>
      <div className={styles.subButtons}>
        <button type="button" className={styles.lineBtn} onClick={() => add('line')}>
          <svg width={44} height={14} viewBox="0 0 44 14" aria-hidden="true">
            <line x1="2" y1="7" x2="42" y2="7" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span>{t.toolbox.lineStraight}</span>
        </button>
        <button type="button" className={styles.lineBtn} onClick={() => add('arrow')}>
          <svg width={44} height={14} viewBox="0 0 44 14" aria-hidden="true">
            <line x1="2" y1="7" x2="38" y2="7" stroke="currentColor" strokeWidth="2" />
            <path d="M36 2l6 5-6 5z" fill="currentColor" />
          </svg>
          <span>{t.toolbox.lineArrow}</span>
        </button>
        <button type="button" className={styles.lineBtn} onClick={() => add('divider')}>
          <svg width={44} height={14} viewBox="0 0 44 14" aria-hidden="true">
            <line x1="2" y1="7" x2="42" y2="7" stroke="currentColor" strokeWidth="2" strokeDasharray="5 4" />
          </svg>
          <span>{t.toolbox.lineDotted}</span>
        </button>
      </div>
    </div>
  )
}

function StickyPanel({ onClose }: { onClose: () => void }) {
  const editor = useEditor()
  const add = (color: string): void => {
    void editor.insert.note(color)
    onClose()
  }
  return (
    <div className={styles.sub} role="group" aria-label={t.toolbox.sticky}>
      <span className={styles.subLabel}>{t.toolbox.color}</span>
      <Swatches colors={STICKY_COLORS} onPick={add} label={t.toolbox.sticky} />
    </div>
  )
}

function TablesPanel({ onClose }: { onClose: () => void }) {
  const editor = useEditor()
  const [hover, setHover] = useState({ r: 0, c: 0 })
  const MAX = 6
  const insert = (r: number, c: number): void => {
    void editor.insert.table(r, c)
    onClose()
  }
  return (
    <div className={styles.sub} role="group" aria-label={t.toolbox.tables}>
      <span className={styles.subLabel}>{hover.r > 0 ? t.toolbox.tableSize(hover.r, hover.c) : t.toolbox.insertTable}</span>
      <div className={styles.tableGrid} onPointerLeave={() => setHover({ r: 0, c: 0 })}>
        {Array.from({ length: MAX }).map((_, y) =>
          Array.from({ length: MAX }).map((__, x) => (
            <button
              key={`${x}-${y}`}
              type="button"
              className={`${styles.tableCell} ${y < hover.r && x < hover.c ? styles.tableCellOn : ''}`}
              aria-label={t.toolbox.tableSize(y + 1, x + 1)}
              onPointerEnter={() => setHover({ r: y + 1, c: x + 1 })}
              onFocus={() => setHover({ r: y + 1, c: x + 1 })}
              onClick={() => insert(y + 1, x + 1)}
            />
          )),
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------- the flyout */

export function ToolsFlyout({ panel, edge }: { panel: PanelDefinition; edge: 'side' | 'bottom' }) {
  const editor = useEditor()
  const chrome = useChrome()
  const anchorRef = useRef<HTMLButtonElement>(null)
  const setAnchor = useCallback(
    (el: HTMLButtonElement | null) => {
      anchorRef.current = el
      chrome.setAnchor(panel.id, el)
    },
    [chrome, panel.id],
  )
  const [open, setOpen] = useState(false)
  const [sub, setSub] = useState<SubId | null>(null)
  const close = useCallback(() => {
    setOpen(false)
    setSub(null)
  }, [])

  // Direct actions leave any drawing mode first, then act and close.
  const direct = (fn: () => void): void => {
    editor.draw.stop()
    fn()
    close()
  }
  const toggleSub = (id: SubId): void => setSub((s) => (s === id ? null : id))

  return (
    <>
      <button
        ref={setAnchor}
        type="button"
        className={rail.entry}
        aria-pressed={open}
        aria-haspopup="menu"
        aria-expanded={open}
        title={panel.label}
        data-tool="tools"
        data-testid="ed-add-entry-tools"
        onClick={(e) => {
          chrome.setKeyboardOpen(e.detail === 0)
          setOpen((o) => !o)
          setSub(null)
        }}
      >
        <span className={rail.icon}>{panel.icon}</span>
        <span className={rail.label}>{panel.label}</span>
      </button>
      <Popover
        open={open}
        onClose={close}
        anchorRef={anchorRef}
        placement={edge === 'bottom' ? 'top-start' : 'right-start'}
        variant="plain"
        label={t.toolbox.heading}
        cover
        focusOnOpen={chrome.isKeyboardOpen()}
      >
        <div className={styles.flyout} data-testid="ed-tools-flyout">
          <div className={styles.column} role="menu" aria-label={t.toolbox.heading}>
            <ColButton label={t.toolbox.select} icon={<MousePointer2 size={20} />} onClick={() => direct(() => editor.setTool('select'))} />
            <ColButton label={t.toolbox.draw} icon={<PencilLine size={20} />} hasSub active={sub === 'draw'} onClick={() => toggleSub('draw')} />
            <ColButton label={t.toolbox.shapes} icon={<Shapes size={20} />} hasSub active={sub === 'shapes'} onClick={() => toggleSub('shapes')} />
            <ColButton label={t.toolbox.line} icon={<Minus size={20} />} hasSub active={sub === 'line'} onClick={() => toggleSub('line')} />
            <ColButton label={t.toolbox.sticky} icon={<StickyNote size={20} />} hasSub active={sub === 'sticky'} onClick={() => toggleSub('sticky')} />
            <ColButton label={t.toolbox.text} icon={<Type size={20} />} onClick={() => direct(() => void editor.insert.text('body'))} />
            <ColButton label={t.toolbox.signature} icon={<SignatureIcon size={20} />} onClick={() => { editor.draw.start({ fill: { type: 'solid', color: '#1f2430' }, width: 3, opacity: 1 }); close() }} />
            <ColButton label={t.toolbox.tables} icon={<Grid3x3 size={20} />} hasSub active={sub === 'tables'} onClick={() => toggleSub('tables')} />
          </div>
          {sub === 'draw' ? <DrawPanel onClose={close} /> : null}
          {sub === 'shapes' ? <ShapesPanel onClose={close} /> : null}
          {sub === 'line' ? <LinePanel onClose={close} /> : null}
          {sub === 'sticky' ? <StickyPanel onClose={close} /> : null}
          {sub === 'tables' ? <TablesPanel onClose={close} /> : null}
        </div>
      </Popover>
    </>
  )
}
