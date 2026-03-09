/**
 * Geofence Controller
 * Handles geofence management for location-based attendance
 */

import supabase from '../config/supabaseClient.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Create geofence
 * Body: { name?, latitude, longitude, radius, orgId? }
 */
export const createGeofence = asyncHandler(async (req, res) => {
  const { name, latitude, longitude, radius } = req.body;
  const orgId = req.user.orgId;

  if (!latitude || !longitude || !radius) {
    return errorResponse(res, 'Latitude, longitude, and radius are required', 400);
  }

  const { data, error } = await supabase
    .from('Geofence')
    .insert([{
      name: name || `Geofence ${new Date().toISOString()}`,
      latitude,
      longitude,
      radius,
      orgId,
      createdAt: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  return successResponse(res, 'Geofence created successfully', data, 201);
});

/**
 * Get all geofences for organization
 */
export const getGeofences = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId;

  const { data, error } = await supabase
    .from('Geofence')
    .select('*')
    .eq('orgId', orgId)
    .order('createdAt', { ascending: false });

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  return successResponse(res, 'Geofences retrieved successfully', {
    count: data?.length || 0,
    data: data || []
  });
});

/**
 * Get geofence by ID
 */
export const getGeofenceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orgId = req.user.orgId;

  const { data, error } = await supabase
    .from('Geofence')
    .select('*')
    .eq('id', id)
    .eq('orgId', orgId)
    .single();

  if (error || !data) {
    return errorResponse(res, 'Geofence not found', 404);
  }

  return successResponse(res, 'Geofence retrieved successfully', data);
});

/**
 * Update geofence
 */
export const updateGeofence = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orgId = req.user.orgId;
  const { name, latitude, longitude, radius } = req.body;

  const { data, error } = await supabase
    .from('Geofence')
    .update({
      name,
      latitude,
      longitude,
      radius,
      updatedAt: new Date().toISOString()
    })
    .eq('id', id)
    .eq('orgId', orgId)
    .select()
    .single();

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  return successResponse(res, 'Geofence updated successfully', data);
});

/**
 * Delete geofence
 */
export const deleteGeofence = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orgId = req.user.orgId;

  const { error } = await supabase
    .from('Geofence')
    .delete()
    .eq('id', id)
    .eq('orgId', orgId);

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  return successResponse(res, 'Geofence deleted successfully');
});

/**
 * Check if user location is within any geofence
 * Body: { latitude, longitude }
 * Returns: { insideGeofence: boolean, geofences: [], distance: number }
 */
export const checkLocationInGeofence = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;
  const orgId = req.user.orgId;

  if (!latitude || !longitude) {
    return errorResponse(res, 'Latitude and longitude are required', 400);
  }

  const { data: geofences, error } = await supabase
    .from('Geofence')
    .select('*')
    .eq('orgId', orgId);

  if (error) {
    return errorResponse(res, error.message, 400);
  }

  // Check which geofences the location is within
  const withinGeofences = [];
  let closestGeofence = null;
  let minDistance = Infinity;

  geofences?.forEach(geofence => {
    const distance = calculateDistance(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(geofence.latitude),
      parseFloat(geofence.longitude)
    );

    if (distance <= parseFloat(geofence.radius) / 1000) {
      withinGeofences.push({
        id: geofence.id,
        name: geofence.name,
        distance: Math.round(distance * 1000) // Convert to meters
      });
    }

    if (distance < minDistance) {
      minDistance = distance;
      closestGeofence = {
        id: geofence.id,
        name: geofence.name,
        distance: Math.round(distance * 1000) // Convert to meters
      };
    }
  });

  return successResponse(res, 'Location check completed', {
    insideGeofence: withinGeofences.length > 0,
    geofences: withinGeofences,
    closestGeofence,
    allGeofences: geofences?.length || 0
  });
});

/**
 * Check if point is within geofence
 * Query: geofenceId, latitude, longitude
 */
export const isPointInGeofence = asyncHandler(async (req, res) => {
  const { geofenceId, latitude, longitude } = req.query;

  if (!geofenceId || !latitude || !longitude) {
    return errorResponse(res, 'Geofence ID, latitude, and longitude are required', 400);
  }

  const { data: geofence, error } = await supabase
    .from('Geofence')
    .select('*')
    .eq('id', geofenceId)
    .single();

  if (error || !geofence) {
    return errorResponse(res, 'Geofence not found', 404);
  }

  const distance = calculateDistance(
    parseFloat(latitude),
    parseFloat(longitude),
    parseFloat(geofence.latitude),
    parseFloat(geofence.longitude)
  );

  const isInside = distance <= parseFloat(geofence.radius) / 1000;

  return successResponse(res, 'Point check completed', {
    isInside,
    distance: Math.round(distance * 1000), // meters
    geofenceName: geofence.name,
    geofenceRadius: geofence.radius // meters
  });
});
