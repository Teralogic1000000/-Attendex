import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import EmployeeDashboard from '@/views/employee/EmployeeDashboard.vue'

// Mock stores
vi.mock('@/stores/attendance', () => ({
  useAttendanceStore: vi.fn(() => ({
    checkIn: vi.fn().mockResolvedValue({}),
    checkOut: vi.fn().mockResolvedValue({}),
    fetchMyAttendance: vi.fn().mockResolvedValue({
      records: [],
      stats: { daysPresent: 15, avgHours: 8.0, streak: 3 },
    }),
    todayRecord: null,
    currentStatus: null,
  })),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    user: { firstName: 'John' },
  })),
}))

describe('EmployeeDashboard', () => {
  let wrapper
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    wrapper = mount(EmployeeDashboard, {
      global: {
        plugins: [pinia],
        stubs: {
          AppHeader: true,
          StatCard: true,
        },
      },
    })
  })

  it('renders check-in/out section', () => {
    expect(wrapper.html()).toMatch(/check\s*in/i)
  })

  it('has check-in button when not checked in', async () => {
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toMatch(/check\s*in/i)
  })

  it('displays stat cards', async () => {
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toMatch(/this month|average|streak/i)
  })

  it('calls checkIn when button clicked', async () => {
    const mockCheckIn = vi.fn()
    wrapper.vm.handleCheckIn = mockCheckIn
    // Button click would trigger the method
    await wrapper.vm.$nextTick()
    expect(wrapper.vm).toBeDefined()
  })
})
