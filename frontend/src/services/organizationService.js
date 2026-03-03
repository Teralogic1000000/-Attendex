import api from './api'

export default {
  // note: id parameter is ignored now because the server uses auth token to
  // determine current organization.  keep signature for backwards compat.
  updateOrganization(idOrData, data) {
    // allow either call signature updateOrganization(data) or
    // updateOrganization(id, data)
    const payload = data || idOrData
    return api.put(`/organization`, payload)
  },

  getOrganization(id) {
    // if id provided, fall back to superadmin path; otherwise use current org.
    if (id) {
      return api.get(`/superadmin/organizations/${id}`)
    }
    return api.get(`/organization`)
  },
}
