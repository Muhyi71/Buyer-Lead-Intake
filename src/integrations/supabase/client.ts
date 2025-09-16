// EMpty file 
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://syspvagegurfeamnehlg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5c3B2YWdlZ3VyZmVhbW5laGxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NzQ3OTIsImV4cCI6MjA3MzM1MDc5Mn0.jV-sbSNx0XaDfotJYc2GQaQheIHQUtPPLH_MutCja3U";



export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});