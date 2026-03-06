import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import Dashboard from '@/pages/Dashboard.vue'
import Users from '@/pages/Users.vue'
import Departments from '@/pages/Departments.vue'
import Shifts from '@/pages/Shifts.vue'
import Attendance from '@/pages/Attendance.vue'
import Reports from '@/pages/Reports.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
        meta: { title: 'Dashboard' }
      },
      {
        path: 'users',
        component: Users,
        meta: { title: 'Users' }
      },
      {
        path: 'departments',
        component: Departments,
        meta: { title: 'Departments' }
      },
      {
        path: 'shifts',
        component: Shifts,
        meta: { title: 'Shifts' }
      },
      {
        path: 'attendance',
        component: Attendance,
        meta: { title: 'Attendance' }
      },
      {
        path: 'reports',
        component: Reports,
        meta: { title: 'Reports' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
