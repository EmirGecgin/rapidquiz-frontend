<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import NameForm from '@/components/NameForm.vue'
import tr from '@/i18n'
import { useQuizStore } from '@/stores/quiz'
import { useSessionStore } from '@/stores/session'

const router = useRouter()
const quiz = useQuizStore()
const sessionStore = useSessionStore()

// quiz.finish() sıfırlar; liderliğe yönlendirme ve "tekrar oyna" için bu
// anlık değerleri donduruyoruz.
const finalScore = quiz.score
const finalCorrectCount = quiz.correctCount
const categorySlug = sessionStore.categorySlug

const playerName = ref(sessionStore.lastPlayerName)
const submitting = ref(false)
const errorMessage = ref('')

async function submit() {
  errorMessage.value = ''
  submitting.value = true
  const result = await quiz.finish(playerName.value)
  submitting.value = false

  if (result) {
    router.push({
      name: 'leaderboard',
      params: { slug: categorySlug ?? '' },
      query: { highlight: String(result.rank) },
    })
  } else {
    errorMessage.value = quiz.finishErrorMessage || tr.errors.validation_error
  }
}

function playAgain() {
  router.push(categorySlug ? { name: 'play', params: { slug: categorySlug } } : { name: 'home' })
}
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-[640px] flex-col items-center justify-center gap-8 px-4 py-10">
    <h1 class="font-display text-2xl font-bold text-text">{{ tr.result.title }}</h1>

    <div class="flex gap-10 text-center">
      <div>
        <p class="font-display text-4xl font-extrabold text-primary">{{ finalScore }}</p>
        <p class="text-sm text-text-muted">{{ tr.result.scoreLabel }}</p>
      </div>
      <div>
        <p class="font-display text-4xl font-extrabold text-text">{{ finalCorrectCount }}</p>
        <p class="text-sm text-text-muted">{{ tr.result.correctLabel }}</p>
      </div>
    </div>

    <NameForm
      v-model="playerName"
      :submitting="submitting"
      :error-message="errorMessage"
      class="w-full"
      @submit="submit"
    />

    <button type="button" class="text-sm font-semibold text-primary underline-offset-2 hover:underline" @click="playAgain">
      {{ tr.result.playAgain }}
    </button>
  </main>
</template>
