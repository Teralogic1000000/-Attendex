<template>
  <div class="w-full">
    <!-- Greeting Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Welcome back, {{ userFirstName }}! 👋</h1>
      <p class="text-gray-600 mt-2">{{ orgName }} • {{ new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
    </div>

    <!-- Dashboard Content -->
    <div class="space-y-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="p-2 bg-primary-100 rounded-lg">
                  <Users class="w-6 h-6 text-primary-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Total Employees</p>
                  <p class="text-2xl font-bold text-gray-900">{{ formatNumber(stats.totalEmployees) }}</p>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="p-2 bg-accent-100 rounded-lg">
                  <UserCheck class="w-6 h-6 text-accent-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Present Today</p>
                  <p class="text-2xl font-bold text-gray-900">{{ formatNumber(stats.presentToday) }}</p>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="p-2 bg-danger-100 rounded-lg">
                  <UserX class="w-6 h-6 text-danger-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Absent Today</p>
                  <p class="text-2xl font-bold text-gray-900">{{ formatNumber(stats.absentToday) }}</p>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="p-2 bg-warning-100 rounded-lg">
                  <Clock class="w-6 h-6 text-warning-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Late Check-ins</p>
                  <p class="text-2xl font-bold text-gray-900">{{ formatNumber(stats.lateCheckins) }}</p>
                </div>
              </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center">
                <div class="p-2 bg-secondary-100 rounded-lg">
                  <Briefcase class="w-6 h-6 text-secondary-600" />
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-gray-500">Active Projects</p>
                  <p class="text-2xl font-bold text-gray-900">{{ formatNumber(stats.activeProjects) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Charts Row -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Real-time Attendance Status -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Real-time Attendance Status</h3>
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 bg-accent-500 rounded-full animate-pulse"></div>
                  <span class="text-sm text-gray-500">Live</span>
                </div>
              </div>
              <div class="h-64">
                <Line v-if="chartReady" :data="realtimeChartData" :options="realtimeChartOptions" />
                <div v-else class="flex h-full items-center justify-center text-gray-400 text-sm">
                  Loading chart data...
                </div>
              </div>
            </div>

            <!-- Weekly Attendance Trend -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Weekly Attendance Trend</h3>
              <div class="h-64">
                <Bar v-if="chartReady" :data="chartData" :options="chartOptions" />
                <div v-else class="flex h-full items-center justify-center text-gray-400 text-sm">
                  Loading chart data...
                </div>
              </div>
            </div>
          </div>

          <!-- Activity Feed and Quick Actions -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Today's Check-in Activity -->
            <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Today's Check-in Activity</h3>
              <div class="space-y-4 max-h-96 overflow-y-auto">
                <div v-for="(item, idx) in recentActivity" :key="idx" class="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                  <div :class="['w-2 h-2 rounded-full', item.dotColor === 'bg-accent-500' ? 'bg-accent-500' : 'bg-danger-500']"></div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">{{ item.text }}</p>
                    <p class="text-xs text-gray-500">{{ item.time }}</p>
                  </div>
                </div>
                <div v-if="recentActivity.length === 0" class="text-center py-8 text-gray-500">
                  <Calendar class="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No activity today</p>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div class="space-y-3">
                <button @click="showAddEmployeeModal = true" class="w-full flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  <UserPlus class="w-5 h-5 mr-2" />
                  Add Employee
                </button>
                <button @click="generateReport" class="w-full flex items-center justify-center px-4 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors">
                  <FileText class="w-5 h-5 mr-2" />
                  Generate Report
                </button>
                <button @click="createQRCode" class="w-full flex items-center justify-center px-4 py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors">
                  <QrCode class="w-5 h-5 mr-2" />
                  Create QR Code
                </button>
                <button @click="createGeofence" class="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  <MapPin class="w-5 h-5 mr-2" />
                  Create Geofence
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>

    <!-- Add Employee Modal -->
    <div v-if="showAddEmployeeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-white">Add New Employee</h2>
          <button @click="showAddEmployeeModal = false" class="text-white hover:text-primary-100">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <form @submit.prevent="handleAddEmployee" class="p-6 space-y-4">
          <!-- First Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              v-model="newEmployee.firstName"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="John"
            />
          </div>

          <!-- Last Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              v-model="newEmployee.lastName"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="Doe"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="newEmployee.email"
              type="email"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="john@example.com"
            />
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              v-model="newEmployee.phone"
              type="tel"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <!-- Department -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input
              v-model="newEmployee.department"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="Sales"
            />
          </div>

          <!-- Position -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <input
              v-model="newEmployee.position"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="Manager"
            />
          </div>

          <!-- Error Message -->
          <div v-if="employeeError" class="p-3 bg-danger-50 border border-danger-200 text-danger-700 rounded-lg text-sm">
            {{ employeeError }}
          </div>

          <!-- Success Message -->
          <div v-if="employeeSuccess" class="p-3 bg-accent-50 border border-accent-200 text-accent-700 rounded-lg text-sm">
            {{ employeeSuccess }}
          </div>

          <!-- Modal Footer -->
          <div class="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              @click="showAddEmployeeModal = false"
              class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="employeeLoading"
              class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-primary-400 transition-colors font-medium flex items-center justify-center"
            >
              <span v-if="!employeeLoading">Add Employee</span>
              <span v-else class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Live Data Sections -->
    <div class="space-y-6">
      <!-- Employees Section -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Employees ({{ employeesList.length }})</h3>
          <button @click="showAddEmployeeModal = true" class="flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">
            <UserPlus class="w-4 h-4 mr-2" />
            Add Employee
          </button>
        </div>
        <div v-if="employeesList.length > 0" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left font-medium text-gray-700">Name</th>
                <th class="px-4 py-2 text-left font-medium text-gray-700">Email</th>
                <th class="px-4 py-2 text-left font-medium text-gray-700">Position</th>
                <th class="px-4 py-2 text-left font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="emp in employeesList.slice(0, 5)" :key="emp.id" class="border-t hover:bg-gray-50">
                <td class="px-4 py-2">{{ emp.firstName }} {{ emp.lastName }}</td>
                <td class="px-4 py-2">{{ emp.email }}</td>
                <td class="px-4 py-2">{{ emp.position || '-' }}</td>
                <td class="px-4 py-2">
                  <span :class="['px-2 py-1 rounded-full text-xs font-medium', emp.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800']">
                    {{ emp.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          No employees found
        </div>
      </div>

      <!-- Departments Section -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Departments ({{ departmentsList.length }})</h3>
        <div v-if="departmentsList.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="dept in departmentsList" :key="dept.id" class="border border-gray-200 rounded-lg p-4">
            <h4 class="font-medium text-gray-900">{{ dept.name }}</h4>
            <p class="text-sm text-gray-500 mt-1">{{ dept.description || 'No description' }}</p>
            <p class="text-xs text-gray-500 mt-2">Head: {{ dept.head || 'Unassigned' }}</p>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          No departments found
        </div>
      </div>

      <!-- Attendance Records Section -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Attendance (Last {{ attendanceRecords.length }})</h3>
        <div v-if="attendanceRecords.length > 0" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left font-medium text-gray-700">Employee</th>
                <th class="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                <th class="px-4 py-2 text-left font-medium text-gray-700">Date/Time</th>
                <th class="px-4 py-2 text-left font-medium text-gray-700">Hours</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="rec in attendanceRecords.slice(0, 10)" :key="rec.id" class="border-t hover:bg-gray-50">
                <td class="px-4 py-2">{{ rec.user?.firstName }} {{ rec.user?.lastName }}</td>
                <td class="px-4 py-2">
                  <span :class="['px-2 py-1 rounded-full text-xs font-medium', 
                    rec.status === 'Present' ? 'bg-green-100 text-green-800' :
                    rec.status === 'Absent' ? 'bg-red-100 text-red-800' :
                    rec.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800']">
                    {{ rec.status }}
                  </span>
                </td>
                <td class="px-4 py-2">{{ new Date(rec.date).toLocaleString() }}</td>
                <td class="px-4 py-2">{{ rec.totalHours || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          No attendance records found
        </div>
      </div>

      <!-- Action Buttons Row -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button @click="refreshDashboard" :disabled="loading" class="flex items-center justify-center px-4 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 disabled:bg-accent-400 font-medium">
          <svg v-if="!loading" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <svg v-else class="animate-spin w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Refresh Data
        </button>
        <button @click="generateReport" :disabled="loading" class="flex items-center justify-center px-4 py-3 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 disabled:bg-secondary-400 font-medium">
          <FileText class="w-5 h-5 mr-2" />
          Generate Report
        </button>
        <button @click="createQRCode" class="flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
          <QrCode class="w-5 h-5 mr-2" />
          Generate QR Code
        </button>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="p-4 bg-danger-50 border border-danger-200 text-danger-700 rounded-lg">
        {{ error }}
      </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { Bar, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { useUserStore } from '@/stores/user'
import { useAttendanceStore } from '@/stores/attendance'
import { formatNumber, timeAgo } from '@/utils/helpers'
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Briefcase,
  Calendar,
  Bell,
  ChevronDown,
  Crown,
  UserPlus,
  FileText,
  QrCode,
  MapPin,
} from 'lucide-vue-next'
import dashboardService from '@/services/dashboardService'
import { useAuthStore } from '@/stores/auth'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const userStore = useUserStore()
const attendanceStore = useAttendanceStore()
const authStore = useAuthStore()

const profileMenuOpen = ref(false)
const chartReady = ref(false)

// Add Employee Modal State
const showAddEmployeeModal = ref(false)
const employeeLoading = ref(false)
const employeeError = ref('')
const employeeSuccess = ref('')

const newEmployee = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  department: '',
  position: '',
})

const orgName = computed(() => {
  return authStore.user?.organization?.name || 'Organization'
})

const userInitials = computed(() => {
  const user = authStore.user
  if (user?.firstName && user?.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
  }
  return user?.email?.[0]?.toUpperCase() || 'U'
})

const userFirstName = computed(() => {
  return authStore.user?.firstName || 'User'
})

const stats = ref({
  totalEmployees: 0,
  presentToday: 0,
  absentToday: 0,
  lateCheckins: 0,
  activeProjects: 0,
  avgHours: '0.0',
  planName: 'Free',
  planStatus: 'Active',
})

const recentActivity = ref([])

const chartData = ref({
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Employees Present',
      backgroundColor: '#1e293b',
      borderRadius: 6,
      data: [0, 0, 0, 0, 0, 0, 0],
    },
  ],
})

const realtimeChartData = ref({
  labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
  datasets: [
    {
      label: 'Check-ins',
      borderColor: '#eab308',
      backgroundColor: 'rgba(234, 179, 8, 0.1)',
      data: [2, 5, 15, 25, 18, 8],
      tension: 0.4,
      fill: true,
    },
  ],
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { precision: 0 },
      grid: { color: '#f3f4f6' },
    },
    x: {
      grid: { display: false },
    },
  },
}

const realtimeChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { precision: 0 },
      grid: { color: '#f3f4f6' },
    },
    x: {
      grid: { display: false },
    },
  },
  elements: {
    point: {
      radius: 4,
      hoverRadius: 6,
    },
  },
}

