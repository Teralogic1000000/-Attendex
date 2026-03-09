/**
 * Supabase Data Mapper
 * 
 * Handles field mapping between API (camelCase) and Supabase (snake_case)
 * Provides consistent database query patterns with automatic transformations
 */

import supabase from './supabaseClient.js'

// Field mapping configurations for each table
const FIELD_MAPPINGS = {
  user: {
    // API (camelCase) → DB (snake_case)
    firstName: 'first_name',
    lastName: 'surname',
    email: 'email',
    password: 'password',
    phone: 'phone_num',
    position: 'job_title',
    jobTitle: 'job_title',
    departmentId: 'depart_id',
    orgId: 'org_id',
    organizationId: 'org_id',
    userTypeId: 'user_type_id',
    roleId: 'user_type_id', // Maps old roleId to new user_type_id
    deviceId: 'device_id',
    isActive: 'is_active',
    createdAt: 'created_at',
    refreshToken: 'refresh_token',
    lastLogin: 'last_login',
    id: 'user_id',
  },
  organization: {
    name: 'org_name',
    orgName: 'org_name',
    email: 'email',
    phone: 'phone_num',
    phoneNum: 'phone_num',
    address: 'address',
    logoUrl: 'logo_url',
    theme: 'theme',
    status: 'status',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    id: 'org_id',
    orgId: 'org_id',
    numOfEmployee: 'num_of_employee',
    slug: 'org_slug',
  },
  attendance: {
    date: 'attendance_date',
    checkIn: 'check_in_time',
    checkInTime: 'check_in_time',
    checkOut: 'check_out_time',
    checkOutTime: 'check_out_time',
    totalHours: 'total_hours',
    status: 'status_id',
    statusId: 'status_id',
    method: 'method_id',
    methodId: 'method_id',
    deviceId: 'device_id',
    ipAddress: 'ip_address',
    latitude: 'latitude',
    longitude: 'longitude',
    notes: 'notes',
    userId: 'user_id',
    orgId: 'org_id',
    organizationId: 'org_id',
    createdAt: 'created_at',
    id: 'attend_id',
  },
  department: {
    name: 'depart_name',
    departName: 'depart_name',
    description: 'description',
    head: 'head_user_id',
    orgId: 'org_id',
    organizationId: 'org_id',
    createdAt: 'created_at',
    id: 'dep_id',
  },
  subscriptionPlan: {
    name: 'plan_name',
    planName: 'plan_name',
    description: 'description',
    maxEmployees: 'max_users',
    maxUsers: 'max_users',
    maxAttendanceRecords: 'max_attendance_records',
    price: 'price_monthly',
    priceMonthly: 'price_monthly',
    credits: 'credits',
    interval: 'interval',
    features: 'features',
    isFree: 'is_free',
    createdAt: 'created_at',
    id: 'plan_id',
  },
  organizationSubscription: {
    orgId: 'org_id',
    organizationId: 'org_id',
    planId: 'plan_id',
    status: 'status',
    startDate: 'start_date',
    endDate: 'end_date',
    nextBillingDate: 'next_billing_date',
    paymentStatus: 'payment_status',
    cancellationDate: 'cancellation_date',
    createdAt: 'created_at',
    id: 'sub_id',
  },
  shift: {
    name: 'shift_name',
    startTime: 'start_time',
    endTime: 'end_time',
    orgId: 'org_id',
    organizationId: 'org_id',
    createdAt: 'created_at',
    id: 'shift_id',
  },
  userType: {
    typeName: 'type_name',
    name: 'type_name',
    createdAt: 'created_at',
    id: 'user_type_id',
  },
  attendanceStatus: {
    statusName: 'status_name',
    name: 'status_name',
    createdAt: 'created_at',
    id: 'status_id',
  },
  attendanceMethod: {
    methodName: 'method_name',
    name: 'method_name',
    createdAt: 'created_at',
    id: 'method_id',
  },
  device: {
    deviceName: 'device_name',
    name: 'device_name',
    deviceModel: 'device_model',
    model: 'device_model',
    deviceUuid: 'device_uuid',
    uuid: 'device_uuid',
    deviceType: 'device_type',
    type: 'device_type',
    osName: 'os_name',
    osVersion: 'os_version',
    ipAddress: 'ip_address',
    lastCheckin: 'last_checkin',
    isActive: 'is_active',
    createdAt: 'created_at',
    id: 'device_id',
  },
  geofence: {
    name: 'name',
    latitude: 'latitude',
    longitude: 'longitude',
    radius: 'radius',
    orgId: 'org_id',
    organizationId: 'org_id',
    isActive: 'is_active',
    createdAt: 'created_at',
    id: 'geo_id',
  },
  auditLog: {
    action: 'action',
    tableName: 'table_name',
    recordId: 'record_id',
    oldData: 'old_data',
    newData: 'new_data',
    ipAddress: 'ip_address',
    userId: 'user_id',
    orgId: 'org_id',
    createdAt: 'created_at',
    id: 'log_id',
  },
  superAdmin: {
    email: 'email',
    password: 'password',
    fullName: 'full_name',
    phone: 'phone_num',
    phoneNum: 'phone_num',
    isActive: 'is_active',
    createdAt: 'created_at',
    id: 'super_admin_id',
  },
  orgType: {
    typeName: 'type_name',
    name: 'type_name',
    createdAt: 'created_at',
    id: 'org_type_id',
  },
  region: {
    name: 'region_name',
    regionName: 'region_name',
    countryCode: 'country_code',
    createdAt: 'created_at',
    id: 'region_id',
  },
}

