import { createClient } from '@supabase/supabase-js';

// Credentials provided for the EcoSort Supabase project
const supabaseUrl = process.env.SUPABASE_URL || 'https://rlxnvnbdwjumwcefowma.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJseG52bmJkd2p1bXdjZWZvd21hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5NjU0MjgsImV4cCI6MjA3OTU0MTQyOH0.EsPURUihttRQbBkJMlMCNXFgi0UcAQeU-t9phwDeBio';

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or Key is missing. Please ensure you have configured your database connection.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
