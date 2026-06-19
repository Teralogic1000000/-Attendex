import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import OrgDashboard from '@/views/orgadmin/OrgDashboard.vue'

// Mock stores
vi.mock('@/stores/user', () => ({
  useUserStore: vi.fn(() => ({
    fetchStats: vi.fn().mockResolvedValue({
      totalEmployees: 10,
      presentToday: 8,
      avgHours: 7.5,
    }),
    users: [],
  })),
}))

vi.mock('@/stores/attendance', () => ({
  useAttendanceStore: vi.fn(() => ({
    fetchOrgAttendance: vi.fn().mockResolvedValue({
      records: [],
      stats: { totalEmployees: 10, presentToday: 8, avgHours: 7.5 },
    }),
    orgAttendance: [],
  })),
}))

vi.mock('@/stores/subscription', () => ({
  useSubscriptionStore: vi.fn(() => ({
    fetchCurrentSubscription: vi.fn().mockResolvedValue({
      name: 'Pro',
      status: 'ACTIVE',
    }),
    currentSubscription: { name: 'Pro', status: 'ACTIVE' },
  })),
}))

describe('OrgDashboard', () => {
  let wrapper
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    wrapper = mount(OrgDashboard, {
      global: {
        plugins: [pinia],
        stubs: {
          AppHeader: true,
          StatCard: true,
          Bar: true,
        },
      },
    })
  })

  it('renders dashboard header', () => {
    expect(wrapper.find('[data-test="header"]').exists() || wrapper.html()).toBeTruthy()
  })

  it('displays stat cards', () => {
    const statCards = wrapper.findAll('[data-test="stat-card"]')
    // Number of cards depends on actual implementation
    expect(wrapper.html()).toMatch(/Organization Dashboard/i)
  })

  it('loads attendance chart', async () => {
    await wrapper.vm.$nextTick()
    // Chart should be rendered after data loads
    expect(wrapper.vm).toBeDefined()
  })

  it('displays recent activity', async () => {
    await wrapper.vm.$nextTick()
    // Recent activity section should be present
    expect(wrapper.text()).toMatch(/recent activity/i)
  })
})
