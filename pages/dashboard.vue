<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const user = useSupabaseUser()
</script>

<template>
  <main class="min-h-screen bg-gray-50">
    <div class="mx-auto max-w-2xl px-4 py-10">
      <div class="mb-8">
        <h1 class="text-2xl font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>
        <p class="mt-1 text-sm text-gray-500">
          Bejelentkezve:
          <span class="font-medium text-gray-700">{{ user?.email }}</span>
        </p>
      </div>

      <section>
        <h2 class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
          Bejegyzéseid
        </h2>

        <Suspense>
          <DashboardPosts />

          <template #fallback>
            <div class="space-y-3" aria-label="Betöltés...">
              <div
                v-for="i in 4"
                :key="i"
                class="h-24 animate-pulse rounded-xl bg-gray-100"
              />
            </div>
          </template>
        </Suspense>
      </section>
    </div>
  </main>
</template>
