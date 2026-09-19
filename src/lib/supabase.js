import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://smvoggulpxugtsnqrgbu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9nZ3VscHh1Z3RzbnFyZ2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NjQ3MzMsImV4cCI6MjEwNTM0MDczM30.fCrZn4SWfO2mFF0g8zNDzNB8k58VxdPb03bT8uNLt1Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);