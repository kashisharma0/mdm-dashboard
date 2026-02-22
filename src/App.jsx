import { useState, useEffect } from 'react'
import { RoleProvider } from './context/RoleContext'
import Sidebar from './components/Sidebar'
import InventoryPage from './pages/InventoryPage'
import SchedulePage from './pages/SchedulePage'
import AuditPage from './pages/AuditPage'
import styles from './App.module.css'

function Shell() {
  const [page, setPage] = useState('inventory')
  const [time, setTime] = useState(new Date().toLocaleTimeString())

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000)
    return () => clearInterval(t)
  }, [])

  const PAGE_TITLES = {
    inventory: 'DEVICE INVENTORY',
    schedule:  'UPDATE MANAGEMENT',
    audit:     'AUDIT & ADMIN',
  }

  return (
    <div className={styles.shell}>
      <Sidebar activePage={page} onNavigate={setPage} />
      <div className={styles.main}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <div className={styles.pageTitle}>// {PAGE_TITLES[page]}</div>
          <div className={styles.topbarRight}>
            <div className={styles.liveDot}>LIVE</div>
            <div className={styles.timestamp}>{time}</div>
          </div>
        </header>

        {/* Page content */}
        <main className={styles.content}>
          {page === 'inventory' && <InventoryPage />}
          {page === 'schedule'  && <SchedulePage />}
          {page === 'audit'     && <AuditPage />}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <RoleProvider>
      <Shell />
    </RoleProvider>
  )
}
