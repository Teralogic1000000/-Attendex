import supabase from '../config/supabaseClient.js'
import {
  create,
  update,
  deleteById,
} from '../config/supabaseMapper.js'
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

  const { data: department, error } = await supabase
    .from('Department')
    .insert([{
      name,
      description,
      head,
      orgId
    }])
    .select()
    .single()

  if (error) {
    return errorResponse(res, error.message, 400)
  }

  return successResponse(res, 'Department created successfully', department, 201)
})

/**
 * Get all departments in the organization
 * Uses department_full_view to include organization name
 */
export const getDepartments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit

  // Use department_full_view for readable data
  const { data: departments, error, count } = await supabase
    .from('department_full_view')
    .select('*', { count: 'exact' })
    .order('Department_Name', { ascending: true })
    .range(skip, skip + limit - 1)

  if (error) {
    return errorResponse(res, error.message, 400)
  }

  return successResponse(res, 'Departments fetched successfully', {
    data: departments || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      pages: Math.ceil((count || 0) / limit)
    }
  })
})

/**
 * Get a single department
 * Uses department_full_view for readable data
 */
export const getDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Use department_full_view for readable data
  const { data: department, error } = await supabase
    .from('department_full_view')
    .select('*')
    .eq('Dept_ID', id)
    .single()

  if (error || !department) {
    return errorResponse(res, 'Department not found', 404)
  }

  // Get users in this department
  const users = await findMany('user', { departmentId: parseInt(id) }, { limit: 1000 });

  return successResponse(res, 'Department fetched successfully', {
    ...department,
    users: users.map(u => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      jobTitle: u.jobTitle
    })),
    employeeCount: users.length
  })
})

/**
 * Update a department
 */
export const updateDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { name, description, head } = req.body
  const orgId = req.user.orgId

  const department = await findOne('department', { id, orgId });

  if (!department) {
    return errorResponse(res, 'Department not found', 404)
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (head !== undefined) updateData.head = head;

  const updated = await update('department', id, updateData, 'id');

  return successResponse(res, 'Department updated successfully', updated)
})

/**
 * Delete a department
 */
export const deleteDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params
  const orgId = req.user.orgId

  const department = await findOne('department', { id, orgId });

  if (!department) {
    return errorResponse(res, 'Department not found', 404)
  }

  // Check if department has users
  const userCount = await count('user', { departmentId: parseInt(id) });

  if (userCount > 0) {
    return errorResponse(res, 'Cannot delete department with active users', 400)
  }

  await deleteById('department', id, 'id');

  return successResponse(res, 'Department deleted successfully', null)
})
