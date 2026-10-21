<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { fetchCategories } from '@/api/catalog'
import { ApiError } from '@/api/client'
import { fetchLeaderboard } from '@/api/leaderboard'
import tr from '@/i18n'
import type { Category, LeaderboardEntry, LeaderboardPeriod } from '@/types/api'

const props = defineProps<{ slug: string }>()
const route = useRoute()

const PERIODS: LeaderboardPeriod[] = ['day', 'week', 'all']
const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

const period = ref<LeaderboardPeriod>('all')
const entries = ref<LeaderboardEntry[]>([])
const status = ref<'loading' | 'error' | 'ready'>('loading')
const errorMessage = ref('')
const category = ref<Category | null>(null)

const highlightRank = computed(() => {
  const raw = route.query.highlight
  const value = Array.isArray(raw) ? raw[0] : raw
  return value ? Number(value) : null
})

async function load() {
  status.value = 'loading'
  try {
    entries.value = await fetchLeaderboard(props.slug, period.value)
    status.value = 'ready'
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? tr.errors[error.code] : tr.leaderboard.loadError
    status.value = 'error'
  }
}

async function loadCategory() {
  try {
    const categories = await fetchCategories()
    category.value = categories.find((c) => c.slug === props.slug) ?? null
  } catch {
    category.value = null
  }
}

onMounted(() => {
  loadCategory()
  load()
})

watch(period, load)
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-[640px] flex-col gap-6 px-4 py-10">
    <header class="relative text-center">
      <RouterLink
        :to="{ name: 'home' }"
        class="absolute left-0 top-1 text-sm font-semibold text-primary-ink transition hover:underline motion-reduce:transition-none"
      >
        ← {{ tr.common.backToHome }}
      </RouterLink>
      <h1 class="font-display text-2xl font-bold text-text">{{ tr.leaderboard.title }}</h1>
      <p class="text-text-muted">{{ category?.name ?? slug }}</p>
    </header>

    <div class="flex justify-center gap-2" role="tablist">
      <button
        v-for="p in PERIODS"
        :key="p"
        type="button"
        role="tab"
        :aria-selected="period === p"
        class="rounded-surface px-4 py-2 text-sm font-semibold transition motion-reduce:transition-none"
        :class="period === p ? 'bg-primary-ink text-white' : 'bg-surface text-text-muted shadow-sm'"
        @click="period = p"
      >
        {{ tr.leaderboard.tabs[p] }}
      </button>
    </div>

    <p v-if="status === 'loading'" class="text-center text-text-muted">{{ tr.common.loading }}</p>

    <div v-else-if="status === 'error'" class="flex flex-col items-center gap-3 text-center">
      <p class="text-danger-ink">{{ errorMessage }}</p>
      <button
        type="button"
        class="rounded-surface bg-primary-ink px-4 py-2 font-semibold text-white transition motion-reduce:transition-none"
        @click="load"
      >
        {{ tr.common.retry }}
      </button>
    </div>

    <p v-else-if="entries.length === 0" class="text-center text-text-muted">{{ tr.leaderboard.empty }}</p>

    <ul v-else class="flex flex-col gap-2">
      <li
        v-for="(entry, i) in entries"
        :key="entry.rank"
        class="animate-fade-up flex items-center gap-3 rounded-surface bg-surface p-3 shadow-sm"
        :class="entry.rank === highlightRank ? 'animate-ring-pulse ring-2 ring-primary-ink' : ''"
        :style="{ animationDelay: `${i * 50}ms` }"
      >
        <span
          class="w-8 shrink-0 text-center font-display text-lg font-bold text-text"
          :class="entry.rank <= 3 ? 'animate-pop' : ''"
        >
          {{ MEDALS[entry.rank] ?? entry.rank }}
        </span>
        <span class="flex-1 truncate font-semibold text-text">{{ entry.player_name }}</span>
        <span class="text-right text-sm text-text-muted">
          {{ entry.correct_count }} {{ tr.leaderboard.correctLabel }}
        </span>
        <span class="font-display font-bold text-primary-ink">{{ entry.score }}</span>
      </li>
    </ul>
  </main>
</template>
