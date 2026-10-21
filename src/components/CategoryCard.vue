<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { iconFor } from '@/components/categoryIcons'
import type { Category } from '@/types/api'

defineProps<{ category: Category }>()
</script>

<template>
  <RouterLink
    :to="{ name: 'play', params: { slug: category.slug } }"
    class="flex items-center gap-4 rounded-surface bg-surface p-4 shadow-sm transition hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
    :style="{ outlineColor: category.color }"
  >
    <span
      class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl"
      :style="{ backgroundColor: category.color + '33' }"
      aria-hidden="true"
    >
      {{ iconFor(category.icon) }}
    </span>
    <span class="flex-1 text-left">
      <span class="block font-display text-lg font-bold text-text">{{ category.name }}</span>
      <span class="block text-sm text-text-muted">{{ category.question_count }} soru</span>
    </span>
  </RouterLink>
</template>
