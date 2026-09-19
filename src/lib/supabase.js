import { createClient } from '@supabase/supabase-js';

// URL y Clave pública Anon fijas para producción
const supabaseUrl = 'https://smvoggulpxugtsnqrgbu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtdm9nZ3VscHh1Z3RzbnFyZ2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk3MzMzMzMsImV4cCI6MjAyNTMwOTMzM30.fCrZn4SWf02mFF0g8zNDzNB8k58VxdPb03bT8uNLt1Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);