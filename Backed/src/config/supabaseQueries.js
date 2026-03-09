/**
 * Supabase Database Query Utilities
 * 
 * Common database operations and helper functions for Supabase.
 * Handles error responses and provides consistent query patterns.
 */

import supabase from './supabaseClient.js'

/**
 * Find a record by ID
 * @param {string} table - Table name
 * @param {number|string} id - Record ID
 * @param {string} idColumn - ID column name (default: id)
 * @returns {Promise<Object>} The record or null
 */
export async function findById(table, id, idColumn = 'id') {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq(idColumn, id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error(`Error finding ${table} by ID:`, error.message)
    throw error
  }
}

/**
 * Find records with filters
 * @param {string} table - Table name
 * @param {Object} filters - Filter conditions { column: value }
 * @param {Object} options - Query options { limit, offset, order }
 * @returns {Promise<Array>} Array of records
 */
export async function findMany(table, filters = {}, options = {}) {
  try {
    let query = supabase.from(table).select('*')

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        query = query.eq(key, value)
      }
    })

    // Apply sorting
    if (options.order) {
      const [column, direction] = options.order
      query = query.order(column, { ascending: direction === 'asc' })
    }

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit)
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  } catch (error) {
    console.error(`Error finding records in ${table}:`, error.message)
    throw error
  }
}

/**
 * Find a single record with filters
 * @param {string} table - Table name
 * @param {Object} filters - Filter conditions
 * @returns {Promise<Object>} The record or null
 */
export async function findOne(table, filters = {}) {
  try {
    let query = supabase.from(table).select('*')

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        query = query.eq(key, value)
      }
    })

    const { data, error } = await query.single()
    if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
    return data || null
  } catch (error) {
    console.error(`Error finding single record in ${table}:`, error.message)
    throw error
  }
}

/**
 * Create a new record
 * @param {string} table - Table name
 * @param {Object} data - Record data
 * @returns {Promise<Object>} Created record
 */
export async function create(table, data) {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .insert([data])
      .select()
      .single()

    if (error) throw error
    return result
  } catch (error) {
    console.error(`Error creating record in ${table}:`, error.message)
    throw error
  }
}

/**
 * Update a record by ID
 * @param {string} table - Table name
 * @param {number|string} id - Record ID
 * @param {Object} updates - Fields to update
 * @param {string} idColumn - ID column name
 * @returns {Promise<Object>} Updated record
 */
export async function update(table, id, updates, idColumn = 'id') {
  try {
    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq(idColumn, id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error(`Error updating record in ${table}:`, error.message)
    throw error
  }
}

/**
 * Delete a record by ID
 * @param {string} table - Table name
 * @param {number|string} id - Record ID
 * @param {string} idColumn - ID column name
 * @returns {Promise<void>}
 */
export async function deleteById(table, id, idColumn = 'id') {
  try {
    const { error } = await supabase.from(table).delete().eq(idColumn, id)

    if (error) throw error
  } catch (error) {
    console.error(`Error deleting record in ${table}:`, error.message)
    throw error
  }
}

/**
 * Count records with filters
 * @param {string} table - Table name
 * @param {Object} filters - Filter conditions
 * @returns {Promise<number>} Record count
 */
export async function count(table, filters = {}) {
  try {
    let query = supabase.from(table).select('count(*)', { count: 'exact', head: true })

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        query = query.eq(key, value)
      }
    })

    const { count: total, error } = await query
    if (error) throw error
    return total || 0
  } catch (error) {
    console.error(`Error counting records in ${table}:`, error.message)
    throw error
  }
}

/**
 * Execute raw SQL query (use with caution)
 * @param {string} sql - SQL query
 * @returns {Promise<Object>} Query result
 */
export async function query(sql) {
  try {
    const { data, error } = await supabase.rpc('query', { sql })
    if (error) throw error
    return data
  } catch (error) {
    console.error('Error executing query:', error.message)
    throw error
  }
}

export default {
  findById,
  findMany,
  findOne,
  create,
  update,
  deleteById,
  count,
  query,
}
