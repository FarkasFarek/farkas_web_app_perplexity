<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const user = useSupabaseUser()
</script>

<template>
  <main class="min-h-screen bg-gray-50">
    <div class="max-w-2xl mx-auto px-4 py-10">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">
          Dashboard
        </h1>
        <p class="mt-1 text-sm text-gray-500">
          Bejelentkezve:
          <span class="font-medium text-gray-700">{{ user?.email }}</span>
        </p>
      </div>

      <!-- Posts szekció -->
      <section>
        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Bejegyzéseid
        </h2>

        <Suspense>
          <DashboardPosts />
          <!-- Skeleton fallback -->
          <template #fallback>
            <div class="space-y-3" aria-label="Betöltés...">
              <div
                v-for="i in 4"
                :key="i"
                class="h-24 rounded-xl bg-gray-100 animate-pulse"
              />
            </div>
          </template>
        </Suspense>
      </section>
    </div>
  </main>
</template>
