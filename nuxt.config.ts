// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  // --- Modulok -----------------------------------------------------------
  modules: [
    '@nuxtjs/supabase',  // Supabase SSR + auth cookie kezelés
    '@pinia/nuxt',       // Pinia state management
  ],

  // --- Runtime konfiguráció ---------------------------------------------
  // Privát értékek (pl. supabaseServiceKey) csak szerver oldalon érhetők el.
  // Publikus értékek (public.*) kliensen is elérhetők.
  runtimeConfig: {
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY, // PRIVÁT - soha ne kerüljön kliensre
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
    },
  },

  // --- TypeScript --------------------------------------------------------
  typescript: {
    strict: true,
    typeCheck: true,
  },

  // --- Nitro (Vercel Edge Runtime) ---------------------------------------
  nitro: {
    preset: 'vercel-edge',
  },

  // --- @nuxtjs/supabase konfiguráció ------------------------------------
  // A modul automatikusan olvassa a SUPABASE_URL és SUPABASE_KEY env változókat.
  // Redirect beállítások az auth flow-hoz:
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/', '/posts'],
    },
  },
})
