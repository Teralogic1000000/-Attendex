/**
 * Role-Based Access Control (RBAC) Permission Configuration
 * 
 * Defines granular permissions for each user role
 * Updated: March 6, 2026
 */

export const USER_ROLES = {
  SUPER_ADMIN: 'Super_Admin',
  ORG_ADMIN: 'Org_Admin',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
  CONTRACTOR: 'Contractor',
  INTERN: 'Intern'
};

export const ROLE_HIERARCHY = {
  [USER_ROLES.SUPER_ADMIN]: 5,    // Highest
  [USER_ROLES.ORG_ADMIN]: 4,
  [USER_ROLES.MANAGER]: 3,
  [USER_ROLES.EMPLOYEE]: 2,
  [USER_ROLES.CONTRACTOR]: 1,
  [USER_ROLES.INTERN]: 1          // Lowest
};

/**
 * Permission Matrix for Each Role
 * Defines what actions each role can perform
 */
export const PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: {
    // === User Management ===
    users: {
      list: true,              // GET /users
      read: true,              // GET /users/:id
      create: true,            // POST /users
      update: true,            // PUT /users/:id
      delete: true,            // DELETE /users/:id
      changeRole: true,        // Change user roles
      deactivate: true         // Deactivate users
    },

    // === Organization Management ===
    organizations: {
      list: true,
      read: true,
      create: true,
      update: true,
      delete: true,
      viewAll: true            // View all organizations
    },

    // === Department Management ===
    departments: {
      list: true,
      read: true,
      create: true,
      update: true,
      delete: true,
      viewAll: true
    },

    // === Shift Management ===
    shifts: {
      list: true,
      read: true,
      create: true,
      update: true,
      delete: true,
      viewAll: true
    },

    // === Attendance Management ===
    attendance: {
      viewOwn: true,
      viewOrgAttendance: true,
      viewAllAttendance: true,
      create: true,
      update: true,
      delete: true,
      approve: true,
      reject: true,
      bulkImport: true
    },

    // === Device Management ===
    devices: {
      list: true,
      read: true,
      create: true,
      update: true,
      delete: true,
      viewAll: true,
      search: true
    },

    // === Geofence Management ===
    geofence: {
      list: true,
      read: true,
      create: true,
      update: true,
      delete: true,
      checkLocation: true,
      viewAll: true
    },

    // === Audit & Logging ===
    auditLogs: {
      view: true,
      search: true,
      export: true,
      cleanup: true
    },

    // === Lookup Tables ===
    lookups: {
      view: true,
      create: true,
      update: true,
      delete: true
    },

    // === System Settings ===
    settings: {
      view: true,
      update: true
    }
  },

  [USER_ROLES.ORG_ADMIN]: {
    // === User Management ===
    users: {
      list: true,              // Within organization
      read: true,
      create: true,
      update: true,
      delete: true,
      changeRole: true,        // Only within org
      deactivate: true         // Only within org
    },

    // === Organization Management ===
    organizations: {
      list: true,
      read: true,              // Own organization
      create: false,
      update: true,            // Own organization only
      delete: false,
      viewAll: false           // Only own org
    },

    // === Department Management ===
    departments: {
      list: true,              // Own organization
      read: true,
      create: true,
      update: true,
      delete: true,
      viewAll: false           // Only own org
    },

    // === Shift Management ===
    shifts: {
      list: true,
      read: true,
      create: true,
      update: true,
      delete: true,
      viewAll: false
    },

    // === Attendance Management ===
    attendance: {
      viewOwn: true,
      viewOrgAttendance: true,
      viewAllAttendance: false, // Only own org
      create: true,
      update: true,
      delete: true,
      approve: true,
      reject: true,
      bulkImport: true
    },

    // === Device Management ===
    devices: {
      list: true,
      read: true,
      create: true,
      update: true,
      delete: true,
      viewAll: false,          // Only org devices
      search: true
    },

    // === Geofence Management ===
    geofence: {
      list: true,
      read: true,
      create: true,
      update: true,
      delete: true,
      checkLocation: true,
      viewAll: false           // Only org geofences
    },

    // === Audit & Logging ===
    auditLogs: {
      view: true,              // Own org only
      search: true,
      export: true,
      cleanup: false           // Super admin only
    },

    // === Lookup Tables ===
    lookups: {
      view: true,
      create: false,           // Super admin only
      update: false,
      delete: false
    },

    // === System Settings ===
    settings: {
      view: false,
      update: false            // Super admin only
    }
  },

  [USER_ROLES.MANAGER]: {
    // === User Management ===
    users: {
      list: true,              // Department only
      read: true,
      create: false,
      update: false,
      delete: false,
      changeRole: false,
      deactivate: false
    },

    // === Organization Management ===
    organizations: {
      list: false,
      read: true,              // Own org (read-only)
      create: false,
      update: false,
      delete: false,
      viewAll: false
    },

    // === Department Management ===
    departments: {
      list: false,
      read: true,              // Own department (read-only)
      create: false,
      update: false,
      delete: false,
      viewAll: false
    },

    // === Shift Management ===
    shifts: {
      list: true,
      read: true,
      create: false,
      update: false,
      delete: false,
      viewAll: false
    },

    // === Attendance Management ===
    attendance: {
      viewOwn: true,
      viewOrgAttendance: false,
      viewAllAttendance: false,
      create: false,
      update: false,
      delete: false,
      approve: true,           // Approve team attendance
      reject: true,            // Reject team attendance
      bulkImport: false
    },

    // === Device Management ===
    devices: {
      list: false,
      read: false,
      create: false,
      update: false,
      delete: false,
      viewAll: false,
      search: false
    },

    // === Geofence Management ===
    geofence: {
      list: true,
      read: true,
      create: false,
      update: false,
      delete: false,
      checkLocation: true,
      viewAll: false
    },

    // === Audit & Logging ===
    auditLogs: {
      view: false,
      search: false,
      export: false,
      cleanup: false
    },

    // === Lookup Tables ===
    lookups: {
      view: true,
      create: false,
      update: false,
      delete: false
    },

    // === Subscription Management ===
    subscriptions: {
      view: true,
      manage: false,
      viewAll: false
    },

    // === System Settings ===
    settings: {
      view: false,
      update: false
    }
  },

  [USER_ROLES.EMPLOYEE]: {
    // === User Management ===
    users: {
      list: false,
      read: false,             // Only self
      create: false,
      update: false,           // Only profile
      delete: false,
      changeRole: false,
      deactivate: false
    },

    // === Organization Management ===
    organizations: {
      list: false,
      read: true,              // Own organization (read-only)
      create: false,
      update: false,
      delete: false,
      viewAll: false
    },

    // === Department Management ===
    departments: {
      list: false,
      read: true,              // Own department (read-only)
      create: false,
      update: false,
      delete: false,
      viewAll: false
    },

    // === Shift Management ===
    shifts: {
      list: true,
      read: true,
      create: false,
      update: false,
      delete: false,
      viewAll: false
    },

    // === Attendance Management ===
    attendance: {
      viewOwn: true,           // View own attendance only
      viewOrgAttendance: false,
      viewAllAttendance: false,
      create: false,
      update: false,
      delete: false,
      approve: false,
      reject: false,
      bulkImport: false,
      checkIn: true,           // Can check in
      checkOut: true           // Can check out
    },

    // === Device Management ===
    devices: {
      list: false,
      read: false,
      create: false,
      update: false,
      delete: false,
      viewAll: false,
      search: false
    },

    // === Geofence Management ===
    geofence: {
      list: true,
      read: true,
      create: false,
      update: false,
      delete: false,
      checkLocation: true,     // Check own location
      viewAll: false
    },

    // === Audit & Logging ===
    auditLogs: {
      view: false,
      search: false,
      export: false,
      cleanup: false
    },

    // === Lookup Tables ===
    lookups: {
      view: true,
      create: false,
      update: false,
      delete: false
    },

    // === System Settings ===
    settings: {
      view: false,
      update: false
    }
  },

  [USER_ROLES.CONTRACTOR]: {
    // === User Management ===
    users: {
      list: false,
      read: false,
      create: false,
      update: false,
      delete: false,
      changeRole: false,
      deactivate: false
    },

    // === Organization Management ===
    organizations: {
      list: false,
      read: true,              // Own organization (read-only)
      create: false,
      update: false,
      delete: false,
      viewAll: false
    },

    // === Department Management ===
    departments: {
      list: false,
      read: true,              // Assigned department (read-only)
      create: false,
      update: false,
      delete: false,
      viewAll: false
    },

    // === Shift Management ===
    shifts: {
      list: true,
      read: true,
      create: false,
      update: false,
      delete: false,
      viewAll: false
    },

    // === Attendance Management ===
    attendance: {
      viewOwn: true,           // View own only
      viewOrgAttendance: false,
      viewAllAttendance: false,
      create: false,
      update: false,
      delete: false,
      approve: false,
      reject: false,
      bulkImport: false,
      checkIn: true,           // Can check in
      checkOut: true           // Can check out
    },

    // === Device Management ===
    devices: {
      list: false,
      read: false,
      create: false,
      update: false,
      delete: false,
      viewAll: false,
      search: false
    },

    // === Geofence Management ===
    geofence: {
      list: true,
      read: true,
      create: false,
      update: false,
      delete: false,
      checkLocation: true,
      viewAll: false
    },

    // === Audit & Logging ===
    auditLogs: {
      view: false,
      search: false,
      export: false,
      cleanup: false
    },

    // === Lookup Tables ===
    lookups: {
      view: true,
      create: false,
      update: false,
      delete: false
    },

    // === System Settings ===
    settings: {
      view: false,
      update: false
    }
  },

  [USER_ROLES.INTERN]: {
    // === User Management ===
    users: {
      list: false,
      read: false,
      create: false,
      update: false,
      delete: false,
      changeRole: false,
      deactivate: false
    },

    // === Organization Management ===
    organizations: {
      list: false,
      read: true,
      create: false,
      update: false,
      delete: false,
      viewAll: false
    },

    // === Department Management ===
    departments: {
      list: false,
      read: true,
      create: false,
      update: false,
      delete: false,
      viewAll: false
    },

    // === Shift Management ===
    shifts: {
      list: true,
      read: true,
      create: false,
      update: false,
      delete: false,
      viewAll: false
    },

    // === Attendance Management ===
    attendance: {
      viewOwn: true,           // View own only
      viewOrgAttendance: false,
      viewAllAttendance: false,
      create: false,
      update: false,
      delete: false,
      approve: false,
      reject: false,
      bulkImport: false,
      checkIn: true,           // Can check in
      checkOut: true           // Can check out
    },

    // === Device Management ===
    devices: {
      list: false,
      read: false,
      create: false,
      update: false,
      delete: false,
      viewAll: false,
      search: false
    },

    // === Geofence Management ===
    geofence: {
      list: true,
      read: true,
      create: false,
      update: false,
      delete: false,
      checkLocation: true,
      viewAll: false
    },

    // === Audit & Logging ===
    auditLogs: {
      view: false,
      search: false,
      export: false,
      cleanup: false
    },

    // === Lookup Tables ===
    lookups: {
      view: true,
      create: false,
      update: false,
      delete: false
    },

    // === System Settings ===
    settings: {
      view: false,
      update: false
    }
  }
};

