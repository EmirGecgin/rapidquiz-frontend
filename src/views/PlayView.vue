<script setup lang="ts">
import tr from '@/i18n'

defineProps<{ slug: string }>()
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
    <h1 class="font-display text-2xl font-bold text-text">{{ tr.play.title }} — {{ slug }}</h1>
    <p class="text-text-muted">{{ tr.common.comingSoon }}</p>
  </main>
</template>
