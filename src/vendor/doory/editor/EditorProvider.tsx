import type { ReactNode } from 'react'
import { EngineContext, PortalContext } from './context'
import type { EditorEngine } from './engine/editor'

/** Provides the editor engine and its portal root. */
export function EditorProvider({ engine, portalRoot, children }: { engine: EditorEngine; portalRoot: HTMLElement | null; children: ReactNode }) {
  return (
    <EngineContext.Provider value={engine}>
      <PortalContext.Provider value={portalRoot}>
        {children}
      </PortalContext.Provider>
    </EngineContext.Provider>
  )
}
