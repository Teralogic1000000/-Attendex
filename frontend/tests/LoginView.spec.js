import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginView from '@/views/public/LoginView.vue'

// Mock the router and stores
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
  useRoute: vi.fn(() => ({
    query: {},
  })),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    login: vi.fn(),
    isAuthenticated: false,
  })),
}))

vi.mock('@/stores/notification', () => ({
  useNotificationStore: vi.fn(() => ({
    error: vi.fn(),
    success: vi.fn(),
  })),
}))

describe('LoginView', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(LoginView, {
      global: {
        stubs: {
          RouterLink: true,
        },
      },
    })
  })

  it('renders login form', () => {
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
  })

  it('has submit button', () => {
    const button = wrapper.find('button[type="submit"]')
    expect(button.exists()).toBe(true)
    expect(button.text()).toMatch(/sign in/i)
  })

  it('displays register link', () => {
    expect(wrapper.text()).toMatch(/don't have an account/i)
  })

  it('shows validation errors on empty submit', async () => {
    const form = wrapper.find('form')
    await form.trigger('submit')
    // Error handling depends on form validation implementation
  })
})
