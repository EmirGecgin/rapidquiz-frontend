<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { iconFor } from '@/components/categoryIcons'
import type { Category } from '@/types/api'

defineProps<{ category: Category }>()
</script>

<template>
  <RouterLink
    :to="{ name: 'play', params: { slug: category.slug } }"
    class="group relative flex items-center gap-4 overflow-hidden rounded-surface bg-surface py-4 pl-6 pr-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    :style="{ outlineColor: category.color }"
  >
    <span class="absolute inset-y-0 left-0 w-1.5" :style="{ backgroundColor: category.color }" aria-hidden="true" />
    <span
      class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl transition group-hover:scale-110"
      :style="{ backgroundColor: category.color + '33' }"
      aria-hidden="true"
    >
      {{ iconFor(category.icon) }}
    </span>
    <span class="flex-1 text-left">
      <span class="block font-display text-lg font-bold text-text">{{ category.name }}</span>
      <span class="block text-sm text-text-muted">{{ category.question_count }} soru</span>
    </span>
    <span class="text-xl text-text-muted transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
  </RouterLink>
</template>
