import { createClient } from '@supabase/supabase-js';

// Using provided credentials directly to prevent environment variable issues
const supabaseUrl = 'https://rlxnvnbdwjumwcefowma.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJseG52bmJkd2p1bXdjZWZvd21hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NjU0MjgsImV4cCI6MjA3OTU0MTQyOH0.EsPURUihttRQbBkJMlMCNXFgi0UcAQeU-t9phwDeBio';

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase credentials missing");
}

export const supabase = createClient(supabaseUrl, supabaseKey);