import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials!');
  process.exit(1);
}

// Remove any trailing /rest/v1/ if present
const cleanUrl = supabaseUrl.replace(/\/rest\/v1\/$/, '');

console.log(' Supabase URL:', cleanUrl);

export const supabase = createClient(cleanUrl, supabaseAnonKey);
