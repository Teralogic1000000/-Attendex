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

  // OrgAdmin routes
  {
    path: '/admin',
    component: OrgAdminLayout,
    meta: { requiresAuth: true, role: ROLES.ORG_ADMIN },
    children: [
      {
        path: 'dashboard',
        name: 'OrgDashboard',
        component: () => import('@/views/orgadmin/OrgDashboard.vue'),
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('@/views/orgadmin/UserManagement.vue'),
      },
      {
        path: 'attendance',
        name: 'OrgAttendance',
        component: () => import('@/views/orgadmin/OrgAttendance.vue'),
      },
      {
        path: 'subscription',
        name: 'SubscriptionSettings',
        component: () => import('@/views/orgadmin/SubscriptionSettings.vue'),
      },
      {
        path: 'settings',
        name: 'OrgSettings',
        component: () => import('@/views/orgadmin/OrgSettings.vue'),
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
        path: 'overview',
        name: 'SystemOverview',
        component: () => import('@/views/superadmin/SystemOverview.vue'),
      },
      {
        path: 'organizations',
        name: 'OrganizationDirectory',
        component: () => import('@/views/superadmin/OrganizationDirectory.vue'),
      },
      {
        path: 'plans',
        name: 'PlanManagement',
        component: () => import('@/views/superadmin/PlanManagement.vue'),
      },
      {
        path: 'logs',
        name: 'SystemLogs',
        component: () => import('@/views/superadmin/SystemLogs.vue'),
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
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  // If route is guest only and user is authenticated
  if (guestOnly && authStore.isAuthenticated) {
    return next(authStore.dashboardRoute)
  }

  // If route requires a specific role
  if (requiredRole && authStore.userRole !== requiredRole) {
    return next(authStore.dashboardRoute)
  }

  next()
})

export default router
