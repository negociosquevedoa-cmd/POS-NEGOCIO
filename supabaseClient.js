import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://nxiviidirmzqbcldegus.supabase.co'
const SUPABASE_ANON_KEY = 'pega_aqui_tu_llave_anon_larga'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