const logout = () => {
  authStore.logout()
}

const handleAddEmployee = async () => {
  try {
    employeeError.value = ''
    employeeSuccess.value = ''
    employeeLoading.value = true

    // Prepare employee data
    const employeeData = {
      firstName: newEmployee.value.firstName,
      lastName: newEmployee.value.lastName,
      email: newEmployee.value.email,
      phone: newEmployee.value.phone || null,
      position: newEmployee.value.position || null,
    }

    // Call dashboard service to create employee
    const response = await dashboardService.createEmployee(employeeData)

    if (!response || response.error) {
      throw new Error(response?.message || 'Failed to add employee')
    }

    // Show success and reset form
    employeeSuccess.value = `${newEmployee.value.firstName} has been added successfully!`
    
    // Reset form
    newEmployee.value = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      position: '',
    }

    // Close modal after 2 seconds
    setTimeout(() => {
      showAddEmployeeModal.value = false
      employeeSuccess.value = ''
      // Refresh dashboard data
      window.location.reload()
    }, 2000)
  } catch (error) {
    employeeError.value = error.message || 'An error occurred while adding the employee'
    console.error('Add employee error:', error)
  } finally {
    employeeLoading.value = false
  }
}

// Data states for all components
const employeesList = ref([])
const departmentsList = ref([])
const attendanceRecords = ref([])
const loading = ref(false)
const error = ref('')

