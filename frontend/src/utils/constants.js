export const ROLES = {
  SUPER_ADMIN: 'Super_Admin',
  ORG_ADMIN: 'Org_Admin',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
  CONTRACTOR: 'Contractor',
  INTERN: 'Intern',
}

export const ROLE_DASHBOARDS = {
  [ROLES.SUPER_ADMIN]: '/superadmin/dashboard',
  [ROLES.ORG_ADMIN]: '/admin/dashboard',
  [ROLES.MANAGER]: '/admin/dashboard',
  [ROLES.EMPLOYEE]: '/employee/dashboard',
  [ROLES.CONTRACTOR]: '/employee/dashboard',
  [ROLES.INTERN]: '/employee/dashboard',
}

export const ATTENDANCE_STATUS = {
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
  ABSENT: 'absent',
}

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  TRIAL: 'trial',
}

export const LOG_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
}
