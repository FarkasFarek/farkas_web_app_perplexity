import { createClient } from '@supabase/supabase-js'

// --- Supabase Admin Client ----------------------------------------------
// Service role key-vel inicializalt kliens — CSAK server-side hasznalhato!
// SOHA ne kuldj service role key-t a kliensnek / bongeszobe.
//
// Szukseges env valtozok (nuxt.config.ts runtimeConfig):
//   SUPABASE_URL          → runtimeConfig.public.supabaseUrl
//   SUPABASE_SERVICE_KEY  → runtimeConfig.supabaseServiceKey  (privat)
//
// nuxt.config.ts peldakod:
//   runtimeConfig: {
//     supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
//     public: {
//       supabaseUrl: process.env.SUPABASE_URL,
//     },
//   }

export const useSupabaseAdmin = () => {
  const config = useRuntimeConfig()

  if (!config.supabaseServiceKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'SUPABASE_SERVICE_KEY environment variable is not set',
    })
  }

  return createClient(
    config.public.supabaseUrl as string,
    config.supabaseServiceKey as string,
    {
      auth: {
        // Szerver oldalon nincs szukseg token frissitesre vagy session tarolasra
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