/**
 * Helper function to check if a role has permission for a specific action
 * @param {string} role - User role
 * @param {string} resource - Resource name (e.g., 'users', 'attendance')
 * @param {string} action - Action name (e.g., 'create', 'read')
 * @returns {boolean} Whether the role has permission
 */
export function hasPermission(role, resource, action) {
  const rolePermissions = PERMISSIONS[role];
  if (!rolePermissions) return false;
  
  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) return false;
  
  return resourcePermissions[action] === true;
}

/**
 * Helper function to check if a role's hierarchy level is >= required level
 * @param {string} role - User role
 * @param {number} requiredLevel - Required hierarchy level
 * @returns {boolean} Whether role meets hierarchy requirement
 */
export function checkHierarchyLevel(role, requiredLevel) {
  const roleLevel = ROLE_HIERARCHY[role];
  return roleLevel && roleLevel >= requiredLevel;
}

/**
 * Helper function to get all roles that have permission for an action
 * @param {string} resource - Resource name
 * @param {string} action - Action name
 * @returns {array} Array of roles with permission
 */
export function getRolesWithPermission(resource, action) {
  return Object.keys(PERMISSIONS).filter(role => 
    hasPermission(role, resource, action)
  );
}

/**
 * Permission levels for easier checking
 */
export const PERMISSION_LEVELS = {
  SYSTEM_ADMIN: ROLE_HIERARCHY[USER_ROLES.SUPER_ADMIN],
  ORG_ADMIN: ROLE_HIERARCHY[USER_ROLES.ORG_ADMIN],
  MANAGER: ROLE_HIERARCHY[USER_ROLES.MANAGER],
  USER: ROLE_HIERARCHY[USER_ROLES.EMPLOYEE]
};
