import { expect, test } from '@playwright/test'

const CATEGORY = { name: 'Tarih', slug: 'tarih', icon: 'landmark', color: '#E8B4A0', question_count: 2 }

const QUESTIONS = [
  {
    index: 0,
    question_id: 1,
    text: 'Soru 1?',
    choices: [
      { id: 10, text: 'A' },
      { id: 11, text: 'B' },
      { id: 12, text: 'C' },
      { id: 13, text: 'D' },
    ],
    time_limit_ms: 5000,
  },
  {
    index: 1,
    question_id: 2,
    text: 'Soru 2?',
    choices: [
      { id: 20, text: 'A' },
      { id: 21, text: 'B' },
      { id: 22, text: 'C' },
      { id: 23, text: 'D' },
    ],
    time_limit_ms: 5000,
  },
]

test('kategori seç → oyna → bitir → liderlik tablosunda gör', async ({ page }) => {
  let nextCallCount = 0
  let answerCallCount = 0

  await page.route('**/api/v1/categories/', (route) => route.fulfill({ json: [CATEGORY] }))

  await page.route('**/api/v1/sessions/', (route) => {
    if (route.request().method() !== 'POST') return route.continue()
    return route.fulfill({
      status: 201,
      json: { session_id: 's1', token: 'tok', total_questions: QUESTIONS.length, time_limit_ms: 5000 },
    })
  })

  await page.route('**/api/v1/sessions/s1/next/', (route) => {
    const data = nextCallCount < QUESTIONS.length ? QUESTIONS[nextCallCount] : { done: true }
    nextCallCount += 1
    return route.fulfill({ json: data })
  })

  await page.route('**/api/v1/sessions/s1/answer/', (route) => {
    answerCallCount += 1
    return route.fulfill({
      json: { is_correct: true, correct_choice_id: 10, points: 14, score: answerCallCount * 14, elapsed_ms: 500 },
    })
  })

  await page.route('**/api/v1/sessions/s1/finish/', (route) =>
    route.fulfill({ json: { score: 28, rank: 1, correct_count: 2 } }),
  )

  await page.route('**/api/v1/leaderboard/tarih/**', (route) =>
    route.fulfill({
      json: [
        { rank: 1, player_name: 'Test Oyuncu', score: 28, correct_count: 2, finished_at: new Date().toISOString() },
      ],
    }),
  )

  await page.goto('/')
  await expect(page.getByRole('link', { name: /Tarih/ })).toBeVisible()
  await page.getByRole('link', { name: /Tarih/ }).click()

  await expect(page).toHaveURL(/\/play\/tarih/)
  await expect(page.getByText('Soru 1?')).toBeVisible({ timeout: 6000 })

  await page.getByRole('button', { name: 'A' }).click()
  await expect(page.getByText('Soru 2?')).toBeVisible({ timeout: 3000 })

  await page.getByRole('button', { name: 'A' }).click()
  await expect(page).toHaveURL(/\/result/, { timeout: 3000 })
  await expect(page.getByText('28', { exact: true })).toBeVisible()

  await page.getByPlaceholder('Adını yaz').fill('Test Oyuncu')
  await page.getByRole('button', { name: 'Liderlik tablosuna gir' }).click()

  await expect(page).toHaveURL(/\/leaderboard\/tarih\?highlight=1/)
  await expect(page.getByText('Test Oyuncu')).toBeVisible()
})
