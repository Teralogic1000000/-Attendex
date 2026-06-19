<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <AppSidebar :navItems="navItems" :collapsed="collapsed" @toggle="collapsed = !collapsed" />
    <div :class="collapsed ? 'ml-16' : 'ml-64'" class="transition-all duration-300 flex flex-col flex-1">
      <div class="flex-1 p-6 md:p-8 bg-gray-50">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppSidebar from '@/components/common/AppSidebar.vue'
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  BarChart3, 
  Settings, 
  Clock, 
  Calendar,
  Building2,
  Bell,
  CheckCircle,
  User,
  Lock,
  FileText
} from 'lucide-vue-next'

const collapsed = ref(false)

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  
  // Core Management
  { label: 'Management', divider: true },
  { to: '/admin/employees', label: 'Employees', icon: Users },
  { to: '/admin/departments', label: 'Departments', icon: Building2 },
  { to: '/admin/shifts', label: 'Shifts', icon: Clock },
  { to: '/admin/schedules', label: 'Schedules', icon: Calendar },
  
  // Operations
  { label: 'Operations', divider: true },
  { to: '/admin/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/approvals', label: 'Request Approvals', icon: CheckCircle },
  
  // Admin Settings
  { label: 'Admin', divider: true },
  { to: '/admin/profile', label: 'My Profile', icon: User },
  { to: '/admin/settings', label: 'Organization Settings', icon: Settings },
]
</script>
