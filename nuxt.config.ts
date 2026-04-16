// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  devtools: { enabled: true },

  modules: [
    '@nuxtjs/supabase',
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
  ],

  // Edge runtime Vercelen
  nitro: {
    preset: 'vercel-edge',
  },

  supabase: {
    // Redirect automatikus auth guard kikapcsolva –
    // middleware/auth.ts kezeli manuálisan
    redirect: false,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/', '/api/products*', '/api/news*', '/api/search*'],
    },
  },

  runtimeConfig: {
    // Csak szerveroldali (nem kerül a kliens bundlebe)
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    secretKey: process.env.NUXT_SECRET_KEY,

    // Publikus (kliens és szerver is látja)
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    },
  },

  typescript: {
    strict: true,
    typeCheck: false, // build közben ki van kapcsolva, lokálisan npx nuxi typecheck
  },
})
