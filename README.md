# RapidQuiz Frontend

Girişsiz, hızlı bilgi yarışması — Vue 3 (`<script setup>`, TS) frontend.
Detaylı spesifikasyon ve faz geçmişi için [`CLAUDE.md`](./CLAUDE.md).

## Teknoloji

Vite, Vue 3, Pinia, Vue Router (history), Axios, Tailwind CSS 4, Vitest, Playwright.

## Yerel geliştirme

```bash
npm install
cp .env.example .env   # VITE_API_BASE_URL — backend'in çalıştığı adres
npm run dev
```

Backend'in `http://localhost:8000` üzerinde çalışıyor olması gerekir (bkz. `rapidquiz-backend`).

## Komutlar

- `npm run dev` — geliştirme sunucusu
- `npm run build` — tip kontrolü + prod build (`dist/`)
- `npm run preview` — prod build'i yerelde servis et
- `npm run test` — Vitest birim testleri
- `npm run typecheck` — yalnızca tip kontrolü

## Yapı

- `src/api/client.ts` — Axios instance; `X-Session-Token` header'ı Pinia'daki oturumdan otomatik eklenir, backend hata zarfı (`{"error":{"code","message"}}`) `ApiError`'a eşlenir.
- `src/stores/session.ts` — aktif oturum (session id/token) yalnızca Pinia'da; son oyuncu ismi `localStorage`'da (try/catch ile, kullanılamıyorsa sessizce yutulur).
- `src/router/index.ts` — `/`, `/play/:slug`, `/result`, `/leaderboard/:slug` (HTML5 history mode).
- `src/i18n/tr.json` — tüm arayüz metinleri.
- `src/types/api.ts` — backend API'siyle birebir eşleşen TypeScript tipleri.

## Tasarım token'ları

`src/assets/main.css` içinde Tailwind `@theme` ile tanımlı: `--color-bg`, `--color-surface`,
`--color-primary`, `--color-text`, `--color-text-muted`, `--color-success`, `--color-danger`,
`--color-warning`, fontlar (Nunito + Inter, Google Fonts üzerinden `index.html`'de yükleniyor).
