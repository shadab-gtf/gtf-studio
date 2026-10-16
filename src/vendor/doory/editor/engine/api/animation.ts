/**
 * Animation commands on the objects of the active page: set a preset, change its settings, move it in time, remove
 * it, animate the whole page in one style. Like every command they act on the selection (or on the ids given), skip
 * what cannot be animated, record one undo step and do nothing in a read-only editor.
 *
 * The edit goes onto the live objects (the `animation` property is part of `EXTRA_PROPS`, so the page is written back
 * with it); no object is rebuilt and the real-time layer sees one property of each object change.
 * Page transitions are `pages.setTransition` / `pages.setTransitionAll`.
 */
import { Point, type FabricObject } from 'fabric'
import type { Anim, DocObject, ObjectAnimation } from '@/vendor/doory/types/document'
import { type AnimSlot } from '../../animation/model'
import { readAnimation, withPatch, withPreset, withoutSlot } from '../../animation/ops'
import { pageStyleById, stylePageObjects } from '../../animation/pageStyles'
import { inOutPresets, emphasisPresets } from '../../animation/presets'
import { type Box, type PageDims, type Sample, sampleObject } from '../../animation/sampler'
import { animationStrings as a } from '../../animation/strings'
import type { EditorEngine } from '../editor'
import { asDory } from '../objects/dory'

/** What the Animate panel hovers to preview, live, on the real selection (or page) without committing. */
export type AnimPreview = { kind: 'anim'; slot: AnimSlot; anim: Anim } | { kind: 'page-style'; styleId: string }

/** Everything needed to play a preview on one live object and put it back exactly as it was. */
interface PreviewSnapshot {
  object: FabricObject
  id: string
  animation: ObjectAnimation
  center: Point
  box: Box
  base: {
    left: number
    top: number
    scaleX: number
    scaleY: number
    angle: number
    skewX: number
    skewY: number
    opacity: number
    visible: boolean
    hasControls: boolean
    hasBorders: boolean
  }
}

/** How long the preview runs before it rests and loops again (page clock ms). */
const animEnd = (anim?: Anim): number => (anim ? anim.delayMs + anim.durationMs : 0)
const spanOf = (anim: ObjectAnimation): number => Math.max(1, animEnd(anim.enter), animEnd(anim.exit), animEnd(anim.emphasis))
const PREVIEW_HOLD_MS = 520

/** Puts one sampled frame onto a live object, about its resting centre. Blur and text-splitting are left to the card. */
function applyPreviewSample(s: PreviewSnapshot, sample: Readonly<Sample>): void {
  const o = s.object
  if (!sample.visible) {
    o.set({ visible: false })
    return
  }
  o.set({
    visible: s.base.visible,
    opacity: s.base.opacity * sample.opacity,
    scaleX: s.base.scaleX * sample.scaleX,
    scaleY: s.base.scaleY * sample.scaleY,
    angle: s.base.angle + sample.rotate,
    skewX: s.base.skewX + sample.skewX,
    skewY: s.base.skewY + sample.skewY,
  })
  o.setPositionByOrigin(new Point(s.center.x + sample.tx, s.center.y + sample.ty), 'center', 'center')
  o.setCoords()
}

export class AnimationApi {
  constructor(private readonly engine: EditorEngine) {}

  private previewRaf = 0
  private previewSnaps: PreviewSnapshot[] | null = null

  /** The live objects an edit reaches: the ids given, or the selection. Objects the editor cannot rebuild are left out. */
  private targets(ids?: readonly string[]): FabricObject[] {
    const view = this.engine.activeView()
    if (!view || this.engine.readOnly) return []
    const objects = ids ? ids.map((id) => view.getById(id)) : view.selectedObjects()
    return objects.filter((o): o is FabricObject => !!o && !asDory(o).rawDoc && !asDory(o).isUi)
  }

  private page() {
    return this.engine.getPage(this.engine.state.activePageId)
  }

