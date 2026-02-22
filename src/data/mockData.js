// Mock data for MDM Dashboard
// In production, replace these with real API calls

export const REGIONS = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune']
export const VERSIONS = ['4.2.1', '4.1.9', '4.0.7']
export const OS_LIST = ['Android 13', 'Android 12', 'Android 11', 'iOS 16', 'iOS 15']
export const STATUSES = ['Up-to-date', 'Outdated', 'Failed', 'Inactive']

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randomInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a

// Generate 120 mock devices
export const DEVICES = Array.from({ length: 120 }, (_, i) => {
  const status = randomFrom(STATUSES)
  const region = randomFrom(REGIONS)
  const version = status === 'Up-to-date' ? '4.2.1' : randomFrom(VERSIONS)
  const daysAgo = status === 'Inactive' ? randomInt(8, 30) : randomInt(0, 6)
  const lastSeen = new Date(Date.now() - daysAgo * 86400000)

  return {
    id: `IMEI${String(865000000000000 + i).slice(0, 15)}`,
    model: randomFrom([
      'Samsung Galaxy A54',
      'Xiaomi Redmi Note 12',
      'OnePlus Nord CE 3',
      'Motorola G84',
      'Realme 11 Pro',
    ]),
    version,
    os: randomFrom(OS_LIST),
    region,
    status,
    lastSeen: lastSeen.toISOString().split('T')[0],
    daysAgo,
  }
})

// Region chart data derived from devices
export const REGION_DATA = REGIONS.map((r) => ({
  name: r,
  shortName: r.slice(0, 3).toUpperCase(),
  v421: DEVICES.filter((d) => d.region === r && d.version === '4.2.1').length,
  v419: DEVICES.filter((d) => d.region === r && d.version === '4.1.9').length,
  v407: DEVICES.filter((d) => d.region === r && d.version === '4.0.7').length,
}))

// Active rollouts
export const ROLLOUTS = [
  {
    id: 1,
    name: 'v4.2.1 Staged Rollout',
    fromV: '4.1.9',
    toV: '4.2.1',
    region: 'Bangalore',
    total: 340,
    staged: { scheduled: 10, notified: 40, downloading: 80, installing: 60, completed: 150 },
    status: 'active',
    startTime: '2025-06-10 09:00',
    pending: false,
  },
  {
    id: 2,
    name: 'v4.2.1 Delhi Mandatory',
    fromV: '4.0.7',
    toV: '4.2.1',
    region: 'Delhi',
    total: 200,
    staged: { scheduled: 0, notified: 0, downloading: 0, installing: 20, completed: 180 },
    status: 'active',
    startTime: '2025-06-09 11:00',
    pending: true,
  },
]

// Audit log entries (admin only)
export const AUDIT_LOGS = [
  { time: '2025-06-10 14:32', action: 'Scheduled rollout v4.2.1 → Bangalore', user: 'ops@mis.com' },
  { time: '2025-06-10 13:15', action: 'Paused rollout v4.1.9 → Mumbai', user: 'admin@mis.com' },
  { time: '2025-06-10 11:00', action: 'Approved mandatory update request', user: 'admin@mis.com' },
  { time: '2025-06-09 16:45', action: 'Viewed device IMEI865000000000042', user: 'analyst@mis.com' },
  { time: '2025-06-09 15:20', action: 'Created new rollout schedule', user: 'ops@mis.com' },
]

// Per-device timeline (used in DevicePanel)
export const DEVICE_TIMELINE = [
  {
    update: 'v4.1.9 → v4.2.1',
    steps: [
      { stage: 'Scheduled', time: '2025-06-10 09:00', status: 'done' },
      { stage: 'Notified', time: '2025-06-10 09:05', status: 'done' },
      { stage: 'Download Started', time: '2025-06-10 09:10', status: 'done' },
      { stage: 'Download Completed', time: '2025-06-10 09:18', status: 'done' },
      { stage: 'Install Completed', time: '2025-06-10 09:22', status: 'done' },
    ],
  },
  {
    update: 'v4.0.7 → v4.1.9',
    steps: [
      { stage: 'Scheduled', time: '2025-05-01 10:00', status: 'done' },
      { stage: 'Notified', time: '2025-05-01 10:06', status: 'done' },
      { stage: 'Download Started', time: '2025-05-01 10:12', status: 'done' },
      { stage: 'Download Completed', time: null, status: 'failed', error: 'Network Timeout at Download Stage' },
      { stage: 'Install Completed', time: null, status: 'pending' },
    ],
  },
]
