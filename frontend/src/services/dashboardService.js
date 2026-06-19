/**
 * Dashboard Service
 * Handles API calls for organization dashboard data
 */

import { useAuthStore } from '@/stores/auth';

class DashboardService {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
    this.timeout = 30000; // 30 seconds
  }

  /**
   * Get auth headers
   */
  getHeaders() {
    const authStore = useAuthStore();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authStore.accessToken}`,
    };
  }

  /**
   * Make API request
   */
  async request(endpoint, options = {}) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  /**
   * Get organization dashboard overview
   */
  async getOrgDashboardOverview() {
    return this.request('/org-dashboard/overview');
  }

  /**
   * Get attendance trends
   */
  async getAttendanceTrends(days = 30) {
    return this.request(`/org-dashboard/analytics/attendance-trends?days=${days}`);
  }

  /**
   * Get department attendance comparison
   */
  async getDepartmentComparison() {
    return this.request('/org-dashboard/analytics/department-comparison');
  }

  /**
   * Get organization users with pagination
   */
  async getOrganizationUsers(page = 1, limit = 10) {
    return this.request(`/org-dashboard/users?page=${page}&limit=${limit}`);
  }

  /**
   * Get organization attendance
   */
  async getOrganizationAttendance(page = 1, limit = 20, status = null, startDate = null) {
    let url = `/org-dashboard/attendance?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    if (startDate) {
      url += `&startDate=${startDate}`;
    }
    return this.request(url);
  }

  /**
   * Get organization departments
   */
  async getOrganizationDepartments() {
    return this.request('/org-dashboard/departments');
  }

  /**
   * Create new employee
   */
  async createEmployee(employeeData) {
    return this.request('/org-dashboard/users', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  }

  /**
   * Update employee
   */
  async updateEmployee(userId, employeeData) {
    return this.request(`/org-dashboard/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    });
  }

  /**
   * Get organization analytics (legacy, for compatibility)
   */
  async getOrgAnalytics() {
    try {
      const trends = await this.getAttendanceTrends(7);
      
      // Transform trends into weekly format for charts
      if (trends?.trends) {
        return {
          weekly: trends.trends.map(trend => ({
            date: trend.date,
            attendanceCount: trend.present || 0,
            absentCount: trend.absent || 0,
            lateCount: trend.late || 0,
          }))
        };
      }
      
      return { weekly: [] };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return { weekly: [] };
    }
  }

  /**
   * Get real-time checkins (last 6 hours grouped by hour)
   */
  async getRealTimeCheckins() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = today.toISOString();

      const attendance = await this.getOrganizationAttendance(1, 1000, null, startDate);
      
      if (attendance?.attendance) {
        // Group by hour
        const hourlyData = {};
        
        attendance.attendance.forEach(record => {
          const date = new Date(record.date);
          const hour = Math.floor(date.getHours() / 4) * 4; // Group into 4-hour blocks
          const hourKey = `${String(hour).padStart(2, '0')}:00`;
          
          hourlyData[hourKey] = (hourlyData[hourKey] || 0) + 1;
        });

        // Create time labels
        const timeLabels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
        return {
          labels: timeLabels,
          data: timeLabels.map(label => hourlyData[label] || 0)
        };
      }
      
      return { labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'], data: [0, 0, 0, 0, 0, 0] };
    } catch (error) {
      console.error('Error fetching real-time checkins:', error);
      return { labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'], data: [0, 0, 0, 0, 0, 0] };
    }
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(limit = 10) {
    try {
      const attendance = await this.getOrganizationAttendance(1, limit);
      
      if (attendance?.attendance) {
        return attendance.attendance.map(record => ({
          id: record.id,
          user: {
            firstName: record.user?.firstName,
            lastName: record.user?.lastName,
            email: record.user?.email,
          },
          status: record.status,
          time: record.date,
          type: record.status === 'Present' ? 'checkin' : 'elsewhere',
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }
}

export default new DashboardService();
