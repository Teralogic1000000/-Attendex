import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('📋 Checking Supabase Database Schema...\n');
console.log('URL:', supabaseUrl);
console.log('Using Service Key:', !!process.env.SUPABASE_SERVICE_KEY);
console.log('');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  try {
    // Try to fetch from User table and see what columns are returned
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error querying User table:', error.message);
      
      // Try with lowercase
      console.log('\nTrying lowercase "user"...\n');
      const { data: data2, error: error2 } = await supabase
        .from('user')
        .select('*')
        .limit(1);
      
      if (error2) {
        console.error('❌ Error querying user table:', error2.message);
      } else {
        console.log('✓ Found columns in "user" table:');
        if (data2 && data2.length > 0) {
          console.log(Object.keys(data2[0]));
        } else {
          console.log('(No user records found - cannot determine columns from data)');
          
          // List tables
          const { data: tables } = await supabase.rpc('quote_ident', { name: 'User' });
          console.log('\nAvailable tables:', tables);
        }
      }
    } else {
      console.log('✓ Found columns in "User" table:');
      if (data && data.length > 0) {
        console.log(Object.keys(data[0]));
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkSchema();
