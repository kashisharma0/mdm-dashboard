# MDM Operations Dashboard

A frontend admin dashboard for Mobile Device Management (MDM) built with React + Vite.

## Live Demo
> Deploy to Vercel: `vercel --prod` or drag the `dist/` folder to [netlify.com/drop](https://netlify.com/drop)

---

## Features

- **Device Inventory Dashboard** — KPI cards, region bar chart (click to filter), searchable/sortable device table with pagination
- **Update Scheduling** — 4-step guided form with inline validation, rollout type selection, and confirmation flow
- **Active Rollout Monitor** — Live stage-by-stage progress bars with pause/cancel controls
- **Per-Device Detail Panel** — Slide-over with device metadata and chronological update timeline
- **Role-Based Access Control** — Admin / Ops / Analyst roles with UI-level permission enforcement
- **Audit Log** — Admin-only system event log

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| Vite | Build tool |
| React Router | Client-side routing |
| Recharts | Bar charts for region visualization |
| CSS Modules | Scoped component styling |
| Context API | Global role state (no Redux needed) |

---

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/mdm-dashboard.git
cd mdm-dashboard

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev

# 4. Open in browser
# http://localhost:5173
```

---

## Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx          # Navigation + role switcher
│   ├── DevicePanel.jsx      # Slide-over device detail view
│   ├── Timeline.jsx         # Generic reusable timeline component
│   └── UI.jsx               # Shared: StatusBadge, TooltipButton, ConfirmModal, etc.
├── context/
│   └── RoleContext.jsx      # Global role state via Context API
├── data/
│   └── mockData.js          # All mock data (replace with API calls)
├── pages/
│   ├── InventoryPage.jsx    # Device inventory dashboard
│   ├── SchedulePage.jsx     # Multi-step form + rollout monitor
│   └── AuditPage.jsx        # Audit log (admin only)
├── App.jsx                  # Root layout + routing
└── index.css                # Global CSS design tokens
```

---

## Architecture Decisions

### State Management
Used **React Context API** (`RoleContext`) for global role state. This is sufficient for this scale — Redux would be overkill. Local UI state (filters, form fields, pagination) stays in component-level `useState`.

### Role-Based UI
Permissions are defined in a single `ROLE_PERMS` object. Components consume `useRole()` to conditionally render or disable UI elements. Disabled buttons show tooltips explaining the restriction.

### Timeline Component
`Timeline.jsx` is a **generic, reusable component** that accepts `groups` as props. It is not MDM-specific and can be dropped into the Vehicle Tracking module with different data.

### Performance with Large Device Lists
Currently using client-side filtering/pagination (10 rows/page). For production with millions of devices:
- Switch to **server-side pagination** with API query params (`?page=1&limit=50&region=Bangalore`)
- Use **React Query / SWR** for caching and background refetch
- Add **virtual scrolling** (TanStack Virtual) if rendering large lists client-side

### Multi-Step Form State
Form state is held in a single `useState` object at the `ScheduleForm` level. This prevents data loss when navigating between steps. On browser refresh, state resets (acceptable for this scope; could use `sessionStorage` for persistence).

---

## Role Permissions

| Action | Admin | Ops | Analyst |
|--------|-------|-----|---------|
| View all data | ✅ | ✅ | ✅ |
| Schedule updates | ✅ | ✅ | ❌ |
| Approve mandatory updates | ✅ | ❌ | ❌ |
| View audit log | ✅ | ❌ | ❌ |
| Pause / Cancel rollouts | ✅ | ✅ | ❌ |

---

## Deployment

```bash
npm run build
# Upload dist/ to Netlify, Vercel, or any static host
```
