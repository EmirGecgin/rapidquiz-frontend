<script setup lang="ts">
import { computed } from 'vue'

export type ChoiceState = 'idle' | 'selected' | 'correct' | 'incorrect'

const props = withDefaults(
  defineProps<{
    text: string
    state: ChoiceState
    disabled?: boolean
  }>(),
  { disabled: false },
)

defineEmits<{ click: [] }>()

const variantClass = computed(() => {
  switch (props.state) {
    case 'correct':
      return 'border-success bg-success/20'
    case 'incorrect':
      return 'border-danger bg-danger/20'
    case 'selected':
      return 'border-primary bg-primary/10'
    default:
      return 'border-transparent bg-surface shadow-sm hover:border-primary/40'
  }
})
</script>

<template>
  <button
    type="button"
    class="min-h-14 rounded-surface border-2 px-4 py-3 text-left text-base font-semibold text-text transition motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-80"
    :class="variantClass"
    :disabled="disabled"
    :aria-pressed="state !== 'idle'"
    @click="$emit('click')"
  >
    <span class="flex items-center gap-2">
      <span v-if="state === 'correct'" aria-hidden="true">✓</span>
      <span v-else-if="state === 'incorrect'" aria-hidden="true">✗</span>
      {{ text }}
    </span>
  </button>
</template>
