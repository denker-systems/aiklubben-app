import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { authStorage } from './secure-storage';

const SUPABASE_URL = "https://vskmxctdyojqqxgsbpdt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZza214Y3RkeW9qcXF4Z3NicGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNzQ4MTMsImV4cCI6MjA1Njg1MDgxM30.HEXFbyBcvRUZsP9UMp3llegw2ZI6ZDdNVCZ2Qwt0kqg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});