// Pagination and filtering
const employeePage = ref(1)
const employeeLimit = ref(10)
const attendancePage = ref(1)
const attendanceLimit = ref(10)
const attendanceStatusFilter = ref('all')

// Refresh interval ID
let refreshIntervalId = null

/**
 * Fetch all dashboard data
 */
const fetchDashboardData = async () => {
  try {
    loading.value = true
    error.value = ''

    // Fetch all data in parallel
    const [overview, analytics, realtime, empList, depts, attRecords] = await Promise.allSettled([
      dashboardService.getOrgDashboardOverview(),
      dashboardService.getOrgAnalytics(),
      dashboardService.getRealTimeCheckins(),
      dashboardService.getOrganizationUsers(1, 100),
      dashboardService.getOrganizationDepartments(),
      dashboardService.getOrganizationAttendance(1, 100),
    ])

    // Process overview statistics
    if (overview.status === 'fulfilled' && overview.value?.data?.statistics) {
      const stat = overview.value.data.statistics
      stats.value.totalEmployees = stat.totalEmployees || 0
      stats.value.presentToday = stat.presentToday || 0
      stats.value.absentToday = stat.absentToday || 0
      stats.value.lateCheckins = stat.lateToday || 0
      stats.value.avgHours = stat.avgHoursToday || '0.0'
    }

    // Process analytics for weekly chart
    if (analytics.status === 'fulfilled' && analytics.value?.weekly) {
      chartData.value.labels = analytics.value.weekly.map((d) => {
        const dt = new Date(d.date)
        return dt.toLocaleDateString(undefined, { weekday: 'short' })
      })
      chartData.value.datasets[0].data = analytics.value.weekly.map((d) => d.attendanceCount || 0)
    }

    // Process real-time checkins for hourly chart
    if (realtime.status === 'fulfilled' && realtime.value?.labels) {
      realtimeChartData.value.labels = realtime.value.labels
      realtimeChartData.value.datasets[0].data = realtime.value.data
    }

    // Process employee list
    if (empList.status === 'fulfilled' && empList.value?.data?.users) {
      employeesList.value = empList.value.data.users
    }

    // Process departments
    if (depts.status === 'fulfilled' && depts.value?.data) {
      departmentsList.value = depts.value.data
    }

    // Process attendance records
    if (attRecords.status === 'fulfilled' && attRecords.value?.data?.attendance) {
      attendanceRecords.value = attRecords.value.data.attendance
    }

    // Process recent activity
    try {
      const activity = await dashboardService.getRecentActivity(10)
      if (Array.isArray(activity)) {
        recentActivity.value = activity.map((item) => ({
          text: `${item.user?.firstName || 'Employee'} ${item.user?.lastName || ''} - ${item.status}`,
          time: timeAgo(new Date(item.time)),
          dotColor: item.status === 'Present' ? 'bg-accent-500' : 'bg-danger-500',
        }))
      }
    } catch (e) {
      console.error('Failed to load recent activity:', e)
    }

    stats.value.planName = 'Free'
    stats.value.planStatus = 'Active'
    chartReady.value = true
  } catch (err) {
    console.error('Dashboard data loading error:', err)
    error.value = 'Failed to load dashboard data'
    chartReady.value = true
  } finally {
    loading.value = false
  }
}

