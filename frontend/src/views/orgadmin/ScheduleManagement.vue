<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Schedule Management</h1>
        <p class="text-gray-600 mt-2">Assign employees to shifts and manage schedules</p>
      </div>
      <button
        @click="showAddModal = true"
        class="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
      >
        + Create Schedule
      </button>
    </div>

    <!-- Calendar View -->
    <div class="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-semibold text-gray-900">Weekly Schedule</h2>
        <div class="flex gap-2">
          <button @click="previousWeek" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">← Prev</button>
          <button @click="nextWeek" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Next →</button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900">Employee</th>
              <th v-for="day in weekDays" :key="day" class="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                {{ day }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="emp in employees" :key="emp.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-gray-900">{{ emp.firstName }} {{ emp.lastName }}</td>
              <td v-for="day in weekDays" :key="day" class="px-4 py-3 text-center">
                <select
                  class="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  @change="(e) => assignShift(emp.id, day, e.target.value)"
                >
                  <option value="">Off</option>
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-6 flex gap-3">
        <button @click="saveSchedule" class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
          Save Schedule
        </button>
        <button @click="publishSchedule" class="px-6 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 font-medium">
          Publish
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const showAddModal = ref(false)
const currentWeek = ref(new Date())
const employees = ref([])
const schedules = ref({})

const weekDays = computed(() => {
  const days = []
  const startOfWeek = new Date(currentWeek.value)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(date.getDate() + i)
    days.push(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }))
  }
  return days
})

function previousWeek() {
  currentWeek.value.setDate(currentWeek.value.getDate() - 7)
}

function nextWeek() {
  currentWeek.value.setDate(currentWeek.value.getDate() + 7)
}

function assignShift(empId, day, shift) {
  if (!schedules.value[empId]) {
    schedules.value[empId] = {}
  }
  schedules.value[empId][day] = shift
}

async function saveSchedule() {
  console.log('Schedule saved:', schedules.value)
  alert('Schedule saved successfully!')
}

async function publishSchedule() {
  console.log('Schedule published:', schedules.value)
  alert('Schedule published to all employees!')
}

async function fetchEmployees() {
  employees.value = [
    { id: 1, firstName: 'John', lastName: 'Doe' },
    { id: 2, firstName: 'Jane', lastName: 'Smith' },
    { id: 3, firstName: 'Bob', lastName: 'Wilson' },
    { id: 4, firstName: 'Alice', lastName: 'Johnson' }
  ]
}

onMounted(fetchEmployees)
</script>
