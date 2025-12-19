
import { createClient } from '@supabase/supabase-js';

/**
 * ⚠️ ATENÇÃO: O erro 404 no seu console indica que a URL abaixo está incorreta
 * ou o seu projeto no Supabase foi pausado/excluído.
 * 
 * Vá em Settings > API no Supabase e pegue a "Project URL" correta.
 */
const SUPABASE_URL = 'https://vlbijyrykewyanpuxljm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsYmlqeXJ5a2V3eWFucHV4bGptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5OTg3OTcsImV4cCI6MjA4MTU3NDc5N30.N69CKGKienoKkAtqvjj2SkuqQ0rJNRUsg8J-yGZ9VKA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
