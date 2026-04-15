<script setup lang="ts">
interface Post {
  id: string
  title: string
  content: string
  published: boolean
  created_at: string
}

const {  posts, error } = await useFetch<Post[]>('/api/posts/mine')
</script>

<template>
  <div class="space-y-4">
    <div v-if="error" class="py-4 text-center text-sm text-red-500">
      Hiba a posztok betöltésekor.
    </div>

    <div
      v-else-if="!posts?.length"
      class="flex flex-col items-center gap-3 py-16 text-center text-gray-400"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-10 w-10 text-gray-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
        />
      </svg>
      <p class="text-sm">Még nincs egy bejegyzésed sem.</p>
    </div>

    <article
      v-for="post in posts"
      :key="post.id"
      class="rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md"
    >
      <div class="mb-2 flex items-start justify-between gap-3">
        <h3 class="leading-snug font-semibold text-gray-800">
          {{ post.title }}
        </h3>

        <span
          :class="post.published ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-gray-50 text-gray-500 ring-gray-200'"
          class="shrink-0 rounded-full px-2 py-0.5 text-xs ring-1"
        >
          {{ post.published ? 'Publikus' : 'Vázlat' }}
        </span>
      </div>

      <p class="line-clamp-2 text-sm leading-relaxed text-gray-500">
        {{ post.content }}
      </p>

      <p class="mt-3 text-xs text-gray-400">
        {{ new Date(post.created_at).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' }) }}
      </p>
    </article>
  </div>
</template>
