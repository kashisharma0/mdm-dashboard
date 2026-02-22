import { DEVICE_TIMELINE } from '../data/mockData'
import { StatusBadge } from './UI'
import Timeline from './Timeline'
import styles from './DevicePanel.module.css'

export default function DevicePanel({ device, onClose }) {
  const compliance =
    device.status === 'Up-to-date' ? 'compliant' :
    device.status === 'Inactive'   ? 'blocked'   : 'outdated'

  const META_FIELDS = [
    ['Model', device.model],
    ['OS Version', device.os],
    ['App Version', device.version],
    ['Region', device.region],
    ['Last Seen', device.lastSeen],
    ['Status', device.status],
  ]

  return (
    // Click outside overlay to close
    <div
      className={styles.overlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label={`Device detail for ${device.id}`}
    >
      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <div className={styles.imei}>{device.id}</div>
            <div className={styles.model}>{device.model}</div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close panel">
            ✕
          </button>
        </div>

        <div className={styles.body}>
          {/* Compliance */}
          <div className={styles.complianceRow}>
            <span className={`${styles.compliancePill} ${styles[`c_${compliance}`]}`}>
              {compliance === 'compliant' ? '✓ Compliant' :
               compliance === 'outdated'  ? '⚠ Outdated'  : '🚫 Blocked'}
            </span>
            <StatusBadge status={device.status} />
          </div>

          {/* Metadata grid */}
          <div className={styles.metaGrid}>
            {META_FIELDS.map(([key, val]) => (
              <div key={key} className={styles.metaItem}>
                <div className={styles.metaKey}>{key}</div>
                <div className={styles.metaVal}>{val}</div>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className={styles.tlLabel}>Update Audit Timeline</div>
          <Timeline groups={DEVICE_TIMELINE} />
        </div>
      </div>
    </div>
  )
}
