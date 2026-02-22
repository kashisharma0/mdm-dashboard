import styles from './Timeline.module.css'

/**
 * Timeline — generic reusable component.
 * Used in: DevicePanel (MDM), and can be reused in Vehicle Tracking module.
 *
 * Props:
 *   groups: Array<{
 *     title: string,
 *     steps: Array<{
 *       stage: string,
 *       time: string | null,
 *       status: 'done' | 'failed' | 'pending',
 *       error?: string
 *     }>
 *   }>
 */
export default function Timeline({ groups }) {
  return (
    <div className={styles.timeline}>
      {groups.map((group, gi) => (
        <div key={gi} className={styles.group}>
          <div className={styles.groupTitle}>{group.title}</div>
          <div className={styles.steps}>
            {group.steps.map((step, si) => (
              <div key={si} className={styles.item}>
                <div className={`${styles.dot} ${styles[`dot_${step.status}`]}`}>
                  {step.status === 'done' ? '✓' : step.status === 'failed' ? '✗' : '○'}
                </div>
                <div className={styles.content}>
                  <div className={styles.stage}>{step.stage}</div>
                  <div className={styles.time}>{step.time || '—'}</div>
                  {step.error && (
                    <div className={styles.error}>⚠ {step.error}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
