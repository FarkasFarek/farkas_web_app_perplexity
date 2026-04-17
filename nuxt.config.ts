// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  devtools: { enabled: false },

  // Global CSS — sorrend fontos: tokens előbb, base utána
  css: [
    '~/assets/css/tokens.css',
    '~/assets/css/base.css',
  ],

  modules: [
    '@nuxtjs/color-mode',
    '@nuxtjs/supabase',
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
  ],

  // Color mode: data-theme attribútum illeszkedik a tokens.css [data-theme='dark'] szelektorához
  colorMode: {
    preference: 'system',
    fallback: 'light',
    dataValue: 'theme',
    classSuffix: '',
  },

  // Edge runtime Vercelen
  nitro: {
    preset: 'vercel-edge',
  },

  supabase: {
    redirect: false,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/', '/api/products*', '/api/news*', '/api/search*'],
    },
  },

  runtimeConfig: {
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    secretKey: process.env.NUXT_SECRET_KEY,
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
      supabaseUrl: process.env.SUPABASE_URL ?? '',
      supabaseKey: process.env.SUPABASE_KEY ?? '',
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },
})
