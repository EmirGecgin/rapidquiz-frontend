import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import LeaderboardView from '@/views/LeaderboardView.vue'
import PlayView from '@/views/PlayView.vue'
import ResultView from '@/views/ResultView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/play/:slug', name: 'play', component: PlayView, props: true },
    { path: '/result', name: 'result', component: ResultView },
    { path: '/leaderboard/:slug', name: 'leaderboard', component: LeaderboardView, props: true },
  ],
})

export default router
