export const ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  ORG_ADMIN: 'OrgAdmin',
  EMPLOYEE: 'Employee',
}

export const ROLE_DASHBOARDS = {
  [ROLES.SUPER_ADMIN]: '/superadmin/overview',
  [ROLES.ORG_ADMIN]: '/admin/dashboard',
  [ROLES.EMPLOYEE]: '/employee/dashboard',
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
