import styles from './UI.module.css'

// ── STATUS BADGE ──────────────────────────────────────────────────────────────
const STATUS_CLASS = {
  'Up-to-date': styles.statusGreen,
  Outdated: styles.statusAmber,
  Failed: styles.statusRed,
  Inactive: styles.statusGrey,
}

export function StatusBadge({ status }) {
  return (
    <span className={`${styles.badge} ${STATUS_CLASS[status] || styles.statusGrey}`}>
      {status}
    </span>
  )
}

// ── BUTTON WITH TOOLTIP (for disabled RBAC buttons) ───────────────────────────
export function TooltipButton({ children, tooltip, disabled, className, onClick, style }) {
  return (
    <div className={styles.tooltipWrap} style={style}>
      <button
        className={`${styles.btn} ${className || ''}`}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </button>
      {disabled && tooltip && (
        <div className={styles.tooltip}>{tooltip}</div>
      )}
    </div>
  )
}

// ── SKELETON LOADER ───────────────────────────────────────────────────────────
export function SkeletonTable({ rows = 5 }) {
  return (
    <div style={{ padding: '10px 0' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={styles.skeleton} style={{ height: 36, marginBottom: 8 }} />
      ))}
    </div>
  )
}

// ── CONFIRM MODAL ─────────────────────────────────────────────────────────────
export function ConfirmModal({ title, body, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <div className={styles.modalTitle}>{title}</div>
        <div className={styles.modalBody}>{body}</div>
        <div className={styles.modalActions}>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`${styles.btn} ${danger ? styles.btnDanger : styles.btnWarn}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── EMPTY STATE ───────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', message = 'No data found' }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{icon}</div>
      <div className={styles.emptyText}>{message}</div>
    </div>
  )
}
