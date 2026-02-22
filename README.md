# MDM Operations Dashboard

A frontend admin dashboard for Mobile Device Management (MDM) built with React + Vite.

## Live Demo
> https://mdm-dashboard-ivory.vercel.app/

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



