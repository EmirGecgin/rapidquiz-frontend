<script setup lang="ts">
import tr from '@/i18n'

defineProps<{ modelValue: string; submitting: boolean; errorMessage: string }>()
const emit = defineEmits<{ 'update:modelValue': [string]; submit: [] }>()
</script>

<template>
  <form class="flex flex-col gap-3" @submit.prevent="emit('submit')">
    <label for="player-name" class="text-sm font-semibold text-text">{{ tr.result.nameLabel }}</label>
    <input
      id="player-name"
      :value="modelValue"
      type="text"
      maxlength="20"
      autocomplete="off"
      :placeholder="tr.result.namePlaceholder"
      class="min-h-14 rounded-surface border-2 border-transparent bg-surface px-4 text-base text-text shadow-sm focus:border-primary focus:outline-none"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="errorMessage" role="alert" class="text-sm text-danger">{{ errorMessage }}</p>
    <button
      type="submit"
      class="min-h-14 rounded-surface bg-primary font-semibold text-white transition disabled:opacity-60"
      :disabled="submitting"
    >
      {{ submitting ? tr.result.submitting : tr.result.submit }}
    </button>
  </form>
</template>