  /** Applies `change` to the animation of each object; one undo step when anything changed. Returns how many objects changed. */
  private update(
    objects: readonly FabricObject[],
    change: (current: ObjectAnimation | undefined, object: FabricObject) => ObjectAnimation | undefined | null,
    label: string,
    coalesceKey?: string,
  ): number {
    let changed = 0
    for (const object of objects) {
      const current = readAnimation(asDory(object).animation)
      const next = change(current, object)
      if (next === null || next === current) continue
      if (JSON.stringify(next ?? null) === JSON.stringify(current ?? null)) continue
      asDory(object).animation = next
      object.set('dirty', true)
      changed++
    }
    if (changed > 0) this.engine.commitActive({ label, coalesceKey })
    return changed
  }

  /** The animation of an object on the active page as the editor understands it. */
  get(id: string): ObjectAnimation | undefined {
    return readAnimation(this.page()?.objects.find((o) => o.id === id)?.animation)
  }

  /** Puts a preset into `slot` of the selected objects (or of `ids`), keeping delay, strength and text unit when they still fit. */
  setPreset(slot: AnimSlot, presetId: string, ids?: readonly string[]): void {
    const page = this.page()
    const preset = slot === 'emphasis' ? emphasisPresets.get(presetId) : inOutPresets.get(presetId)
    if (!page || !preset) return
    const targets = this.targets(ids)
    const had = targets.some((o) => readAnimation(asDory(o).animation)?.[slot] !== undefined)
    const label = had ? a.history.change : slot === 'enter' ? a.history.addEnter : slot === 'exit' ? a.history.addExit : a.history.addEmphasis
    const changed = this.update(targets, (current) => withPreset(current, slot, presetId, page), label)
    if (changed > 0) this.engine.announce(a.announce.added(preset.label))
  }

  /**
   * Changes settings of `slot`. `coalesceKey` joins the steps of one slider drag or one bar drag into a single undo
   * step; a value of `undefined` removes that setting.
   */
  patch(slot: AnimSlot, patch: Partial<Anim>, ids?: readonly string[], coalesceKey?: string): void {
    this.update(this.targets(ids), (current) => withPatch(current, slot, patch), a.history.timing, coalesceKey ?? `anim:${slot}`)
  }

  remove(slot: AnimSlot, ids?: readonly string[]): void {
    if (this.update(this.targets(ids), (current) => withoutSlot(current, slot), a.history.remove) > 0) this.engine.announce(a.announce.removed)
  }

  /** Removes every animation of the selected objects (or of `ids`). */
  removeAll(ids?: readonly string[]): void {
    if (this.update(this.targets(ids), (current) => (current ? undefined : current), a.history.remove) > 0) this.engine.announce(a.announce.removed)
  }

  /**
   * Animates the active page in one style: every object that can be animated gets the style's enter animation, one
   * after another in reading order. Exit and emphasis animations stay.
   */
  applyPageStyle(styleId: string): void {
    const page = this.page()
    const style = pageStyleById(styleId)
    const view = this.engine.activeView()
    if (!page || !style || !view || this.engine.readOnly) return
    const anims = stylePageObjects(page.objects, style)
    const objects = view.canvas.getObjects().filter((o) => !asDory(o).rawDoc && anims.has(asDory(o).id ?? ''))
    const changed = this.update(objects, (current, object) => ({ ...current, enter: anims.get(asDory(object).id ?? '') }), a.history.pageStyle)
    if (changed > 0) this.engine.announce(a.announce.pageStyled(changed))
  }

  /** Removes the animation of every object on the active page. */
  clearPage(): void {
    const view = this.engine.activeView()
    if (!view) return
    const objects = view.canvas.getObjects().filter((o) => !asDory(o).rawDoc && !asDory(o).isUi && asDory(o).animation !== undefined)
    if (this.update(objects, (current) => (current ? undefined : current), a.history.clearPage) > 0) this.engine.announce(a.announce.pageCleared)
  }

