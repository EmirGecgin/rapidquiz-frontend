import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import LeaderboardView from '@/views/LeaderboardView.vue'
import PlayView from '@/views/PlayView.vue'
import ResultView from '@/views/ResultView.vue'

// Oyun ve sonuç durumu yalnızca Pinia'da (bellekte) tutulur; sayfa doğrudan
// açılır/yenilenirse bu state boş olur, o yüzden ana sayfaya yönlendiriyoruz.
// `from.matched.length === 0` tam olarak "bu, uygulamanın ilk navigasyonu" anlamına gelir.
function redirectFreshLoadsHome(_to: unknown, from: { matched: unknown[] }) {
  if (from.matched.length === 0) {
    return { name: 'home' }
  }
  return true
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/play/:slug', name: 'play', component: PlayView, props: true, beforeEnter: redirectFreshLoadsHome },
    { path: '/result', name: 'result', component: ResultView, beforeEnter: redirectFreshLoadsHome },
    { path: '/leaderboard/:slug', name: 'leaderboard', component: LeaderboardView, props: true },
  ],
})

export default router
