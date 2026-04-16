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
      class="flex flex-col items-center gap-3 py-12 text-center"
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
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>
      <p class="text-sm text-gray-500">Még nincs bejegyzésed.</p>
    </div>

    <article
      v-for="post in posts"
      :key="post.id"
      class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <div class="flex items-start justify-between gap-3">
        <h3 class="font-semibold text-gray-900 leading-snug">{{ post.title }}</h3>
        <span
          class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
          :class="post.published ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-500'"
        >
          {{ post.published ? 'Publikált' : 'Piszkozat' }}
        </span>
      </div>
      <p class="mt-2 text-sm text-gray-500 line-clamp-2">{{ post.content }}</p>
      <p class="mt-3 text-xs text-gray-400">
        {{ new Date(post.created_at).toLocaleDateString('hu-HU') }}
      </p>
    </article>
  </div>
</template>
