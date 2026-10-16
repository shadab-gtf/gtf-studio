/**
 * Freehand drawing (the Tools flyout's Draw and Signature tools). Turns the active page's canvas into a drawing
 * surface with a pencil brush; every finished stroke is configured as a normal object (so it is selectable, saved and
 * one undo step) and the editor stays in drawing mode for the next stroke until `stop` (or Escape) leaves it.
 */
import { PencilBrush, type FabricObject } from 'fabric'
import { type FillSpec, buildFill, sortStops } from '../objects/fills'
import type { EditorEngine } from '../editor'

export interface DrawOptions {
  /** Stroke paint: a solid colour or a linear/radial gradient. */
  fill: FillSpec
  /** Stroke width in page px. */
  width: number
  /** 0..1. */
  opacity: number
}

/** `#rrggbb` + opacity → an `rgba()` string the brush understands. */
function withAlpha(color: string, opacity: number): string {
  const a = Math.max(0, Math.min(1, opacity))
  const m = /^#([0-9a-f]{6})$/i.exec(color.trim())
  if (!m) return color
  const n = parseInt(m[1], 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

/** A representative solid colour of a fill, for the live brush while a gradient stroke is being drawn. */
function reprColor(fill: FillSpec): string {
  return fill.type === 'solid' ? fill.color : (sortStops(fill.stops)[0]?.color ?? '#1f2430')
}

export class DrawApi {
  constructor(private readonly engine: EditorEngine) {}

  private teardown: (() => void) | null = null
  private current: DrawOptions | null = null

  get active(): boolean {
    return this.teardown !== null
  }

  get options(): DrawOptions | null {
    return this.current
  }

  /** Enters freehand drawing on the active page with the given brush. Re-calling replaces the brush, keeping the mode. */
  start(opts: DrawOptions): void {
    if (this.engine.readOnly) return
    const view = this.engine.activeView()
    if (!view) return
    const canvas = view.canvas
    const brush = new PencilBrush(canvas)
    brush.width = Math.max(1, opts.width)
    brush.color = withAlpha(reprColor(opts.fill), opts.opacity)
    canvas.freeDrawingBrush = brush
    this.current = opts
    if (this.teardown) return // already drawing: brush swapped above, keep the listeners

    canvas.isDrawingMode = true
    canvas.defaultCursor = 'crosshair'
    canvas.freeDrawingCursor = 'crosshair'

    const onPath = (e: { path?: FabricObject }): void => {
      const path = e.path
      if (!path) return
      // A gradient stroke is applied to the finished path (the brush can only draw one solid colour live).
      const fill = this.current?.fill
      if (fill && fill.type === 'gradient') path.set({ stroke: buildFill(fill), opacity: Math.max(0, Math.min(1, this.current?.opacity ?? 1)) })
      view.configure(path)
      canvas.requestRenderAll()
      this.engine.commit(this.engine.state.activePageId, { label: 'Draw' })
    }
    const onKey = (ev: KeyboardEvent): void => {
      if (ev.key === 'Escape') {
        ev.preventDefault()
        this.stop()
      }
    }
    canvas.on('path:created', onPath)
    window.addEventListener('keydown', onKey, true)
    this.teardown = () => {
      canvas.off('path:created', onPath)
      window.removeEventListener('keydown', onKey, true)
      canvas.isDrawingMode = false
      canvas.defaultCursor = 'default'
    }
  }

  /** Leaves drawing mode and returns the canvas to normal selection. */
  stop(): void {
    if (!this.teardown) return
    this.teardown()
    this.teardown = null
    this.current = null
    this.engine.activeView()?.canvas.requestRenderAll()
  }
}
