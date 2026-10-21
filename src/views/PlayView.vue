<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import ChoiceButton, { type ChoiceState } from '@/components/ChoiceButton.vue'
import CountdownRing from '@/components/CountdownRing.vue'
import ProgressDots from '@/components/ProgressDots.vue'
import QuestionCard from '@/components/QuestionCard.vue'
import { useCountdown } from '@/composables/useCountdown'
import tr from '@/i18n'
import { useQuizStore } from '@/stores/quiz'

const props = defineProps<{ slug: string }>()
const router = useRouter()
const quiz = useQuizStore()

const introCount = ref<number | null>(null)
let cancelled = false

const countdown = useCountdown({
  onComplete: () => {
    if (quiz.phase === 'question') {
      quiz.submitAnswer(null)
    }
  },
})

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

async function runIntro() {
  for (const n of [3, 2, 1]) {
    if (cancelled) return
    introCount.value = n
    await wait(1000)
  }
  if (!cancelled) introCount.value = null
}

function handleKeydown(event: KeyboardEvent) {
  if (quiz.phase !== 'question') return
  const choiceIndex = Number(event.key) - 1
  if (choiceIndex >= 0 && choiceIndex < quiz.choices.length) {
    selectChoice(quiz.choices[choiceIndex].id)
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)
  await quiz.start(props.slug)
  if (cancelled || quiz.phase === 'error') return
  await runIntro()
  if (cancelled) return
  await quiz.loadNext()
})

onUnmounted(() => {
  cancelled = true
  window.removeEventListener('keydown', handleKeydown)
  countdown.stop()
})

watch(
  () => quiz.phase,
  (phase) => {
    if (phase === 'question') {
      countdown.start(quiz.timeLimitMs)
    } else {
      countdown.stop()
    }
    if (phase === 'done') {
      // replace: biten tur geçmişte kalmamalı — geri tuşu yarım kalmış bir
      // soruya değil, doğrudan ana sayfaya dönmeli.
      router.replace({ name: 'result' })
    }
  },
)

function selectChoice(choiceId: number) {
  if (quiz.phase !== 'question') return
  countdown.stop()
  quiz.submitAnswer(choiceId)
}

function choiceState(choiceId: number): ChoiceState {
  if (quiz.phase !== 'feedback') {
    return choiceId === quiz.selectedChoiceId ? 'selected' : 'idle'
  }
  if (choiceId === quiz.correctChoiceId) return 'correct'
  if (choiceId === quiz.selectedChoiceId) return 'incorrect'
  return 'idle'
}

function goHome() {
  quiz.reset()
  router.push({ name: 'home' })
}

const feedbackAnnouncement = computed(() => {
  if (quiz.phase !== 'feedback') return ''
  return quiz.isCorrect ? 'Doğru cevap!' : 'Yanlış cevap.'
})
</script>

<template>
  <main class="mx-auto flex min-h-screen max-w-[640px] flex-col px-4 py-6">
    <h1 class="sr-only">{{ tr.play.title }}</h1>

    <div v-if="introCount !== null" class="flex flex-1 items-center justify-center">
      <span class="font-display text-8xl font-extrabold text-primary-ink" aria-live="polite">{{ introCount }}</span>
    </div>

    <div
      v-else-if="quiz.phase === 'error'"
      class="flex flex-1 flex-col items-center justify-center gap-4 text-center"
    >
      <p class="text-danger-ink">{{ quiz.errorMessage || tr.errors.network_error }}</p>
      <button
        type="button"
        class="rounded-surface bg-primary-ink px-4 py-2 font-semibold text-white transition motion-reduce:transition-none"
        @click="goHome"
      >
        Ana sayfaya dön
      </button>
    </div>

    <template v-else-if="quiz.phase === 'question' || quiz.phase === 'feedback'">
      <div class="flex items-center justify-between">
        <ProgressDots :total="quiz.totalQuestions" :completed="quiz.index" />
        <span :key="quiz.score" class="animate-pop font-display text-lg font-bold text-primary-ink">{{
          quiz.score
        }}</span>
      </div>

      <div class="my-6 flex justify-center">
        <CountdownRing :remaining-ms="countdown.remainingMs.value" :total-ms="quiz.timeLimitMs" />
      </div>

      <QuestionCard :key="quiz.questionId ?? undefined" :text="quiz.questionText" class="animate-fade-up" />

      <p aria-live="polite" class="sr-only">{{ feedbackAnnouncement }}</p>

      <div class="mt-auto grid grid-cols-1 gap-3 pb-4">
        <ChoiceButton
          v-for="(choice, i) in quiz.choices"
          :key="choice.id"
          :text="choice.text"
          :state="choiceState(choice.id)"
          :disabled="quiz.phase !== 'question'"
          class="animate-fade-up"
          :style="{ animationDelay: `${i * 60}ms` }"
          @click="selectChoice(choice.id)"
        />
      </div>
    </template>

    <p v-else class="flex-1 text-center text-text-muted">{{ tr.common.loading }}</p>
  </main>
</template>
