<template>
  <main class="flex min-h-screen flex-col items-center justify-center bg-gray-50">
    <div class="text-center">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900">
        Farkas Web App
      </h1>
      <p class="mt-3 text-gray-500">Nuxt 3 · Supabase · Vercel Edge</p>
      <NuxtLink
        to="/dashboard"
        class="mt-6 inline-block rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
      >
        Dashboard →
      </NuxtLink>
    </div>
  </main>
</template>