/**
 * Convert camelCase object to snake_case for Supabase
 */
export function camelToSnakeCase(obj, table) {
  if (!obj || typeof obj !== 'object') return obj
  
  const mappings = FIELD_MAPPINGS[table] || {}
  const converted = {}

  for (const [key, value] of Object.entries(obj)) {
    const dbField = mappings[key] || key
    converted[dbField] = value
  }

  return converted
}

/**
 * Convert snake_case object from Supabase to camelCase for API response
 */
export function snakeToCamelCase(obj, table) {
  if (!obj || typeof obj !== 'object') return obj

  const mappings = FIELD_MAPPINGS[table] || {}
  const reverseMappings = {}

  // Create reverse mapping
  for (const [camel, snake] of Object.entries(mappings)) {
    reverseMappings[snake] = camel
  }

  const converted = {}

  for (const [key, value] of Object.entries(obj)) {
    const apiField = reverseMappings[key] || key
    converted[apiField] = value
  }

  return converted
}

/**
 * Find a record by ID
 */
export async function findById(table, id, idColumn = 'id') {
  const dbIdColumn = FIELD_MAPPINGS[table]?.[idColumn] || idColumn
  
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq(dbIdColumn, id)
      .single()

    if (error) throw error
    return data ? snakeToCamelCase(data, table) : null
  } catch (error) {
    console.error(`Error finding ${table} by ID:`, error.message)
    throw error
  }
}

/**
 * Find many records with filters
 */
