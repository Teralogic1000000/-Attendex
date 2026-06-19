/**
 * Geofence Controller
 * Manages geofence zones for attendance validation
 */

import prisma from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Helper: Calculate distance between two coordinates
 * Returns distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Helper: Check if point is within geofence
 */
function isPointInGeofence(point, geofence) {
  const distance = calculateDistance(
    point.lat, point.lon,
    geofence.latitude, geofence.longitude
  );
  return distance <= geofence.radius;
}

/**
 * Create geofence
 */
export const createGeofence = asyncHandler(async (req, res) => {
  const { name, latitude, longitude, radius, orgId, description } = req.body;

  if (!name || !latitude || !longitude || !radius || !orgId) {
    return errorResponse(res, 'Required fields missing', 400);
  }

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) {
    return errorResponse(res, 'Organization not found', 404);
  }

  const geofence = await prisma.geofence.create({
    data: {
      name,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius: parseFloat(radius),
      description: description || '',
      orgId,
      isActive: true
    }
  });

  return successResponse(res, 'Geofence created successfully', geofence, 201);
});

/**
 * Get geofences for organization
 */
export const getGeofences = asyncHandler(async (req, res) => {
  const { orgId } = req.query;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  if (!orgId) {
    return errorResponse(res, 'Organization ID required', 400);
  }

  const [geofences, total] = await Promise.all([
    prisma.geofence.findMany({
      where: { orgId },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.geofence.count({ where: { orgId } })
  ]);

  return successResponse(res, 'Geofences retrieved', {
    data: geofences,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

/**
 * Get geofence by ID
 */
export const getGeofenceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const geofence = await prisma.geofence.findUnique({
    where: { id },
    include: { organization: true }
  });

  if (!geofence) {
    return errorResponse(res, 'Geofence not found', 404);
  }

  return successResponse(res, 'Geofence details', geofence);
});

/**
 * Update geofence
 */
export const updateGeofence = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, latitude, longitude, radius, description, isActive } = req.body;

  const geofence = await prisma.geofence.findUnique({ where: { id } });
  if (!geofence) {
    return errorResponse(res, 'Geofence not found', 404);
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
  if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
  if (radius !== undefined) updateData.radius = parseFloat(radius);
  if (description !== undefined) updateData.description = description;
  if (isActive !== undefined) updateData.isActive = isActive;

  const updated = await prisma.geofence.update({
    where: { id },
    data: updateData
  });

  return successResponse(res, 'Geofence updated successfully', updated);
});

/**
 * Delete geofence
 */
export const deleteGeofence = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const geofence = await prisma.geofence.findUnique({ where: { id } });
  if (!geofence) {
    return errorResponse(res, 'Geofence not found', 404);
  }

  await prisma.geofence.delete({ where: { id } });

  return successResponse(res, 'Geofence deleted successfully');
});

/**
 * Check if location is in geofence
 */
export const checkLocationInGeofence = asyncHandler(async (req, res) => {
  const { latitude, longitude, geofenceId } = req.body;

  if (!latitude || !longitude || !geofenceId) {
    return errorResponse(res, 'Latitude, longitude, and geofenceId required', 400);
  }

  const geofence = await prisma.geofence.findUnique({ where: { id: geofenceId } });
  if (!geofence) {
    return errorResponse(res, 'Geofence not found', 404);
  }

  const isInside = isPointInGeofence(
    { lat: parseFloat(latitude), lon: parseFloat(longitude) },
    { latitude: geofence.latitude, longitude: geofence.longitude, radius: geofence.radius }
  );

  const distance = calculateDistance(
    parseFloat(latitude), parseFloat(longitude),
    geofence.latitude, geofence.longitude
  );

  return successResponse(res, 'Location check completed', {
    isInside,
    distance: Math.round(distance),
    geofenceRadius: geofence.radius,
    geofenceName: geofence.name
  });
});

/**
 * Check location against all geofences in organization
 */
export const checkLocationInOrgGeofences = asyncHandler(async (req, res) => {
  const { latitude, longitude, orgId } = req.body;

  if (!latitude || !longitude || !orgId) {
    return errorResponse(res, 'Latitude, longitude, and orgId required', 400);
  }

  const geofences = await prisma.geofence.findMany({
    where: { orgId, isActive: true }
  });

  const results = geofences.map(geofence => {
    const isInside = isPointInGeofence(
      { lat: parseFloat(latitude), lon: parseFloat(longitude) },
      { latitude: geofence.latitude, longitude: geofence.longitude, radius: geofence.radius }
    );

    const distance = calculateDistance(
      parseFloat(latitude), parseFloat(longitude),
      geofence.latitude, geofence.longitude
    );

    return {
      geofenceId: geofence.id,
      geofenceName: geofence.name,
      isInside,
      distance: Math.round(distance)
    };
  });

  const isInAnyGeofence = results.some(r => r.isInside);

  return successResponse(res, 'Location check against all geofences', {
    isInAnyGeofence,
    results
  });
});

/**
 * Get nearby geofences (within certain distance)
 */
export const getNearbyGeofences = asyncHandler(async (req, res) => {
  const { latitude, longitude, orgId, distance = 5000 } = req.query;

  if (!latitude || !longitude || !orgId) {
    return errorResponse(res, 'Latitude, longitude, and orgId required', 400);
  }

  const maxDistance = parseInt(distance); // in meters

  const geofences = await prisma.geofence.findMany({
    where: { orgId, isActive: true }
  });

  const nearby = geofences
    .map(geofence => {
      const dist = calculateDistance(
        parseFloat(latitude), parseFloat(longitude),
        geofence.latitude, geofence.longitude
      );
      return {
        ...geofence,
        distanceFromUser: Math.round(dist)
      };
    })
    .filter(g => g.distanceFromUser <= maxDistance)
    .sort((a, b) => a.distanceFromUser - b.distanceFromUser);

  return successResponse(res, `Geofences within ${maxDistance}m`, {
    count: nearby.length,
    maxDistance,
    geofences: nearby
  });
});

import {
  createGeofence,
  getGeofences,
  getGeofenceById,
  updateGeofence,
  deleteGeofence,
  checkLocationInGeofence,
  isPointInGeofence
} from '../controllers/geofenceController.js';
