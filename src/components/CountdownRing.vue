<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ remainingMs: number; totalMs: number }>()

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const fraction = computed(() =>
  props.totalMs > 0 ? Math.max(0, Math.min(1, props.remainingMs / props.totalMs)) : 0,
)
const dashoffset = computed(() => CIRCUMFERENCE * (1 - fraction.value))
const seconds = computed(() => Math.ceil(props.remainingMs / 1000))
const isWarning = computed(() => props.remainingMs <= 2000)
</script>

<template>
  <div class="relative h-28 w-28" role="timer" :aria-label="`${seconds} saniye kaldı`">
    <svg viewBox="0 0 120 120" class="h-full w-full -rotate-90">
      <circle cx="60" cy="60" :r="RADIUS" fill="none" stroke="#E5E7EB" stroke-width="8" />
      <circle
        cx="60"
        cy="60"
        :r="RADIUS"
        fill="none"
        :stroke="isWarning ? 'var(--color-warning)' : 'var(--color-primary)'"
        stroke-width="8"
        stroke-linecap="round"
        :stroke-dasharray="CIRCUMFERENCE"
        :stroke-dashoffset="dashoffset"
        class="transition-[stroke-dashoffset] duration-100 ease-linear motion-reduce:transition-none"
      />
    </svg>
    <span
      class="absolute inset-0 flex items-center justify-center font-display text-2xl font-bold"
      :class="isWarning ? 'text-warning' : 'text-text'"
    >
      {{ seconds }}
    </span>
  </div>
</template>