/**
 * Refresh dashboard data every 30 seconds
 */
const startAutoRefresh = () => {
  if (refreshIntervalId) clearInterval(refreshIntervalId)
  refreshIntervalId = setInterval(() => {
    fetchDashboardData()
  }, 30000) // Refresh every 30 seconds
}

/**
 * Manual refresh
 */
const refreshDashboard = async () => {
  await fetchDashboardData()
}

/**
 * Generate Attendance Report
 */
const generateReport = async () => {
  try {
    loading.value = true
    const reportData = {
      date: new Date().toLocaleDateString(),
      totalEmployees: stats.value.totalEmployees,
      presentToday: stats.value.presentToday,
      absentToday: stats.value.absentToday,
      lateToday: stats.value.lateCheckins,
      departments: departmentsList.value,
      attendanceRecords: attendanceRecords.value,
    }

    // Create CSV content
    let csv = 'Attendance Report\n'
    csv += `Generated: ${new Date().toLocaleString()}\n\n`
    csv += `Total Employees,${stats.value.totalEmployees}\n`
    csv += `Present Today,${stats.value.presentToday}\n`
    csv += `Absent Today,${stats.value.absentToday}\n`
    csv += `Late Today,${stats.value.lateCheckins}\n\n`
    csv += 'Employee,Status,Date/Time\n'

    attendanceRecords.value.forEach((rec) => {
      csv += `"${rec.user?.firstName} ${rec.user?.lastName}","${rec.status}","${new Date(rec.date).toLocaleString()}"\n`
    })

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `attendance-report-${new Date().getTime()}.csv`
    link.click()
    window.URL.revokeObjectURL(url)

    console.log('Report generated successfully')
  } catch (e) {
    console.error('Report generation error:', e)
    error.value = 'Failed to generate report'
  } finally {
    loading.value = false
  }
}

/**
 * Create QR Code for check-in
 */
const createQRCode = () => {
  try {
    const orgId = authStore.user?.orgId
    const qrData = {
      type: 'attendance_checkin',
      orgId: orgId,
      timestamp: new Date().getTime(),
    }

    const qrText = JSON.stringify(qrData)
    const encodedQR = encodeURIComponent(qrText)

    // Using QR code API
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedQR}`

    // Open in new window or download
    window.open(qrImageUrl, '_blank')
    console.log('QR Code created')
  } catch (e) {
    console.error('QR code creation error:', e)
    error.value = 'Failed to create QR code'
  }
}

/**
 * Create Geofence
 */
const createGeofence = () => {
  try {
    // TODO: Implement geofence creation with location input
    console.log('Geofence creation modal should be opened')
  } catch (e) {
    console.error('Geofence creation error:', e)
    error.value = 'Failed to create geofence'
  }
}

onMounted(async () => {
  // Initial load
  await fetchDashboardData()
  
  // Start auto-refresh
  startAutoRefresh()
})

// Cleanup on unmount
onBeforeUnmount(() => {
  if (refreshIntervalId) {
    clearInterval(refreshIntervalId)
  }
})
</script>
