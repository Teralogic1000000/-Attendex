import prisma from '../config/prisma.js'
import { successResponse, errorResponse } from '../utils/response.js'
import { asyncHandler } from '../utils/asyncHandler.js'

/**
 * Create a new department
 */
export const createDepartment = asyncHandler(async (req, res) => {
  const { name, description, head } = req.body
  const orgId = req.user.orgId

  if (!name) {
    return errorResponse(res, 'Department name is required', 400)
  }

  const department = await prisma.department.create({
    data: {
      name,
      description,
      head,
      orgId
    }
  })

  return successResponse(res, 'Department created successfully', department, 201)
})

/**
 * Get all departments in the organization
 */
export const getDepartments = asyncHandler(async (req, res) => {
  const orgId = req.user.orgId
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit

  const [departments, total] = await Promise.all([
    prisma.department.findMany({
      where: { orgId },
      include: {
        users: {
          select: { id: true }
        }
      },
      skip,
      take: limit
    }),
    prisma.department.count({
      where: { orgId }
    })
  ])

  const departmentsWithCount = departments.map(dept => ({
    ...dept,
    employeeCount: dept.users.length,
    users: undefined
  }))

  return successResponse(res, 'Departments fetched successfully', {
    data: departmentsWithCount,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  })
})

/**
 * Get a single department
 */
export const getDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params
  const orgId = req.user.orgId

  const department = await prisma.department.findFirst({
    where: {
      id,
      orgId
    },
    include: {
      users: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          position: true,
          status: true
        }
      }
    }
  })

  if (!department) {
    return errorResponse(res, 'Department not found', 404)
  }

  return successResponse(res, 'Department fetched successfully', {
    ...department,
    employeeCount: department.users.length
  })
})

/**
 * Update a department
 */
export const updateDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { name, description, head } = req.body
  const orgId = req.user.orgId

  const department = await prisma.department.findFirst({
    where: { id, orgId }
  })

  if (!department) {
    return errorResponse(res, 'Department not found', 404)
  }

  const updated = await prisma.department.update({
    where: { id },
    data: {
      name: name || department.name,
      description: description !== undefined ? description : department.description,
      head: head !== undefined ? head : department.head
    }
  })

  return successResponse(res, 'Department updated successfully', updated)
})

/**
 * Delete a department
 */
export const deleteDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params
  const orgId = req.user.orgId

  const department = await prisma.department.findFirst({
    where: { id, orgId }
  })

  if (!department) {
    return errorResponse(res, 'Department not found', 404)
  }

  // Check if department has users
  const userCount = await prisma.user.count({
    where: { departmentId: id }
  })

  if (userCount > 0) {
    return errorResponse(res, 'Cannot delete department with active users', 400)
  }

  await prisma.department.delete({
    where: { id }
  })

  return successResponse(res, 'Department deleted successfully', null)
})
