<script setup lang="ts">
defineProps<{ text: string }>()
</script>

<template>
  <h2 class="text-center text-[22px] font-bold text-text sm:text-2xl">{{ text }}</h2>
</template>
