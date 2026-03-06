<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-900">Reports</h1>
      <p class="text-slate-600 mt-1">Generate and view attendance reports</p>
    </div>

    <!-- Report Filters -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
      <h2 class="text-lg font-bold text-slate-900 mb-4">Report Filters</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
          <select
            v-model="reportType"
            class="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="attendance">Attendance Summary</option>
            <option value="department">Department Report</option>
            <option value="employee">Employee Report</option>
            <option value="late">Late Arrivals</option>
            <option value="absent">Absences</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            v-model="startDate"
            type="date"
            class="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            v-model="endDate"
            type="date"
            class="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
        </div>

        <div class="flex items-end gap-2">
          <button
            @click="generateReport"
            :disabled="loading"
            class="flex-1 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 shadow-sm hover:shadow-md"
          >
            {{ loading ? 'Generating...' : 'Generate' }}
          </button>
          
          <button
            @click="generateReport"
            :disabled="loading"
            class="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium disabled:opacity-50"
            title="Refresh report"
          >
            {{ loading ? '⟳' : '⟳ Refresh' }}
          </button>
          
          <button
            @click="exportReport"
            class="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>

    <!-- Last Updated Info -->
    <div v-if="lastUpdated" class="mb-4 text-right text-xs text-slate-500">
      Last updated: {{ formatTime(lastUpdated) }}
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-600 text-sm font-medium">Total Present</p>
            <p class="text-3xl font-bold text-slate-900 mt-2">{{ reportStats.totalPresent }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">✓</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-600 text-sm font-medium">Total Absent</p>
            <p class="text-3xl font-bold text-slate-900 mt-2">{{ reportStats.totalAbsent }}</p>
          </div>
          <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">✕</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-600 text-sm font-medium">Total Late</p>
            <p class="text-3xl font-bold text-slate-900 mt-2">{{ reportStats.totalLate }}</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">⚠</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-slate-600 text-sm font-medium">Attendance Rate</p>
            <p class="text-3xl font-bold text-slate-900 mt-2">{{ reportStats.attendanceRate }}%</p>
          </div>
          <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">📊</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Data Table -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-slate-500">
        Loading report...
      </div>
      <div v-else-if="reportData.length === 0" class="p-8 text-center text-slate-500">
        No data available for selected filters
      </div>
      <table v-else class="w-full">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Employee</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Department</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase">Check In</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase">Check Out</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr v-for="row in reportData" :key="`${row.date}-${row.employee}`" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-3 text-slate-600">{{ row.date }}</td>
            <td class="px-6 py-3 font-medium text-slate-900">{{ row.employee }}</td>
            <td class="px-6 py-3 text-slate-600">{{ row.department }}</td>
            <td class="px-6 py-3">
              <span :class="[
                'px-3 py-1 rounded-full text-xs font-medium',
                row.status === 'Present' ? 'bg-green-100 text-green-700' :
                row.status === 'Absent' ? 'bg-red-100 text-red-700' :
                row.status === 'Late' ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
              ]">
                {{ row.status }}
              </span>
            </td>
            <td class="px-6 py-3 text-center text-slate-600">{{ row.checkIn || '-' }}</td>
            <td class="px-6 py-3 text-center text-slate-600">{{ row.checkOut || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import reportsService from '@/services/reportsService'

const reportType = ref('attendance')
const startDate = ref('')
const endDate = ref('')
const loading = ref(false)
const reportData = ref([])

const reportStats = ref({
  totalPresent: 0,
  totalAbsent: 0,
  totalLate: 0,
  attendanceRate: 0
})

const generateReport = async () => {
  loading.value = true
  
  try {
    const params = {
      startDate: startDate.value,
      endDate: endDate.value
    }

    let data = []
    
    // Call the appropriate service method based on report type
    switch(reportType.value) {
      case 'department':
        data = await reportsService.generateDepartmentReport(null, params)
        break
      case 'employee':
        data = await reportsService.generateEmployeeReport(null, params)
        break
      case 'late':
        data = await reportsService.getLateArrivalsReport(params)
        break
      case 'absent':
        data = await reportsService.getAbsencesReport(params)
        break
      default:
        data = await reportsService.generateAttendanceReport(params)
    }

    reportData.value = Array.isArray(data) ? data : []

    // Calculate statistics
    const present = reportData.value.filter(r => r.status === 'Present').length
    const absent = reportData.value.filter(r => r.status === 'Absent').length
    const late = reportData.value.filter(r => r.status === 'Late').length
    const total = reportData.value.length

    reportStats.value = {
      totalPresent: present,
      totalAbsent: absent,
      totalLate: late,
      attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0
    }

    loading.value = false
  } catch (error) {
    console.error('Error generating report:', error)
    loading.value = false
  }
}

const exportReport = async () => {
  if (reportData.value.length === 0) {
    alert('Please generate a report first')
    return
  }

  try {
    // Download report as CSV
    const blob = await reportsService.exportReportAsCSV(reportType.value, {
      startDate: startDate.value,
      endDate: endDate.value
    })

    // Create download link
    const element = document.createElement('a')
    element.setAttribute('href', URL.createObjectURL(blob))
    element.setAttribute('download', `attendance-report-${new Date().toISOString().split('T')[0]}.csv`)
    element.style.display = 'none'
    
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    
    alert('Report exported successfully!')
  } catch (error) {
    console.error('Error exporting report:', error)
    alert('Error exporting report')
  }
}

// Set default date range to current month
const getCurrentMonthDateRange = () => {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  startDate.value = firstDay.toISOString().split('T')[0]
  endDate.value = lastDay.toISOString().split('T')[0]
}

// Initialize on component mount
const initializeReport = () => {
  getCurrentMonthDateRange()
  generateReport()
}

onMounted(() => {
  initializeReport()
})
</script>
