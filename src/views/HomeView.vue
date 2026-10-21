<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { fetchCategories } from '@/api/catalog'
import { ApiError } from '@/api/client'
import CategoryCard from '@/components/CategoryCard.vue'
import tr from '@/i18n'
import type { Category } from '@/types/api'

const categories = ref<Category[]>([])
const status = ref<'loading' | 'error' | 'ready'>('loading')
const errorMessage = ref('')

async function loadCategories() {
  status.value = 'loading'
  try {
    categories.value = await fetchCategories()
    status.value = 'ready'
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? tr.errors[error.code] : tr.errors.network_error
    status.value = 'error'
  }
}

onMounted(loadCategories)
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-[640px] flex-col gap-6 px-4 py-10">
    <header class="text-center">
      <h1 class="font-display text-4xl font-extrabold text-primary">{{ tr.home.title }}</h1>
      <p class="mt-2 text-text-muted">{{ tr.home.subtitle }}</p>
    </header>

    <ul class="space-y-2 rounded-surface bg-surface p-4 text-sm text-text shadow-sm">
      <li v-for="rule in tr.home.rules" :key="rule" class="flex gap-2">
        <span aria-hidden="true">✓</span>
        <span>{{ rule }}</span>
      </li>
    </ul>

    <section aria-labelledby="choose-category">
      <h2 id="choose-category" class="mb-3 font-display text-lg font-bold text-text">
        {{ tr.home.chooseCategory }}
      </h2>

      <p v-if="status === 'loading'" class="text-center text-text-muted">{{ tr.home.loadingCategories }}</p>

      <div v-else-if="status === 'error'" class="flex flex-col items-center gap-3 text-center">
        <p class="text-danger">{{ errorMessage || tr.home.categoriesError }}</p>
        <button
          type="button"
          class="rounded-surface bg-primary px-4 py-2 font-semibold text-white"
          @click="loadCategories"
        >
          {{ tr.common.retry }}
        </button>
      </div>

      <div v-else class="flex flex-col gap-3">
        <CategoryCard v-for="category in categories" :key="category.slug" :category="category" />
      </div>
    </section>
  </main>
</template>
