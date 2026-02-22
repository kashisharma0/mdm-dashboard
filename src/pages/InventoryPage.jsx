import { useState, useMemo, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { DEVICES, REGIONS, VERSIONS, STATUSES, REGION_DATA } from '../data/mockData'
import { StatusBadge, SkeletonTable, EmptyState } from '../components/UI'
import DevicePanel from '../components/DevicePanel'
import styles from './InventoryPage.module.css'

const PAGE_SIZE = 10

// ── KPI CARDS ─────────────────────────────────────────────────────────────────
function KPICards() {
  const total   = DEVICES.length
  const latest  = DEVICES.filter((d) => d.version === '4.2.1').length
  const outdated = DEVICES.filter((d) => d.version !== '4.2.1').length
  const inactive = DEVICES.filter((d) => d.daysAgo > 7).length
  const failed  = DEVICES.filter((d) => d.status === 'Failed').length

  const cards = [
    { label: 'Total Devices',    value: total,   sub: 'Registered fleet',                          color: 'blue' },
    { label: 'On Latest v4.2.1', value: latest,  sub: `${((latest/total)*100).toFixed(1)}% · ${outdated} outdated`, color: 'green' },
    { label: 'Inactive >7 days', value: inactive, sub: 'Not seen in >7 days ⚠',                    color: 'amber' },
    { label: 'Failed / Retry',   value: failed,  sub: 'Updates pending retry ↻',                   color: 'red' },
  ]

  return (
    <div className={styles.kpiGrid}>
      {cards.map((c) => (
        <div key={c.label} className={`${styles.kpiCard} ${styles[`kpi_${c.color}`]}`}>
          <div className={styles.kpiLabel}>{c.label}</div>
          <div className={styles.kpiValue}>{c.value.toLocaleString()}</div>
          <div className={styles.kpiSub}>{c.sub}</div>
        </div>
      ))}
    </div>
  )
}

// ── REGION CHART ──────────────────────────────────────────────────────────────
function RegionChart({ onFilter, activeFilter }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>
        Version Distribution by Region
        {activeFilter && (
          <button className={styles.clearFilter} onClick={() => onFilter(null)}>
            ✕ Clear filter
          </button>
        )}
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={REGION_DATA} onClick={(e) => e?.activeLabel && onFilter(
          activeFilter === e.activeLabel ? null : e.activeLabel
        )}>
          <XAxis dataKey="shortName" tick={{ fill: 'var(--text3)', fontSize: 10, fontFamily: 'var(--mono)' }} />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 6, fontSize: 11 }}
            labelStyle={{ color: 'var(--text)', fontFamily: 'var(--mono)' }}
            itemStyle={{ color: 'var(--text2)' }}
          />
          <Bar dataKey="v421" name="v4.2.1" fill="var(--accent)" radius={[2,2,0,0]}>
            {REGION_DATA.map((r) => (
              <Cell key={r.name} opacity={activeFilter && activeFilter !== r.name ? 0.3 : 1} />
            ))}
          </Bar>
          <Bar dataKey="v419" name="v4.1.9" fill="var(--green)" radius={[2,2,0,0]}>
            {REGION_DATA.map((r) => (
              <Cell key={r.name} opacity={activeFilter && activeFilter !== r.name ? 0.3 : 1} />
            ))}
          </Bar>
          <Bar dataKey="v407" name="v4.0.7" fill="var(--amber)" radius={[2,2,0,0]}>
            {REGION_DATA.map((r) => (
              <Cell key={r.name} opacity={activeFilter && activeFilter !== r.name ? 0.3 : 1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className={styles.legend}>
        {[['var(--accent)','v4.2.1 (Latest)'],['var(--green)','v4.1.9'],['var(--amber)','v4.0.7']].map(([c,l])=>(
          <div key={l} className={styles.legendItem}>
            <div className={styles.legendDot} style={{background:c}}/>
            {l}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── FLEET HEALTH ──────────────────────────────────────────────────────────────
function FleetHealth() {
  const total = DEVICES.length
  const items = [
    { label: 'Up-to-date', color: 'var(--green)', count: DEVICES.filter(d=>d.status==='Up-to-date').length },
    { label: 'Outdated',   color: 'var(--amber)', count: DEVICES.filter(d=>d.status==='Outdated').length },
    { label: 'Failed',     color: 'var(--red)',   count: DEVICES.filter(d=>d.status==='Failed').length },
    { label: 'Inactive',   color: 'var(--grey)',  count: DEVICES.filter(d=>d.status==='Inactive').length },
  ]
  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>Fleet Health</div>
      {items.map(({ label, color, count }) => {
        const pct = ((count / total) * 100).toFixed(1)
        return (
          <div key={label} className={styles.healthRow}>
            <div className={styles.healthMeta}>
              <span className={styles.healthLabel}>{label}</span>
              <span className={styles.healthCount} style={{ color }}>{count} <span className={styles.healthPct}>({pct}%)</span></span>
            </div>
            <div className={styles.healthBarTrack}>
              <div className={styles.healthBarFill} style={{ width: `${pct}%`, background: color }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── DEVICE TABLE ──────────────────────────────────────────────────────────────
const COLUMNS = ['id','version','os','region','lastSeen','status']

function DeviceTable({ onSelect, regionFilter }) {
  const [search, setSearch]           = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterRegion, setFilterRegion] = useState('')
  const [filterVersion, setFilterVersion] = useState('')
  const [sort, setSort]               = useState({ col: 'lastSeen', dir: -1 })
  const [page, setPage]               = useState(0)
  const [loading, setLoading]         = useState(true)

  // Simulate loading
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  // Region from chart click overrides dropdown
  const effectiveRegion = regionFilter || filterRegion

  const filtered = useMemo(() => {
    return DEVICES
      .filter((d) => {
        if (search && !d.id.toLowerCase().includes(search.toLowerCase()) &&
            !d.model.toLowerCase().includes(search.toLowerCase()) &&
            !d.region.toLowerCase().includes(search.toLowerCase())) return false
        if (filterStatus && d.status !== filterStatus) return false
        if (effectiveRegion && d.region !== effectiveRegion) return false
        if (filterVersion && d.version !== filterVersion) return false
        return true
      })
      .sort((a, b) => {
        const [va, vb] = [a[sort.col], b[sort.col]]
        return sort.dir * (va < vb ? -1 : va > vb ? 1 : 0)
      })
  }, [search, filterStatus, effectiveRegion, filterVersion, sort])

  const paged      = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  const toggleSort = (col) =>
    setSort((s) => s.col === col ? { col, dir: -s.dir } : { col, dir: 1 })

  const SortIcon = ({ col }) =>
    sort.col === col
      ? <span>{sort.dir > 0 ? '↑' : '↓'}</span>
      : <span style={{ opacity: 0.2 }}>↕</span>

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>
        Device Inventory
        <span className={styles.countBadge}>{filtered.length} devices</span>
      </div>

      {/* Filters */}
      <div className={styles.filterBar}>
        <input
          className={styles.searchBox}
          placeholder="Search device ID, model, region…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          aria-label="Search devices"
        />
        <select className={styles.filterSelect} value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(0) }} aria-label="Filter by status">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className={styles.filterSelect} value={effectiveRegion} onChange={(e) => { setFilterRegion(e.target.value); setPage(0) }} aria-label="Filter by region">
          <option value="">All Regions</option>
          {REGIONS.map((r) => <option key={r}>{r}</option>)}
        </select>
        <select className={styles.filterSelect} value={filterVersion} onChange={(e) => { setFilterVersion(e.target.value); setPage(0) }} aria-label="Filter by version">
          <option value="">All Versions</option>
          {VERSIONS.map((v) => <option key={v}>{v}</option>)}
        </select>
      </div>

      {loading ? (
        <SkeletonTable rows={5} />
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {COLUMNS.map((col) => (
                    <th key={col} onClick={() => toggleSort(col)} className={styles.th}>
                      {col.toUpperCase()} <SortIcon col={col} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState message="No devices match the current filters" />
                    </td>
                  </tr>
                ) : (
                  paged.map((d) => (
                    <tr key={d.id} onClick={() => onSelect(d)} className={styles.tr} role="button" tabIndex={0}>
                      <td className={`${styles.td} ${styles.imei}`}>{d.id}</td>
                      <td className={styles.td}>{d.version}</td>
                      <td className={styles.td}>{d.os}</td>
                      <td className={styles.td}>{d.region}</td>
                      <td className={styles.td}>{d.lastSeen}</td>
                      <td className={styles.td}><StatusBadge status={d.status} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className={styles.pagination}>
            <button className={styles.pgBtn} disabled={page === 0} onClick={() => setPage((p) => p - 1)}>← Prev</button>
            <span className={styles.pgInfo}>Page {page + 1} of {Math.max(1, totalPages)}</span>
            <button className={styles.pgBtn} disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next →</button>
          </div>
        </>
      )}
    </div>
  )
}

// ── INVENTORY PAGE ────────────────────────────────────────────────────────────
export default function InventoryPage() {
  const [regionFilter, setRegionFilter]   = useState(null)
  const [selectedDevice, setSelectedDevice] = useState(null)

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Device Inventory</h1>
        <p className={styles.pageSub}>Real-time fleet overview across all regions</p>
      </div>

      <KPICards />

      <div className={styles.twoCol}>
        <RegionChart onFilter={setRegionFilter} activeFilter={regionFilter} />
        <FleetHealth />
      </div>

      <DeviceTable onSelect={setSelectedDevice} regionFilter={regionFilter} />

      {selectedDevice && (
        <DevicePanel device={selectedDevice} onClose={() => setSelectedDevice(null)} />
      )}
    </div>
  )
}