export async function findMany(table, filters = {}, options = {}) {
  try {
    let query = supabase.from(table).select('*')

    // Convert camelCase filters to snake_case
    const dbFilters = camelToSnakeCase(filters, table)

    // Apply filters
    for (const [key, value] of Object.entries(dbFilters)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          query = query.in(key, value)
        } else if (typeof value === 'object') {
          // Handle complex filters like { gt: 10 }
          const opKey = Object.keys(value)[0]
          const opValue = value[opKey]
          if (opKey === 'gt') query = query.gt(key, opValue)
          else if (opKey === 'gte') query = query.gte(key, opValue)
          else if (opKey === 'lt') query = query.lt(key, opValue)
          else if (opKey === 'lte') query = query.lte(key, opValue)
          else if (opKey === 'neq') query = query.neq(key, opValue)
          else if (opKey === 'like') query = query.like(key, opValue)
          else if (opKey === 'ilike') query = query.ilike(key, opValue)
          else query = query.eq(key, value)
        } else {
          query = query.eq(key, value)
        }
      }
    }

    // Apply sorting
    if (options.order) {
      const [column, direction] = Array.isArray(options.order) 
        ? options.order 
        : [options.order, 'asc']
      const dbColumn = FIELD_MAPPINGS[table]?.[column] || column
      query = query.order(dbColumn, { ascending: direction === 'asc' })
    } else if (options.orderBy) {
      // Support both order and orderBy
      const [column, direction] = Array.isArray(options.orderBy)
        ? options.orderBy
        : Object.entries(options.orderBy)[0]
      const dbColumn = FIELD_MAPPINGS[table]?.[column] || column
      query = query.order(dbColumn, { ascending: direction === 'asc' })
    }

    // Apply pagination
    if (options.limit) {
      if (options.offset) {
        query = query.range(options.offset, options.offset + options.limit - 1)
      } else if (options.skip) {
        query = query.range(options.skip, options.skip + options.limit - 1)
      } else {
        query = query.limit(options.limit)
      }
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []).map(record => snakeToCamelCase(record, table))
  } catch (error) {
    console.error(`Error finding records in ${table}:`, error.message)
    throw error
  }
}

/**
 * Find a single record with filters
 */
export async function findOne(table, filters = {}) {
  try {
    let query = supabase.from(table).select('*')

    const dbFilters = camelToSnakeCase(filters, table)

    for (const [key, value] of Object.entries(dbFilters)) {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value)
      }
    }

    const { data, error } = await query.limit(1)

    if (error && error.code !== 'PGRST116') throw error
    return data && data[0] ? snakeToCamelCase(data[0], table) : null
  } catch (error) {
    console.error(`Error finding single record in ${table}:`, error.message)
    throw error
  }
}

/**
 * Find first record (same as findOne)
 */
export async function findFirst(table, filters = {}) {
  return findOne(table, filters)
}

/**
 * Create a new record
 */
export async function create(table, data) {
  try {
    const dbData = camelToSnakeCase(data, table)
    
    const { data: result, error } = await supabase
      .from(table)
      .insert([dbData])
      .select()

    if (error) throw error
    return result && result[0] ? snakeToCamelCase(result[0], table) : null
  } catch (error) {
    console.error(`Error creating ${table} record:`, error.message)
    throw error
  }
}

/**
 * Update a record by ID
 */
export async function update(table, id, data, idColumn = 'id') {
  const dbIdColumn = FIELD_MAPPINGS[table]?.[idColumn] || idColumn
  
  try {
    const dbData = camelToSnakeCase(data, table)
    
    const { data: result, error } = await supabase
      .from(table)
      .update(dbData)
      .eq(dbIdColumn, id)
      .select()

    if (error) throw error
    return result && result[0] ? snakeToCamelCase(result[0], table) : null
  } catch (error) {
    console.error(`Error updating ${table} record:`, error.message)
    throw error
  }
}

/**
 * Delete a record by ID
 */
export async function deleteById(table, id, idColumn = 'id') {
  const dbIdColumn = FIELD_MAPPINGS[table]?.[idColumn] || idColumn
  
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq(dbIdColumn, id)

    if (error) throw error
    return true
  } catch (error) {
    console.error(`Error deleting ${table} record:`, error.message)
    throw error
  }
}

/**
 * Count records with optional filters
 */
export async function count(table, filters = {}) {
  try {
    let query = supabase.from(table).select('*', { count: 'exact', head: true })

    const dbFilters = camelToSnakeCase(filters, table)

    for (const [key, value] of Object.entries(dbFilters)) {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value)
      }
    }

    const { count: total, error } = await query

    if (error) throw error
    return total || 0
  } catch (error) {
    console.error(`Error counting ${table} records:`, error.message)
    throw error
  }
}

/**
 * Execute a raw query with builder pattern
 */
export async function query(table) {
  return supabase.from(table).select('*')
}

/**
 * Upsert a record (insert if not exists, update if exists)
 */
