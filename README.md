# HızlıQuiz (RapidQuiz) — Frontend

Girişsiz, hızlı bilgi yarışması oyunu. Bir kategori seç, 10 soruluk bir tur oyna — her soru için
5 saniyen var, ne kadar hızlı ve doğru cevaplarsan o kadar çok puan kazanırsın. Tur bitince ismini
yaz ve kategorinin liderlik tablosuna gir.

Bu repo, oyunun **Vue 3 frontend**'ini içerir. Backend (Django/DRF) ayrı bir repoda:
[rapidquiz-backend](https://github.com/EmirGecgin/rapidquiz-backend).

## Özellikler

- Ana sayfa: kural özeti + renkli kategori kartları
- Oyun ekranı: 3-2-1 başlangıç, dairesel sayaç (rAF tabanlı, sekme arka plandayken durmaz), klavye 1-4 ile şık seçimi
- Sonuç ekranı: skor + isim formu, liderlik tablosuna yönlendirme, tekrar oyna
- Liderlik tablosu: Bugün/Hafta/Tümü sekmeleri, ilk 3'e madalya, vurgulanan satır (`?highlight=`)
- Erişilebilirlik: `aria-live` duyuruları, `prefers-reduced-motion` desteği, WCAG AA uyumlu metin/buton renkleri, 360px'ten 640px'e responsive
- Yumuşak sayfa geçişleri ve mikro-etkileşim animasyonları (doğru/yanlış geri bildirimi, skor/madalya efektleri)

## Teknoloji

Vite, Vue 3 (`<script setup>`, TypeScript), Pinia, Vue Router (history), Axios, Tailwind CSS 4,
Vitest, Playwright.

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
- `npm run e2e` — Playwright E2E testi (API mock'lu, backend gerektirmez; gerekirse önce `npx playwright install chromium`)

## Yapı

- `src/api/client.ts` — Axios instance; `X-Session-Token` header'ı Pinia'daki oturumdan otomatik eklenir, backend hata zarfı (`{"error":{"code","message"}}`) `ApiError`'a eşlenir.
- `src/stores/session.ts` — aktif oturum (session id/token) yalnızca Pinia'da; son oyuncu ismi `localStorage`'da (try/catch ile, kullanılamıyorsa sessizce yutulur).
- `src/stores/quiz.ts` — oyun akışı (`start`/`loadNext`/`submitAnswer`/`finish`) ve puan/süre state'i.
- `src/composables/useCountdown.ts` — rAF tabanlı geri sayım; her tick'te gerçek geçen süreyi hesaplar, sekme arka plana alınsa bile doğru kalır.
- `src/router/index.ts` — `/`, `/play/:slug`, `/result`, `/leaderboard/:slug` (HTML5 history mode). Tamamlanan bir turun adımları (`play → result → leaderboard`) tarayıcı geçmişinde `replace` ile ilerler, böylece geri tuşu her zaman ana sayfaya döner; `/play` ve `/result` ayrıca taze yüklendiğinde (yenileme dahil) ana sayfaya yönlendirir, çünkü oyun state'i yalnızca Pinia'da tutulur.
- `src/i18n/tr.json` — tüm arayüz metinleri.
- `src/types/api.ts` — backend API'siyle birebir eşleşen TypeScript tipleri.
- `e2e/` — Playwright E2E testleri, backend API'si `page.route()` ile mock'lanır.

## Tasarım token'ları

`src/assets/main.css` içinde Tailwind `@theme` ile tanımlı: `--color-bg`, `--color-surface`,
`--color-primary`, `--color-text`, `--color-text-muted`, `--color-success`, `--color-danger`,
`--color-warning`, fontlar (Nunito + Inter, Google Fonts üzerinden `index.html`'de yükleniyor).

Ana renklerin (`primary/success/danger/warning`) beyaz üzerinde metin olarak WCAG AA kontrastını
(4.5:1) karşılamadığı tespit edildiği için, aynı tonlarda koyulaştırılmış `-ink` varyantları
(`--color-primary-ink` vb.) eklendi; okunur metin ve beyaz yazılı butonlarda bunlar kullanılıyor,
orijinal renkler yalnızca dekoratif kullanımlarda (dairesel sayaç çizgisi, ilerleme noktaları,
kart aksan rengi) kalıyor.

## Geliştirme süreci

Bu proje [Claude Code](https://claude.com/claude-code) ile fazlara bölünerek geliştirildi; her
fazın kapsamı ve teknik kararları [`CLAUDE.md`](./CLAUDE.md) dosyasında kayıtlıdır.
