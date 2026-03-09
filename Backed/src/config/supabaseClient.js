/**
 * Supabase Client Configuration
 * 
 * This file initializes the Supabase client for interacting with
 * the Supabase PostgreSQL database and authentication services.
 */

import { createClient } from '@supabase/supabase-js'

// Get Supabase credentials from environment or use defaults
const supabaseUrl = process.env.SUPABASE_URL || 'https://nocmacsjslykcmumwhzc.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || 'default-key'

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is not defined in environment variables')
}

// Initialize Supabase Client
// - URL: Your Supabase project URL
// - ANON_KEY: Your public anonymous key (safe for front-end)
// - For server-side operations, we use SERVICE_KEY with full access
const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: false, // Not needed for Node.js backend
      autoRefreshToken: false,
    },
    db: {
      schema: 'public',
    },
  }
)

/**
 * Verify Supabase connection on startup
 */
export async function verifySupabaseConnection() {
  try {
    // Simple query to verify connection
    const { data, error } = await supabase
      .from('organization')
      .select('count(*)', { count: 'exact', head: true })

    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
      return false
    }

    console.log('✅ Supabase connection established')
    return true
  } catch (err) {
    console.error('❌ Error verifying Supabase connection:', err.message)
    return false
  }
}

export default supabase
