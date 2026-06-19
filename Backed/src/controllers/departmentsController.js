import prisma from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Create a new department
 */
export const createDepartment = asyncHandler(async (req, res) => {
  const { name, description, head } = req.body;
  const orgId = req.user.orgId;

  if (!name) {
    return errorResponse(res, 'Department name is required', 400);
  }

  const department = await prisma.department.create({
    data: {
      name,
      description,
      head,
      status: 'ACTIVE',
      orgId
    }
  });

  return successResponse(res, 'Department created successfully', department, 201);
});

/**
 * Get all departments for organization
 */
export const getDepartments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const orgId = req.user.orgId;

  const [departments, total] = await Promise.all([
    prisma.department.findMany({
      where: { orgId },
      orderBy: { name: 'asc' },
      skip,
      take: limit
    }),
    prisma.department.count({ where: { orgId } })
  ]);

  return successResponse(res, 'Departments fetched successfully', {
    departments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
});

/**
 * Get department by ID
 */
export const getDepartmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orgId = req.user.orgId;

  const department = await prisma.department.findFirst({
    where: { id, orgId }
  });

  if (!department) {
    return errorResponse(res, 'Department not found', 404);
  }

  return successResponse(res, 'Department retrieved successfully', department);
});

/**
 * Update department
 */
export const updateDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, head, status } = req.body;
  const orgId = req.user.orgId;

  const department = await prisma.department.findFirst({
    where: { id, orgId }
  });

  if (!department) {
    return errorResponse(res, 'Department not found', 404);
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (head !== undefined) updateData.head = head;
  if (status !== undefined) updateData.status = status;

  const updated = await prisma.department.update({
    where: { id },
    data: updateData
  });

  return successResponse(res, 'Department updated successfully', updated);
});

/**
 * Delete department
 */
export const deleteDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orgId = req.user.orgId;

  const department = await prisma.department.findFirst({
    where: { id, orgId }
  });

  if (!department) {
    return errorResponse(res, 'Department not found', 404);
  }

  await prisma.department.delete({
    where: { id }
  });

  return successResponse(res, 'Department deleted successfully');
});

/**
 * Get employees in a department
 */
export const getDepartmentEmployees = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orgId = req.user.orgId;

  const department = await prisma.department.findFirst({
    where: { id, orgId }
  });

  if (!department) {
    return errorResponse(res, 'Department not found', 404);
  }

  const employees = await prisma.user.findMany({
    where: {
      orgId,
      departmentId: id
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: { select: { name: true } }
    }
  });

  return successResponse(res, 'Department employees retrieved successfully', {
    department,
    employees
  });
});

// Alias for getDepartmentById
export const getDepartment = getDepartmentById;