export async function upsert(table, data, onConflict = 'id') {
  try {
    const dbData = camelToSnakeCase(data, table)
    const dbConflictColumn = FIELD_MAPPINGS[table]?.[onConflict] || onConflict

    const { data: result, error } = await supabase
      .from(table)
      .upsert([dbData], { onConflict: dbConflictColumn })
      .select()

    if (error) throw error
    return result && result[0] ? snakeToCamelCase(result[0], table) : null
  } catch (error) {
    console.error(`Error upserting ${table} record:`, error.message)
    throw error
  }
}

/**
 * Batch create multiple records
 */
export async function createMany(table, dataArray) {
  try {
    const dbDataArray = dataArray.map(data => camelToSnakeCase(data, table))

    const { data: result, error } = await supabase
      .from(table)
      .insert(dbDataArray)
      .select()

    if (error) throw error
    return (result || []).map(record => snakeToCamelCase(record, table))
  } catch (error) {
    console.error(`Error creating multiple ${table} records:`, error.message)
    throw error
  }
}

/**
 * Export default as Prisma-compatible mock for easy migration
 * Allows gradual refactoring without breaking existing code structure
 */
const supabaseDB = {
  user: {
    findUnique: ({ where }) => {
      const key = Object.keys(where)[0]
      return findById('user', where[key], key)
    },
    findMany: (args) => findMany('user', args.where || {}, { ...args, orderBy: args.orderBy, offset: args.skip, limit: args.take }),
    findFirst: ({ where }) => findFirst('user', where),
    create: ({ data }) => create('user', data),
    update: ({ where, data }) => {
      const key = Object.keys(where)[0]
      return update('user', where[key], data, key)
    },
    delete: ({ where }) => {
      const key = Object.keys(where)[0]
      return deleteById('user', where[key], key)
    },
    count: ({ where }) => count('user', where || {}),
  },
  organization: {
    findUnique: ({ where }) => {
      const key = Object.keys(where)[0]
      return findById('organization', where[key], key)
    },
    findMany: (args) => findMany('organization', args.where || {}, args),
    findFirst: ({ where }) => findFirst('organization', where),
    create: ({ data }) => create('organization', data),
    update: ({ where, data }) => {
      const key = Object.keys(where)[0]
      return update('organization', where[key], data, key)
    },
    count: ({ where }) => count('organization', where || {}),
  },
  attendance: {
    findUnique: ({ where }) => {
      const key = Object.keys(where)[0]
      return findById('attendance', where[key], key)
    },
    findMany: (args) => findMany('attendance', args.where || {}, args),
    findFirst: ({ where }) => findFirst('attendance', where),
    create: ({ data }) => create('attendance', data),
    update: ({ where, data }) => {
      const key = Object.keys(where)[0]
      return update('attendance', where[key], data, key)
    },
    count: ({ where }) => count('attendance', where || {}),
  },
  department: {
    findUnique: ({ where }) => {
      const key = Object.keys(where)[0]
      return findById('department', where[key], key)
    },
    findMany: (args) => findMany('department', args.where || {}, args),
    findFirst: ({ where }) => findFirst('department', where),
    create: ({ data }) => create('department', data),
    update: ({ where, data }) => {
      const key = Object.keys(where)[0]
      return update('department', where[key], data, key)
    },
  },
  subscriptionPlan: {
    findUnique: ({ where }) => {
      const key = Object.keys(where)[0]
      return findById('subscriptionPlan', where[key], key)
    },
    findMany: (args) => findMany('subscriptionPlan', args.where || {}, args),
    findFirst: ({ where }) => findFirst('subscriptionPlan', where),
    create: ({ data }) => create('subscriptionPlan', data),
    count: ({ where }) => count('subscriptionPlan', where || {}),
  },
  organizationSubscription: {
    findUnique: ({ where }) => {
      const key = Object.keys(where)[0]
      return findById('organizationSubscription', where[key], key)
    },
    findMany: (args) => findMany('organizationSubscription', args.where || {}, args),
    create: ({ data }) => create('organizationSubscription', data),
    update: ({ where, data }) => {
      const key = Object.keys(where)[0]
      return update('organizationSubscription', where[key], data, key)
    },
  },
}

export default supabaseDB
