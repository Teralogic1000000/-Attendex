/**
 * Shift Validation Service
 * Handles user shift and schedule validation for attendance
 */

import prisma from '../config/prisma.js';

/**
 * Check if current time falls within any of user's assigned shifts
 * 
 * @param {string} userId - User ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<object>} { isWithinShift, currentShift, allShifts, message }
 */
export const validateUserShift = async (userId, organizationId) => {
  try {
    // Fetch user with department assignment
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        position: true,
        departmentId: true,
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!user) {
      return {
        isWithinShift: false,
        currentShift: null,
        allShifts: [],
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      };
    }

    // Verify user belongs to organization
    if (user.organization.id !== organizationId) {
      return {
        isWithinShift: false,
        currentShift: null,
        allShifts: [],
        message: 'User does not belong to this organization',
        error: 'ORG_MISMATCH'
      };
    }

    // Fetch all shifts for organization
    const allShifts = await prisma.shift.findMany({
      where: { orgId: organizationId },
      select: {
        id: true,
        name: true,
        startTime: true,
        endTime: true,
        status: true
      }
    });

    if (allShifts.length === 0) {
      // No shifts configured - allow check-in
      return {
        isWithinShift: true,
        currentShift: null,
        allShifts: [],
        message: 'No shifts configured for organization',
        isConfigured: false
      };
    }

    // Get current time components
    const now = new Date();
    const currentTimeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Find matching current shift
    const currentShift = allShifts.find((shift) => {
      if (shift.status !== 'Active') {
        return false;
      }

      // Handle shifts that don't cross midnight
      if (shift.startTime <= shift.endTime) {
        return currentTimeString >= shift.startTime && currentTimeString <= shift.endTime;
      }

      // Handle shifts that cross midnight (e.g., 22:00 - 06:00)
      return currentTimeString >= shift.startTime || currentTimeString <= shift.endTime;
    });

    if (currentShift) {
      return {
        isWithinShift: true,
        currentShift: {
          id: currentShift.id,
          name: currentShift.name,
          startTime: currentShift.startTime,
          endTime: currentShift.endTime
        },
        allShifts: allShifts.map((s) => ({
          id: s.id,
          name: s.name,
          startTime: s.startTime,
          endTime: s.endTime,
          isCurrent: s.id === currentShift.id
        })),
        message: `Check-in within shift: ${currentShift.name}`,
        isConfigured: true
      };
    }

    // Not within any shift
    return {
      isWithinShift: false,
      currentShift: null,
      allShifts: allShifts.map((s) => ({
        id: s.id,
        name: s.name,
        startTime: s.startTime,
        endTime: s.endTime
      })),
      message: `Current time ${currentTimeString} does not match any active shift`,
      error: 'OUTSIDE_SHIFT_HOURS',
      currentTime: currentTimeString,
      isConfigured: true
    };
  } catch (error) {
    console.error('Shift validation error:', error);
    return {
      isWithinShift: false,
      currentShift: null,
      allShifts: [],
      message: `Shift validation failed: ${error.message}`,
      error: 'SHIFT_VALIDATION_ERROR'
    };
  }
};

/**
 * Get user's shift for a specific date
 * Useful for historical attendance tracking
 * 
 * @param {string} userId - User ID
 * @param {string} orgId - Organization ID
 * @param {Date} date - Date to check shift for
 * @returns {Promise<object>} Shift information or null
 */
export const getUserShiftForDate = async (userId, orgId, date) => {
  try {
    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = date.getDay();

    // For now, assume same shift schedule every day
    // In production, you might have weekly schedules or shift rotations
    const shifts = await prisma.shift.findMany({
      where: {
        orgId,
        status: 'Active'
      },
      select: {
        id: true,
        name: true,
        startTime: true,
        endTime: true
      }
    });

    if (shifts.length === 0) {
      return null;
    }

    // Return first active shift (in production, implement proper shift rotation logic)
    return shifts[0];
  } catch (error) {
    console.error('Error fetching user shift for date:', error);
    return null;
  }
};

/**
 * Check if user is on leave/absent on a given date
 * Checks for approved leave requests
 * 
 * @param {string} userId - User ID
 * @param {Date} date - Date to check
 * @returns {Promise<boolean>} True if user is on approved leave
 */
export const isUserOnLeave = async (userId, date) => {
  try {
    // This is a placeholder for future leave management system
    // You'll need to implement a Leave/LeaveRequest model
    
    // For now, always return false (not on leave)
    return false;
  } catch (error) {
    console.error('Error checking leave status:', error);
    return false;
  }
};

/**
 * Get shift details for organization
 * 
 * @param {string} orgId - Organization ID
 * @returns {Promise<array>} Array of shifts
 */
export const getOrganizationShifts = async (orgId) => {
  try {
    const shifts = await prisma.shift.findMany({
      where: { orgId },
      select: {
        id: true,
        name: true,
        startTime: true,
        endTime: true,
        status: true
      },
      orderBy: { startTime: 'asc' }
    });

    return shifts;
  } catch (error) {
    console.error('Error fetching organization shifts:', error);
    return [];
  }
};

/**
 * Format time string from HH:mm format
 * 
 * @param {string} timeStr - Time in HH:mm format
 * @returns {object} { hours, minutes, totalMinutes }
 */
const parseTimeString = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return {
    hours,
    minutes,
    totalMinutes: hours * 60 + minutes
  };
};

/**
 * Check if check-in time is within early/late buffer
 * Useful for allowing early arrival or late checkout
 * 
 * @param {string} currentTime - Current time in HH:mm format
 * @param {string} shiftStartTime - Shift start time in HH:mm format
 * @param {number} bufferMinutes - Buffer in minutes (default 15)
 * @returns {boolean} True if within buffer window
 */
export const isWithinShiftBuffer = (currentTime, shiftStartTime, bufferMinutes = 15) => {
  const current = parseTimeString(currentTime);
  const shiftStart = parseTimeString(shiftStartTime);

  const diffMinutes = shiftStart.totalMinutes - current.totalMinutes;
  return diffMinutes >= 0 && diffMinutes <= bufferMinutes;
};

export default {
  validateUserShift,
  getUserShiftForDate,
  isUserOnLeave,
  getOrganizationShifts,
  isWithinShiftBuffer
};
