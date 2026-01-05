import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://pbqwrksoisfddcjvsmws.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBicXdya3NvaXNmZGRjanZzbXdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNzUxMjYsImV4cCI6MjA3OTc1MTEyNn0.xj6TsEz9tHYNYpU5EXVdLVhatpH8Urwoi50Ln_ITDdQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);