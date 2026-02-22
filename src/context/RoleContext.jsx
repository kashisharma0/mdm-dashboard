import { createContext, useContext, useState } from 'react'

// Role permissions matrix
export const ROLE_PERMS = {
  admin:   { schedule: true,  approveMandat: true,  viewAudit: true  },
  ops:     { schedule: true,  approveMandat: false, viewAudit: false },
  analyst: { schedule: false, approveMandat: false, viewAudit: false },
}

const RoleContext = createContext(null)

/**
 * RoleProvider — wraps the app and provides role state globally.
 * Any component can read role via useRole() without prop drilling.
 */
export function RoleProvider({ children }) {
  const [role, setRole] = useState('admin')
  const perms = ROLE_PERMS[role]

  return (
    <RoleContext.Provider value={{ role, setRole, perms }}>
      {children}
    </RoleContext.Provider>
  )
}

/** Hook to consume role context in any component */
export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used inside RoleProvider')
  return ctx
}
