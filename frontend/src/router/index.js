import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/utils/constants'

// Layouts
import PublicLayout from '@/layouts/PublicLayout.vue'
import EmployeeLayout from '@/layouts/EmployeeLayout.vue'
import OrgAdminLayout from '@/layouts/OrgAdminLayout.vue'
import SuperAdminLayout from '@/layouts/SuperAdminLayout.vue'

const routes = [
  // Public routes
  {
    path: '/',
    component: PublicLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/public/HomeView.vue'),
      },
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/public/LoginView.vue'),
        meta: { guestOnly: true },
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/public/RegisterView.vue'),
        meta: { guestOnly: true },
      },
      {
        path: 'forgot-password',
        name: 'ForgotPassword',
        component: () => import('@/views/public/ForgotPasswordView.vue'),
        meta: { guestOnly: true },
      },
      {
        path: 'about',
        name: 'About',
        component: () => import('@/views/public/AboutView.vue'),
      },
      {
        path: 'pricing',
        name: 'Pricing',
        component: () => import('@/views/public/PricingView.vue'),
      },
      {
        path: 'contact',
        name: 'Contact',
        component: () => import('@/views/public/ContactView.vue'),
      },
    ],
  },

  // Employee routes
  {
    path: '/employee',
    component: EmployeeLayout,
    meta: { requiresAuth: true, role: ROLES.EMPLOYEE },
    children: [
      {
        path: 'dashboard',
        name: 'EmployeeDashboard',
        component: () => import('@/views/employee/EmployeeDashboard.vue'),
      },
      {
        path: 'history',
        name: 'MyAttendanceHistory',
        component: () => import('@/views/employee/MyAttendanceHistory.vue'),
      },
      {
        path: 'profile',
        name: 'ProfileSettings',
        component: () => import('@/views/employee/ProfileSettings.vue'),
      },
    ],
  },

  // OrgAdmin routes - TrackTimi Admin Dashboard
  {
    path: '/admin',
    component: OrgAdminLayout,
    meta: { requiresAuth: true, role: ROLES.ORG_ADMIN },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/orgadmin/OrgDashboard.vue'),
      },
      // Employee Management
      {
        path: 'employees',
        name: 'Employees',
        component: () => import('@/views/orgadmin/EmployeeManagement.vue'),
      },
      // Department Management
      {
        path: 'departments',
        name: 'Departments',
        component: () => import('@/views/orgadmin/DepartmentManagement.vue'),
      },
      // Shift Management
      {
        path: 'shifts',
        name: 'Shifts',
        component: () => import('@/views/orgadmin/ShiftManagement.vue'),
      },
      // Schedule Management
      {
        path: 'schedules',
        name: 'Schedules',
        component: () => import('@/views/orgadmin/ScheduleManagement.vue'),
      },
      // Attendance Management
      {
        path: 'attendance',
        name: 'Attendance',
        component: () => import('@/views/orgadmin/OrgAttendance.vue'),
      },
      // Reports
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('@/views/orgadmin/OrgReports.vue'),
      },
      // Notifications
      {
        path: 'notifications',
        name: 'Notifications',
        component: () => import('@/views/orgadmin/NotificationCenter.vue'),
      },
      // Request Approvals
      {
        path: 'approvals',
        name: 'Approvals',
        component: () => import('@/views/orgadmin/RequestApprovals.vue'),
      },
      // Admin Profile
      {
        path: 'profile',
        name: 'AdminProfile',
        component: () => import('@/views/orgadmin/AdminProfile.vue'),
      },
      // Organization Settings
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/orgadmin/OrgSettings.vue'),
      },
      // Legacy routes (backward compatibility)
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/orgadmin/UserManagement.vue'),
      },
    ],
  },

  // SuperAdmin routes
  {
    path: '/superadmin',
    component: SuperAdminLayout,
    meta: { requiresAuth: true, role: ROLES.SUPER_ADMIN },
    children: [
      {
        path: 'dashboard',
        name: 'SuperAdminDashboard',
        component: () => import('@/views/superadmin/SuperAdminDashboard.vue'),
      },
      {
        path: 'organizations',
        name: 'OrganizationDirectory',
        component: () => import('@/views/superadmin/OrganizationDirectory.vue'),
      },
      {
        path: 'revenue',
        name: 'RevenueIntelligence',
        component: () => import('@/views/superadmin/RevenueIntelligence.vue'),
      },
      {
        path: 'subscriptions',
        name: 'SubscriptionManagement',
        component: () => import('@/views/superadmin/SubscriptionManagement.vue'),
      },
      {
        path: 'analytics',
        name: 'GlobalAnalytics',
        component: () => import('@/views/superadmin/GlobalAnalytics.vue'),
      },
      {
        path: 'monitoring',
        name: 'SystemMonitoring',
        component: () => import('@/views/superadmin/SystemMonitoring.vue'),
      },
      {
        path: 'audit-logs',
        name: 'AuditLogs',
        component: () => import('@/views/superadmin/AuditLogs.vue'),
      },
      {
        path: 'support',
        name: 'SupportTools',
        component: () => import('@/views/superadmin/SupportTools.vue'),
      },
      {
        path: 'settings',
        name: 'PlatformSettings',
        component: () => import('@/views/superadmin/PlatformSettings.vue'),
      },
    ],
  },

  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/public/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  authStore.checkAuth()

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const guestOnly = to.matched.some((record) => record.meta.guestOnly)
  const requiredRole = to.matched.find((record) => record.meta.role)?.meta.role

  // If route requires auth and user is not authenticated
  if (requiresAuth && !authStore.isAuthenticated) {
    if (to.path !== '/login') {
      return next({ name: 'Login', query: { redirect: to.fullPath } })
    }
    return next()
  }

  // If route is guest only and user is authenticated (except home page)
  if (guestOnly && authStore.isAuthenticated && to.path !== '/') {
    const dashboardUrl = authStore.dashboardRoute
    if (dashboardUrl && dashboardUrl !== to.path) {
      return next(dashboardUrl)
    }
    return next()
  }

  // If route requires a specific role and user doesn't have it
  if (requiredRole && authStore.isAuthenticated && authStore.userRole !== requiredRole) {
    return next(authStore.dashboardRoute)
  }

  next()
})

export default router
