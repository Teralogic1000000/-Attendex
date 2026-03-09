/**
 * Device Controller
 * Handles device management and tracking
 */

import supabase from '../config/supabaseClient.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Get all devices for organization
 */
export const getDevices = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('Device')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  return successResponse(res, 'Devices retrieved successfully', {
    count: data?.length || 0,
    data: data || []
  });
});

/**
 * Get device by ID
 */
export const getDeviceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('Device')
    .select('*')
    .eq('Device_ID', id)
    .single();

  if (error || !data) {
    return errorResponse(res, 'Device not found', 404);
  }

  return successResponse(res, 'Device retrieved successfully', data);
});

/**
 * Create new device
 * Body: { deviceName, deviceModel, osType, osVersion, ipAddress }
 */
export const createDevice = asyncHandler(async (req, res) => {
  const { deviceName, deviceModel, osType, osVersion, ipAddress } = req.body;

  if (!deviceName || !ipAddress) {
    return errorResponse(res, 'Device name and IP address are required', 400);
  }

  const { data, error } = await supabase
    .from('Device')
    .insert([{
      Device_Name: deviceName,
      Device_Model: deviceModel,
      OS_Type: osType,
      OS_Version: osVersion,
      IP_Address: ipAddress,
      Last_Used: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  return successResponse(res, 'Device created successfully', data, 201);
});

/**
 * Update device information
 */
export const updateDevice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { deviceName, deviceModel, osType, osVersion, ipAddress } = req.body;

  const { data, error } = await supabase
    .from('Device')
    .update({
      Device_Name: deviceName,
      Device_Model: deviceModel,
      OS_Type: osType,
      OS_Version: osVersion,
      IP_Address: ipAddress,
      updatedAt: new Date().toISOString()
    })
    .eq('Device_ID', id)
    .select()
    .single();

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  return successResponse(res, 'Device updated successfully', data);
});

/**
 * Update device last used timestamp
 */
export const updateDeviceLastUsed = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('Device')
    .update({ Last_Used: new Date().toISOString() })
    .eq('Device_ID', id)
    .select()
    .single();

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  return successResponse(res, 'Device updated successfully', data);
});

/**
 * Delete device
 */
export const deleteDevice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if device is in use
  const { data: userWithDevice } = await supabase
    .from('User')
    .select('id')
    .eq('Device_ID', id)
    .single();

  if (userWithDevice) {
    return errorResponse(res, 'Cannot delete device in use by a user', 400);
  }

  const { error } = await supabase
    .from('Device')
    .delete()
    .eq('Device_ID', id);

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  return successResponse(res, 'Device deleted successfully');
});

/**
 * Get devices by IP address
 */
export const getDevicesByIP = asyncHandler(async (req, res) => {
  const { ipAddress } = req.query;

  if (!ipAddress) {
    return errorResponse(res, 'IP address is required', 400);
  }

  const { data, error } = await supabase
    .from('Device')
    .select('*')
    .eq('IP_Address', ipAddress)
    .order('Last_Used', { ascending: false });

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  return successResponse(res, 'Devices retrieved successfully', {
    count: data?.length || 0,
    data: data || []
  });
});
