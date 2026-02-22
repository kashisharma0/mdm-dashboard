import { useState } from 'react'
import { REGIONS, VERSIONS, DEVICES, ROLLOUTS } from '../data/mockData'
import { useRole } from '../context/RoleContext'
import { TooltipButton, ConfirmModal } from '../components/UI'
import styles from './SchedulePage.module.css'

const STEPS = ['Version', 'Target', 'Rollout', 'Review']
const STAGES = ['scheduled', 'notified', 'downloading', 'installing', 'completed']
const STAGE_COLORS = {
  scheduled: 'var(--text3)', notified: 'var(--accent)',
  downloading: 'var(--amber)', installing: 'var(--green)', completed: 'var(--green)',
}

// ── MULTI-STEP FORM ───────────────────────────────────────────────────────────
function ScheduleForm({ onDone }) {
  const { role, perms } = useRole()
  const [step, setStep]       = useState(0)
  const [errors, setErrors]   = useState({})
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitted, setSubmitted]     = useState(false)
  const [form, setForm] = useState({
    fromV: '4.1.9', toV: '', region: '', group: 'all',
    tag: '', rolloutType: 'immediate', scheduledAt: '', batchPct: 10, batchInterval: 6,
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const matchingDevices = form.region
    ? DEVICES.filter((d) => d.region === form.region).length
    : DEVICES.length

  const validateStep = () => {
    const errs = {}
    if (step === 0) {
      if (!form.toV) errs.toV = 'Please select a target version'
      else if (form.toV <= form.fromV) errs.toV = 'Target version must be newer than source version'
    }
    if (step === 1 && !form.region) errs.region = 'Please select a region'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const next = () => { if (validateStep()) setStep((s) => s + 1) }
  const back = () => { setStep((s) => s - 1); setErrors({}) }

  const handleSubmit = () => {
    if (matchingDevices > 1000 && !perms.approveMandat) {
      setShowConfirm(true)
      return
    }
    setSubmitted(true)
  }

  if (submitted) return (
    <div className={styles.successState}>
      <div className={styles.successIcon}>✅</div>
      <div className={styles.successTitle}>Rollout Scheduled</div>
      <div className={styles.successSub}>v{form.fromV} → v{form.toV} · {form.region || 'All regions'}</div>
      <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onDone}>
        ← Back to Dashboard
      </button>
    </div>
  )

  return (
    <div>
      {showConfirm && (
        <ConfirmModal
          title="⚠️ Mandatory Update – Approval Required"
          body={`This update targets ${matchingDevices.toLocaleString()} devices. Your role (${role}) cannot approve mandatory updates affecting >1,000 devices. An approval request will be sent to Admin.`}
          confirmLabel="Send for Approval"
          onConfirm={() => { setShowConfirm(false); setSubmitted(true) }}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {/* Step indicator */}
      <div className={styles.stepsBar}>
        {STEPS.map((lbl, i) => (
          <div key={i} className={styles.stepItem}>
            <div className={styles.stepCol}>
              <div className={`${styles.stepCircle} ${i < step ? styles.stepDone : i === step ? styles.stepActive : styles.stepPending}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={styles.stepLabel}>{lbl}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`${styles.stepLine} ${i < step ? styles.stepLineDone : ''}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 — Version */}
      {step === 0 && (
        <div className={styles.formCard}>
          <div className={styles.formCardTitle}>Step 1 — Version Selection</div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>From Version</label>
              <select className={styles.formInput} value={form.fromV} onChange={(e) => set('fromV', e.target.value)}>
                {VERSIONS.map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>To Version (Target) *</label>
              <select
                className={`${styles.formInput} ${errors.toV ? styles.formInputError : ''}`}
                value={form.toV}
                onChange={(e) => { set('toV', e.target.value); setErrors({}) }}
              >
                <option value="">Select version…</option>
                {VERSIONS.map((v) => <option key={v}>{v}</option>)}
              </select>
              {errors.toV && <div className={styles.formError}>⚠ {errors.toV}</div>}
              {form.toV && form.toV > form.fromV && (
                <div className={styles.formSuccess}>✓ Compatibility check passed</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2 — Target */}
      {step === 1 && (
        <div className={styles.formCard}>
          <div className={styles.formCardTitle}>Step 2 — Target Selection</div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Region *</label>
            <select
              className={`${styles.formInput} ${errors.region ? styles.formInputError : ''}`}
              value={form.region}
              onChange={(e) => { set('region', e.target.value); setErrors({}) }}
            >
              <option value="">All Regions</option>
              {REGIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
            {errors.region && <div className={styles.formError}>⚠ {errors.region}</div>}
            {form.region && matchingDevices === 0 && (
              <div className={styles.formWarn}>⚠ No devices found in {form.region}</div>
            )}
            {form.region && matchingDevices > 0 && (
              <div className={styles.formSuccess}>→ {matchingDevices} devices will be targeted</div>
            )}
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Device Group</label>
            <select className={styles.formInput} value={form.group} onChange={(e) => set('group', e.target.value)}>
              <option value="all">All Devices</option>
              <option value="driver">Driver Devices</option>
              <option value="fleet">Fleet Devices</option>
              <option value="pilot">Pilot Group (10%)</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Client Tag (optional)</label>
            <input className={styles.formInput} placeholder="e.g. enterprise-a, beta-tester" value={form.tag} onChange={(e) => set('tag', e.target.value)} />
          </div>
        </div>
      )}

      {/* Step 3 — Rollout type */}
      {step === 2 && (
        <div className={styles.formCard}>
          <div className={styles.formCardTitle}>Step 3 — Rollout Type</div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Strategy</label>
            <div className={styles.radioGroup}>
              {['immediate','scheduled','phased'].map((t) => (
                <div
                  key={t}
                  className={`${styles.radioBtn} ${form.rolloutType === t ? styles.radioBtnActive : ''}`}
                  onClick={() => set('rolloutType', t)}
                >
                  {t === 'immediate' ? '⚡ Immediate' : t === 'scheduled' ? '🗓 Scheduled' : '📊 Phased'}
                </div>
              ))}
            </div>
          </div>
          {form.rolloutType === 'scheduled' && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Schedule Date & Time</label>
              <input type="datetime-local" className={styles.formInput} value={form.scheduledAt} onChange={(e) => set('scheduledAt', e.target.value)} />
            </div>
          )}
          {form.rolloutType === 'phased' && (
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Batch Size (%)</label>
                <input type="number" className={styles.formInput} min="5" max="50" value={form.batchPct} onChange={(e) => set('batchPct', e.target.value)} />
                <div className={styles.formHint}>~{Math.round(matchingDevices * form.batchPct / 100)} devices/batch</div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Interval (hours)</label>
                <input type="number" className={styles.formInput} min="1" max="72" value={form.batchInterval} onChange={(e) => set('batchInterval', e.target.value)} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 4 — Review */}
      {step === 3 && (
        <div className={styles.formCard}>
          <div className={styles.formCardTitle}>Step 4 — Review & Confirm</div>
          <div className={styles.reviewTable}>
            {[
              ['From Version', form.fromV],
              ['To Version', form.toV || '—'],
              ['Region', form.region || 'All Regions'],
              ['Device Group', form.group],
              ['Tag', form.tag || '—'],
              ['Rollout Type', form.rolloutType],
              ['Scheduled At', form.rolloutType === 'scheduled' ? form.scheduledAt : 'N/A'],
              ['Devices Targeted', matchingDevices.toLocaleString()],
            ].map(([k, v]) => (
              <div key={k} className={styles.reviewRow}>
                <div className={styles.reviewKey}>{k}</div>
                <div className={styles.reviewVal}>{v}</div>
              </div>
            ))}
          </div>
          {!perms.schedule && (
            <div className={`${styles.formWarn} ${styles.mt}`}>⚠ Analyst role cannot schedule updates.</div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className={styles.stepNav}>
        {step > 0
          ? <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={back}>← Back</button>
          : <div />
        }
        {step < 3
          ? <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={next}>Next →</button>
          : <TooltipButton
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={!perms.schedule}
              tooltip="Analyst role cannot schedule updates"
              onClick={handleSubmit}
            >
              🚀 Schedule Update
            </TooltipButton>
        }
      </div>
    </div>
  )
}

// ── ROLLOUT MONITOR ───────────────────────────────────────────────────────────
function RolloutMonitor() {
  const { perms, role } = useRole()
  const [rollouts, setRollouts]     = useState(ROLLOUTS)
  const [showConfirm, setShowConfirm] = useState(null)

  const remove = (id) => setRollouts((rs) => rs.filter((r) => r.id !== id))

  if (rollouts.length === 0) return (
    <div className={styles.card}>
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text3)' }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>🟢</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>No active rollouts</div>
      </div>
    </div>
  )

  return (
    <>
      {showConfirm && (
        <ConfirmModal
          title={showConfirm.action === 'pause' ? '⏸ Pause Rollout' : '🛑 Cancel Rollout'}
          body={`Are you sure you want to ${showConfirm.action} "${showConfirm.name}"? This will affect all in-progress device updates.`}
          confirmLabel={showConfirm.action === 'pause' ? 'Confirm Pause' : 'Confirm Cancel'}
          danger={showConfirm.action === 'cancel'}
          onConfirm={() => { remove(showConfirm.id); setShowConfirm(null) }}
          onCancel={() => setShowConfirm(null)}
        />
      )}
      {rollouts.map((r) => (
        <div key={r.id} className={styles.rolloutCard}>
          <div className={styles.rolloutHeader}>
            <div>
              <div className={styles.rolloutTitleRow}>
                <span className={styles.rolloutTitle}>{r.name}</span>
                {r.pending && !perms.approveMandat && (
                  <span className={styles.pendingBadge}>⏳ Pending Approval</span>
                )}
              </div>
              <div className={styles.rolloutMeta}>
                v{r.fromV} → v{r.toV} · {r.region} · Started {r.startTime}
              </div>
            </div>
            <div className={styles.rolloutActions}>
              <TooltipButton
                className={`${styles.btn} ${styles.btnWarn}`}
                disabled={!perms.schedule}
                tooltip={`${role} cannot pause rollouts`}
                onClick={() => setShowConfirm({ id: r.id, name: r.name, action: 'pause' })}
              >⏸ Pause</TooltipButton>
              <TooltipButton
                className={`${styles.btn} ${styles.btnDanger}`}
                disabled={!perms.schedule}
                tooltip={`${role} cannot cancel rollouts`}
                onClick={() => setShowConfirm({ id: r.id, name: r.name, action: 'cancel' })}
              >🛑 Cancel</TooltipButton>
            </div>
          </div>
          <div className={styles.stageRow}>
            {STAGES.map((s) => {
              const count = r.staged[s] || 0
              const pct = (count / r.total) * 100
              return (
                <div key={s} className={styles.stage}>
                  <div className={styles.stageTrack}>
                    <div className={styles.stageFill} style={{ width: `${pct}%`, background: STAGE_COLORS[s] }} />
                  </div>
                  <div className={styles.stageName}>{s}</div>
                  <div className={styles.stageCount}>{count}</div>
                </div>
              )
            })}
          </div>
          <div className={styles.rolloutFooter}>
            <span>✓ {r.staged.completed} completed</span>
            <span style={{ color: 'var(--red)' }}>✗ {Math.max(0, r.total - Object.values(r.staged).reduce((a,b)=>a+b,0))} failed</span>
            <span>Total: {r.total} devices</span>
          </div>
        </div>
      ))}
    </>
  )
}

// ── SCHEDULE PAGE ─────────────────────────────────────────────────────────────
export default function SchedulePage() {
  const [tab, setTab] = useState('schedule')

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Update Management</h1>
        <p className={styles.pageSub}>Schedule rollouts and monitor active deployments</p>
      </div>
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'schedule' ? styles.tabActive : ''}`} onClick={() => setTab('schedule')}>New Schedule</button>
        <button className={`${styles.tab} ${tab === 'monitor'  ? styles.tabActive : ''}`} onClick={() => setTab('monitor')}>Active Rollouts</button>
      </div>
      {tab === 'schedule' && <ScheduleForm onDone={() => setTab('monitor')} />}
      {tab === 'monitor'  && <RolloutMonitor />}
    </div>
  )
}
