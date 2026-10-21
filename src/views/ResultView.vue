<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

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
    // replace: isim gönderilen tur artık kapandı — geri tuşu bu forma değil,
    // doğrudan ana sayfaya dönmeli.
    router.replace({
      name: 'leaderboard',
      params: { slug: categorySlug ?? '' },
      query: { highlight: String(result.rank) },
    })
  } else {
    errorMessage.value = quiz.finishErrorMessage || tr.errors.validation_error
  }
}

function playAgain() {
  // replace: aynı sebeple — geri tuşu artık geçersiz olan bu sonuç ekranına dönmemeli.
  router.replace(categorySlug ? { name: 'play', params: { slug: categorySlug } } : { name: 'home' })
}
</script>

<template>
  <main class="relative mx-auto flex min-h-screen max-w-[640px] flex-col items-center justify-center gap-8 px-4 py-10">
    <RouterLink
      :to="{ name: 'home' }"
      class="absolute left-4 top-6 text-sm font-semibold text-primary-ink transition hover:underline motion-reduce:transition-none"
    >
      ← {{ tr.common.backToHome }}
    </RouterLink>

    <h1 class="animate-bounce-in font-display text-2xl font-bold text-text">{{ tr.result.title }}</h1>

    <div class="flex gap-10 text-center">
      <div class="animate-bounce-in" style="animation-delay: 100ms">
        <p class="font-display text-4xl font-extrabold text-primary-ink">{{ finalScore }}</p>
        <p class="text-sm text-text-muted">{{ tr.result.scoreLabel }}</p>
      </div>
      <div class="animate-bounce-in" style="animation-delay: 180ms">
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

    <button
      type="button"
      class="text-sm font-semibold text-primary-ink underline-offset-2 hover:underline"
      @click="playAgain"
    >
      {{ tr.result.playAgain }}
    </button>
  </main>
</template>
