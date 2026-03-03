<template>
  <div>
    <AppHeader title="SuperAdmin Dashboard" subtitle="System-wide platform management" />

    <div class="p-6 flex flex-col gap-6">
      <!-- Overview Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" v-if="systemOverview.organizations">
        <StatCard
          title="Total Organizations"
          :value="formatNumber(systemOverview.organizations?.total)"
          :subtitle="`${systemOverview.organizations?.active} active`"
          :icon="Building2"
          color="org"
        />
        <StatCard
          title="Total Users"
          :value="formatNumber(systemOverview.users?.total)"
          :subtitle="`${systemOverview.users?.active} active`"
          :icon="Users"
          color="org"
        />
        <StatCard
          title="Attendance Records"
          :value="formatNumber(systemOverview.attendance?.total)"
          :icon="Calendar"
          color="org"
        />
        <StatCard
          title="Active Subscriptions"
          :value="formatNumber(systemOverview.subscriptions?.total)"
          :subtitle="`${systemOverview.subscriptions?.activePaid} paid`"
          :icon="CreditCard"
          color="org"
        />
      </div>

      <!-- Tabs for different sections -->
      <div class="card p-6">
        <div class="flex gap-4 border-b mb-6">
          <button
            v-for="tab in tabs"
            :key="tab"
            @click="activeTab = tab"
            :class="[
              'px-4 py-2 font-medium transition',
              activeTab === tab
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-700'
            ]"
          >
            {{ tab }}
          </button>
        </div>

        <!-- Organizations Tab -->
        <div v-if="activeTab === 'Organizations'" class="space-y-4">
          <div class="flex justify-between items-center">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search organizations..."
              class="px-4 py-2 border rounded"
            />
            <button class="btn btn-primary" @click="showCreateOrgModal = true">
              + New Organization
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-100">
                <tr>
                  <th class="px-4 py-2 text-left">Name</th>
                  <th class="px-4 py-2 text-left">Email</th>
                  <th class="px-4 py-2 text-left">Users</th>
                  <th class="px-4 py-2 text-left">Subscription</th>
                  <th class="px-4 py-2 text-left">Status</th>
                  <th class="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="org in filteredOrganizations" :key="org.id" class="border-b hover:bg-slate-50">
                  <td class="px-4 py-2 font-medium">{{ org.name }}</td>
                  <td class="px-4 py-2">{{ org.email }}</td>
                  <td class="px-4 py-2">{{ org.userCount }}</td>
                  <td class="px-4 py-2">{{ org.subscription?.planName || 'None' }}</td>
                  <td class="px-4 py-2">
                    <span
                      :class="[
                        'px-2 py-1 rounded text-xs font-medium',
                        org.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      ]"
                    >
                      {{ org.status }}
                    </span>
                  </td>
                  <td class="px-4 py-2">
                    <div class="flex gap-2">
                      <button
                        v-if="org.status === 'ACTIVE'"
                        @click="suspendOrg(org.id)"
                        class="text-xs text-red-600 hover:text-red-800"
                      >
                        Suspend
                      </button>
                      <button
                        v-else
                        @click="reactivateOrg(org.id)"
                        class="text-xs text-green-600 hover:text-green-800"
                      >
                        Reactivate
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Users Tab -->
        <div v-if="activeTab === 'Users'" class="space-y-4">
          <div class="flex justify-between items-center">
            <input
              v-model="userSearchQuery"
              type="text"
              placeholder="Search users..."
              class="px-4 py-2 border rounded"
            />
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-100">
                <tr>
                  <th class="px-4 py-2 text-left">Name</th>
                  <th class="px-4 py-2 text-left">Email</th>
                  <th class="px-4 py-2 text-left">Organization</th>
                  <th class="px-4 py-2 text-left">Role</th>
                  <th class="px-4 py-2 text-left">Status</th>
                  <th class="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.id" class="border-b hover:bg-slate-50">
                  <td class="px-4 py-2 font-medium">{{ user.firstName }} {{ user.lastName }}</td>
                  <td class="px-4 py-2">{{ user.email }}</td>
                  <td class="px-4 py-2">{{ user.organization?.name || 'N/A' }}</td>
                  <td class="px-4 py-2">{{ user.role?.name }}</td>
                  <td class="px-4 py-2">
                    <span
                      :class="[
                        'px-2 py-1 rounded text-xs font-medium',
                        user.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      ]"
                    >
                      {{ user.status }}
                    </span>
                  </td>
                  <td class="px-4 py-2">
                    <div class="flex gap-2">
                      <button
                        v-if="user.status === 'ACTIVE'"
                        @click="disableUserAction(user.id)"
                        class="text-xs text-red-600 hover:text-red-800"
                      >
                        Disable
                      </button>
                      <button
                        v-else
                        @click="enableUserAction(user.id)"
                        class="text-xs text-green-600 hover:text-green-800"
                      >
                        Enable
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Analytics Tab -->
        <div v-if="activeTab === 'Analytics'" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="p-4 bg-slate-50 rounded">
              <p class="text-slate-600 text-sm">New Organizations (30d)</p>
              <p class="text-2xl font-bold">{{ systemAnalytics.metrics?.newOrganizations || 0 }}</p>
            </div>
            <div class="p-4 bg-slate-50 rounded">
              <p class="text-slate-600 text-sm">New Users (30d)</p>
              <p class="text-2xl font-bold">{{ systemAnalytics.metrics?.newUsers || 0 }}</p>
            </div>
            <div class="p-4 bg-slate-50 rounded">
              <p class="text-slate-600 text-sm">New Attendance Records (30d)</p>
              <p class="text-2xl font-bold">{{ systemAnalytics.metrics?.newAttendanceRecords || 0 }}</p>
            </div>
          </div>
        </div>

        <!-- Billing Tab -->
        <div v-if="activeTab === 'Billing'" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="p-4 bg-slate-50 rounded">
              <p class="text-slate-600 text-sm">Total MRR</p>
              <p class="text-2xl font-bold">${{ billingOverview.totalMRR || 0 }}</p>
            </div>
            <div class="p-4 bg-slate-50 rounded">
              <p class="text-slate-600 text-sm">Active Subscriptions</p>
              <p class="text-2xl font-bold">{{ billingOverview.activeSubscriptions || 0 }}</p>
            </div>
          </div>
        </div>

        <!-- Audit Logs Tab -->
        <div v-if="activeTab === 'Audit Logs'" class="space-y-4">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-slate-100">
                <tr>
                  <th class="px-4 py-2 text-left">Action</th>
                  <th class="px-4 py-2 text-left">Resource</th>
                  <th class="px-4 py-2 text-left">User</th>
                  <th class="px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in auditLogs.slice(0, 10)" :key="log.id" class="border-b">
                  <td class="px-4 py-2 font-medium">{{ log.action }}</td>
                  <td class="px-4 py-2">{{ log.resource }}</td>
                  <td class="px-4 py-2">{{ log.user?.email || 'System' }}</td>
                  <td class="px-4 py-2 text-xs text-slate-500">{{ formatDate(log.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Building2, Users, Calendar, CreditCard } from 'lucide-vue-next'
import AppHeader from '@/components/common/AppHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import { useSuperAdminStore } from '@/stores/superAdminDash'
import { formatNumber, formatDate } from '@/utils/helpers'

const superAdminStore = useSuperAdminStore()

const activeTab = ref('Organizations')
const tabs = ['Organizations', 'Users', 'Analytics', 'Billing', 'Audit Logs']
const searchQuery = ref('')
const userSearchQuery = ref('')
const showCreateOrgModal = ref(false)

const {
  organizations,
  users,
  systemOverview,
  systemAnalytics,
  auditLogs,
  billingOverview,
  loading
} = superAdminStore

const filteredOrganizations = computed(() => {
  return organizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    org.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const filteredUsers = computed(() => {
  return users.filter(user =>
    user.email.toLowerCase().includes(userSearchQuery.value.toLowerCase()) ||
    user.firstName.toLowerCase().includes(userSearchQuery.value.toLowerCase()) ||
    user.lastName.toLowerCase().includes(userSearchQuery.value.toLowerCase())
  )
})

const suspendOrg = async (orgId) => {
  const reason = prompt('Enter suspension reason:')
  if (reason) {
    try {
      await superAdminStore.suspendOrganization(orgId, reason)
      await superAdminStore.fetchOrganizations()
    } catch (err) {
      alert('Failed to suspend organization')
    }
  }
}

const reactivateOrg = async (orgId) => {
  try {
    await superAdminStore.reactivateOrganization(orgId)
    await superAdminStore.fetchOrganizations()
  } catch (err) {
    alert('Failed to reactivate organization')
  }
}

const disableUserAction = async (userId) => {
  const reason = prompt('Enter disable reason:')
  if (reason) {
    try {
      await superAdminStore.disableUser(userId, reason)
      await superAdminStore.fetchUsers()
    } catch (err) {
      alert('Failed to disable user')
    }
  }
}

const enableUserAction = async (userId) => {
  try {
    await superAdminStore.enableUser(userId)
    await superAdminStore.fetchUsers()
  } catch (err) {
    alert('Failed to enable user')
  }
}

onMounted(async () => {
  try {
    await Promise.all([
      superAdminStore.fetchSystemOverview(),
      superAdminStore.fetchOrganizations(),
      superAdminStore.fetchUsers(),
      superAdminStore.fetchSystemAnalytics(),
      superAdminStore.fetchBillingOverview(),
      superAdminStore.fetchAuditLogs()
    ])
  } catch (err) {
    console.error('Failed to load dashboard:', err)
  }
})
</script>