  /**
   * Plays a preset (or a page style) on the live selection — or on the whole page — as a loop, so hovering a card in
   * the Animate panel shows the motion on the real design. It writes only onto the live Fabric objects (no history, no
   * document change, nothing serialized), hides their selection handles while it runs, and `endPreview` puts them back
   * exactly as they were. Each call replaces the previous preview. The caller gates this on reduced-motion.
   */
  preview(subject: AnimPreview): void {
    this.endPreview()
    const view = this.engine.activeView()
    const page = this.page()
    if (!view || !page || this.engine.readOnly) return
    const dims: PageDims = this.engine.pageSizeOf(this.engine.state.activePageId)

    const entries: { object: FabricObject; animation: ObjectAnimation }[] = []
    if (subject.kind === 'anim') {
      const preset = subject.slot === 'emphasis' ? emphasisPresets.get(subject.anim.preset) : inOutPresets.get(subject.anim.preset)
      if (!preset) return
      const animation: ObjectAnimation = {}
      animation[subject.slot] = { ...subject.anim, delayMs: 0 }
      for (const object of this.targets()) entries.push({ object, animation })
    } else {
      const style = pageStyleById(subject.styleId)
      if (!style) return
      const anims = stylePageObjects(page.objects, style)
      for (const object of view.canvas.getObjects()) {
        const enter = anims.get(asDory(object).id ?? '')
        if (enter && !asDory(object).rawDoc && !asDory(object).isUi) entries.push({ object, animation: { enter } })
      }
    }
    if (entries.length === 0) return

    const snaps: PreviewSnapshot[] = entries.map(({ object, animation }) => {
      const center = object.getCenterPoint()
      return {
        object,
        animation,
        id: asDory(object).id ?? 'preview',
        center,
        box: { cx: center.x, cy: center.y, w: object.getScaledWidth(), h: object.getScaledHeight(), angle: object.angle ?? 0 },
        base: {
          left: object.left ?? 0,
          top: object.top ?? 0,
          scaleX: object.scaleX ?? 1,
          scaleY: object.scaleY ?? 1,
          angle: object.angle ?? 0,
          skewX: object.skewX ?? 0,
          skewY: object.skewY ?? 0,
          opacity: object.opacity ?? 1,
          visible: object.visible !== false,
          hasControls: object.hasControls !== false,
          hasBorders: object.hasBorders !== false,
        },
      }
    })
    for (const s of snaps) s.object.set({ hasControls: false, hasBorders: false })
    this.previewSnaps = snaps

    const span = Math.max(1, ...snaps.map((s) => spanOf(s.animation)))
    const canvas = view.canvas
    const start = performance.now()
    const tick = (now: number): void => {
      if (this.previewSnaps !== snaps) return
      const elapsed = (now - start) % (span + PREVIEW_HOLD_MS)
      const tMs = Math.min(elapsed, span)
      for (const s of snaps) applyPreviewSample(s, sampleObject({ id: s.id, animation: s.animation } as unknown as DocObject, tMs, dims, s.box))
      canvas.requestRenderAll()
      this.previewRaf = requestAnimationFrame(tick)
    }
    this.previewRaf = requestAnimationFrame(tick)
  }

  /** Ends a running preview and restores the objects. Safe to call when none is running. */
  endPreview(): void {
    if (this.previewRaf) {
      cancelAnimationFrame(this.previewRaf)
      this.previewRaf = 0
    }
    const snaps = this.previewSnaps
    if (!snaps) return
    this.previewSnaps = null
    for (const s of snaps) {
      s.object.set({
        left: s.base.left,
        top: s.base.top,
        scaleX: s.base.scaleX,
        scaleY: s.base.scaleY,
        angle: s.base.angle,
        skewX: s.base.skewX,
        skewY: s.base.skewY,
        opacity: s.base.opacity,
        visible: s.base.visible,
        hasControls: s.base.hasControls,
        hasBorders: s.base.hasBorders,
      })
      s.object.setCoords()
    }
    this.engine.activeView()?.canvas.requestRenderAll()
  }
}

