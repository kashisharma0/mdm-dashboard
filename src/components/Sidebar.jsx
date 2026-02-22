import { useRole } from '../context/RoleContext'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  { id: 'inventory', label: 'Device Inventory', icon: '📱', section: 'Overview' },
  { id: 'schedule',  label: 'Update Scheduling', icon: '🗓', section: 'Management' },
  { id: 'audit',     label: 'Audit Log',          icon: '🔒', section: 'Management' },
]

const ROLE_LABELS = {
  admin:   { label: '● Full Access',  className: 'roleAdmin' },
  ops:     { label: '● Ops Access',   className: 'roleOps' },
  analyst: { label: '● Read Only',    className: 'roleAnalyst' },
}

export default function Sidebar({ activePage, onNavigate }) {
  const { role, setRole } = useRole()
  const sections = [...new Set(NAV_ITEMS.map((n) => n.section))]
  const roleInfo = ROLE_LABELS[role]

  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.brandTag}>MoveInSync</div>
        <div className={styles.brandName}>MDM Operations</div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {sections.map((section) => (
          <div key={section}>
            <div className={styles.navSection}>{section}</div>
            {NAV_ITEMS.filter((n) => n.section === section).map((item) => (
              <button
                key={item.id}
                className={`${styles.navItem} ${activePage === item.id ? styles.navItemActive : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Role Switcher */}
      <div className={styles.roleSection}>
        <div className={styles.roleLabel}>Active Role</div>
        <select
          className={styles.roleSelect}
          value={role}
          onChange={(e) => setRole(e.target.value)}
          aria-label="Switch role"
        >
          <option value="admin">Admin / Product Head</option>
          <option value="ops">Ops</option>
          <option value="analyst">Read-only Analyst</option>
        </select>
        <div className={`${styles.roleBadge} ${styles[roleInfo.className]}`}>
          {roleInfo.label}
        </div>
      </div>
    </aside>
  )
}
