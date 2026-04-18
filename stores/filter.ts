// stores/filter.ts
import { defineStore } from 'pinia'
import type { FilterCategory } from '~/types/climahub'

export const useFilterStore = defineStore('filter', () => {
  const activeCategory = ref<FilterCategory>('összes')

  function setCategory(cat: FilterCategory) {
    activeCategory.value = cat
  }

  function reset() {
    activeCategory.value = 'összes'
  }

  return { activeCategory, setCategory, reset }
})
