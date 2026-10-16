import { AlertTriangle, Check, CloudOff, Loader2, Eye } from '@/features/studio/icons'
import { useEditor, useEditorState } from './context'
import { t } from './strings'
import styles from './SaveStatus.module.css'

/** Reports the result of local persistence, including retryable errors. */
export function SaveStatus() {
  const editor = useEditor()
  const save = useEditorState((s) => s.save)
  const readOnly = useEditorState((s) => s.readOnly)
  const guest = useEditorState((s) => s.mode === 'guest')
  if (readOnly) {
    return (
      <span className={`${styles.pill} ${styles.neutral}`} role="status">
        <Eye size={14} />
        <span className={styles.text}>{t.save.readOnly}</span>
      </span>
    )
  }
  switch (save.status) {
    case 'saving':
      return (
        <span className={`${styles.pill} ${styles.neutral}`} role="status">
          <Loader2 size={14} className={styles.spin} />
          <span className={styles.text}>{t.save.saving}</span>
        </span>
      )
    case 'dirty':
      return (
        <span className={`${styles.pill} ${styles.neutral}`} role="status">
          <span className={styles.dot} />
          <span className={styles.text}>{t.save.unsaved}</span>
        </span>
      )
    case 'conflict':
      return (
        <span className={`${styles.pill} ${styles.warn}`} role="status">
          <AlertTriangle size={14} />
          <span className={styles.text}>{t.save.conflict}</span>
        </span>
      )
    case 'error':
      return (
        <span className={`${styles.pill} ${styles.error}`} role="alert" title={save.message}>
          <CloudOff size={14} />
          <span className={styles.text}>{t.save.error}</span>
          <button type="button" className={styles.retry} onClick={() => void editor.persistence.saveNow()}>
            {t.save.retry}
          </button>
        </span>
      )
    case 'local':
      return (
        <span className={`${styles.pill} ${styles.ok}`} role="status" title={t.save.localHint}>
          <Check size={14} />
          <span className={styles.text}>{t.save.local}</span>
        </span>
      )
    case 'saved':
      return (
        <span className={`${styles.pill} ${styles.ok}`} role="status">
          <Check size={14} />
          <span className={styles.text}>{t.save.saved}</span>
        </span>
      )
    default:
      return (
        <span className={`${styles.pill} ${styles.ok}`} role="status" title={guest ? t.save.localHint : undefined}>
          <Check size={14} />
          <span className={styles.text}>{guest ? t.save.local : t.save.saved}</span>
        </span>
      )
  }
}
