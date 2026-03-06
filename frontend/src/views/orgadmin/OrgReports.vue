<template>
  <div>
    <AppHeader title="Reports & Analytics" subtitle="Comprehensive insights into your organization's attendance and productivity" />

    <div class="p-6 space-y-6">
      <!-- Report Filters -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Generate Report</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option>Attendance Summary</option>
              <option>Productivity Report</option>
              <option>Absence Analysis</option>
              <option>Late Arrivals</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
              <option>Custom range</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option>All Departments</option>
              <option>Engineering</option>
              <option>Marketing</option>
              <option>Sales</option>
            </select>
          </div>
          <div class="flex items-end">
            <button class="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
              Generate Report
            </button>
          </div>
        </div>
      </div>

      <!-- Analytics Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Attendance Heatmap -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Attendance Heatmap</h3>
          <div class="h-64 flex items-center justify-center text-gray-500">
            <div class="text-center">
              <Calendar class="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Heatmap visualization coming soon</p>
            </div>
          </div>
        </div>

        <!-- Department Comparison -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Department Comparison</h3>
          <div class="h-64 flex items-center justify-center text-gray-500">
            <div class="text-center">
              <BarChart3 class="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Department analytics coming soon</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Reports -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div class="flex items-center space-x-4">
              <FileText class="w-8 h-8 text-primary-600" />
              <div>
                <p class="font-medium text-gray-900">Monthly Attendance Report - March 2026</p>
                <p class="text-sm text-gray-500">Generated on March 4, 2026</p>
              </div>
            </div>
            <button class="text-primary-600 hover:text-primary-700 font-medium">
              Download
            </button>
          </div>
          <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div class="flex items-center space-x-4">
              <FileText class="w-8 h-8 text-primary-600" />
              <div>
                <p class="font-medium text-gray-900">Productivity Analysis - Q1 2026</p>
                <p class="text-sm text-gray-500">Generated on February 28, 2026</p>
              </div>
            </div>
            <button class="text-primary-600 hover:text-primary-700 font-medium">
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppHeader from '@/components/common/AppHeader.vue'
import { Calendar, BarChart3, FileText } from 'lucide-vue-next'
</script>