<script setup lang="ts">
defineProps<{ total: number; completed: number }>()
</script>

<template>
  <div class="flex gap-1.5" role="img" :aria-label="`${Math.min(completed + 1, total)} / ${total}`">
    <span
      v-for="i in total"
      :key="i"
      class="h-2 w-2 rounded-full transition-colors duration-300 motion-reduce:transition-none"
      :class="i - 1 < completed ? 'bg-primary' : i - 1 === completed ? 'bg-primary/50' : 'bg-text-muted/30'"
    />
  </div>
</template>
