import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react'
import { Sparkles } from '@/features/studio/icons'
import { useEditor, useEditorState } from '../context'
import { useOpenTool } from '../chrome/ChromeContext'
import { t } from '../strings'
import { Toolbar } from '../ui/Toolbar'
import { Tooltip } from '../ui/Tooltip'
import { toolbarSections } from './registry'
import styles from './FloatingToolbar.module.css'

/** Gap above the selection box, plus clearance so the bar never sits on the top resize handles. */
const GAP = 12
const CLEAR = 26
/** Keep the bar below the editor's top chrome (top bar + the docked contextual strip). */
const MIN_TOP = 118

/**
 * A Canva-style quick-action bar that floats just above the selected element (or the whole active selection) and
 * follows it as it is moved, scaled or the page is scrolled/zoomed. It shows the same contextual sections as the
 * docked strip plus an Animate shortcut, right where the eye is. It is a pure overlay: it never shifts the page.
 */
export function FloatingToolbar() {
  const editor = useEditor()
  const sections = useSyncExternalStore(toolbarSections.subscribe, toolbarSections.getSnapshot)
  const state = useEditorState((s) => s)
  const selection = state.selection
  const barRef = useRef<HTMLDivElement>(null)
  const { openId, toggle } = useOpenTool()

  const active = selection.ids.length > 0 && !state.ui.cropping && !state.readOnly

  /** Positions the bar over the live selection. Done on the DOM node so scroll/drag never trigger a React render. */
  const place = useCallback(() => {
    const bar = barRef.current
    if (!bar) return
    const obj = editor.activeView()?.canvas.getActiveObject()
    const pr = editor.view.pageRect(editor.state.activePageId)
    if (!obj || !pr) {
      bar.style.visibility = 'hidden'
      return
    }
    // Stay inside the workspace: never under the tool rail or an open side panel.
    const doc = bar.ownerDocument
    let leftBound = 8
    for (const sel of ['[data-testid="ed-tool-rail"]', '[data-testid^="sidebar-"]']) {
      const el = doc.querySelector(sel)
      if (el) leftBound = Math.max(leftBound, el.getBoundingClientRect().right)
    }
    leftBound += 8
    const avail = window.innerWidth - leftBound - 8
    bar.style.maxWidth = `${Math.max(240, avail)}px`

    const r = obj.getBoundingRect()
    const left = pr.left + r.left * pr.zoom
    const top = pr.top + r.top * pr.zoom
    const width = r.width * pr.zoom
    const bw = bar.offsetWidth
    const bh = bar.offsetHeight
    let x = left + width / 2 - bw / 2
    let y = top - GAP - CLEAR - bh
    x = Math.max(leftBound, Math.min(x, window.innerWidth - bw - 8))
    y = Math.max(MIN_TOP, Math.min(y, window.innerHeight - bh - 8))
    bar.style.left = `${Math.round(x)}px`
    bar.style.top = `${Math.round(y)}px`
    bar.style.visibility = 'visible'
  }, [editor])

  // Reposition when the selection changes (refreshSelection bumps `version`, including on live drag/scale), on zoom,
  // or when a side panel opens/closes (which moves the workspace's left edge).
  useLayoutEffect(() => {
    if (active) place()
  }, [active, place, selection.version, state.zoom, openId])

  // Follow the artboard as the workspace scrolls or the window resizes.
  useEffect(() => {
    if (!active) return
    const onMove = (): void => place()
    window.addEventListener('scroll', onMove, true)
    window.addEventListener('resize', onMove)
    return () => {
      window.removeEventListener('scroll', onMove, true)
      window.removeEventListener('resize', onMove)
    }
  }, [active, place])

  if (!active) return null
  const shown = sections.filter((s) => s.id !== 'page' && s.appliesTo(selection, state))
  const animateOpen = openId === 'animate'
  return (
    <div ref={barRef} className={styles.bar} style={{ visibility: 'hidden' }} data-testid="ed-floating-toolbar">
      <Toolbar label={t.toolbar.label} className={styles.row}>
        {shown.map((section, i) => {
          const Component = section.component
          return (
            <Fragment key={section.id}>
              {i > 0 ? <span className={styles.divider} role="separator" aria-orientation="vertical" /> : null}
              <Component />
            </Fragment>
          )
        })}
        <span className={styles.divider} role="separator" aria-orientation="vertical" />
        <Tooltip label={t.rail.animate}>
          <button
            type="button"
            className={`${styles.animate} ${animateOpen ? styles.animateOn : ''}`}
            aria-label={t.rail.animate}
            aria-pressed={animateOpen}
            data-testid="ed-floating-animate"
            onClick={() => {
              if (!animateOpen) toggle('animate')
            }}
          >
            <Sparkles size={16} aria-hidden="true" />
            <span>{t.rail.animate}</span>
          </button>
        </Tooltip>
      </Toolbar>
    </div>
  )
}
