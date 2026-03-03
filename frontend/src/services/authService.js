import api from './api'

export default {
  login(credentials) {
    return api.post('/auth/login', credentials).then((res) => res.data.data)
  },

  register(data) {
    return api.post('/auth/register', data).then((res) => res.data.data)
  },

  // backend currently exposes `/api/auth/refresh`
  // (authRoutes.js defines router.post('/refresh', ...))
  refreshToken(refreshToken) {
    return api.post('/auth/refresh', { refreshToken }).then((res) => res.data.data)
  },

  // password reset is not implemented on the server yet; keep the
  // function so the UI doesn't crash but it will return a 501 if called.
  forgotPassword(email) {
    // return api.post('/auth/forgot-password', { email })
    return Promise.reject(
      new Error('Forgot password endpoint is not available on the backend')
    )
  },

  // no `/auth/profile` route exists server‑side, so this helper is unused
  // and will also 404 if invoked.  Remove when the backend provides it.
  getProfile() {
    return api.get('/auth/profile').then((res) => res.data.data)
  },
}
