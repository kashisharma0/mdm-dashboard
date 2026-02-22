import { useRole } from '../context/RoleContext'
import { AUDIT_LOGS } from '../data/mockData'
import styles from './AuditPage.module.css'

export default function AuditPage() {
  const { perms } = useRole()

  if (!perms.viewAudit) {
    return (
      <div className={styles.page}>
        <div className={styles.denied}>
          <div className={styles.deniedIcon}>🔒</div>
          <div className={styles.deniedTitle}>Access Denied</div>
          <div className={styles.deniedSub}>Audit log is only visible to Admin role.</div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Audit & Admin</h1>
        <p className={styles.pageSub}>System-level access logs — Admin only</p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>
          System Audit Log
          <span className={styles.adminTag}>🔒 ADMIN ONLY</span>
        </div>
        <div className={styles.logList}>
          {AUDIT_LOGS.map((log, i) => (
            <div key={i} className={styles.logRow}>
              <div className={styles.logTime}>{log.time}</div>
              <div className={styles.logAction}>{log.action}</div>
              <div className={styles.logUser}>{log.user}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
