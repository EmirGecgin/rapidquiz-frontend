# RapidQuiz Frontend — CLAUDE.md

Bu dosya her fazdan sonra güncellenir. Yeni bir oturum başlarken önce bu dosyayı oku.

## Durum
- Son tamamlanan faz: **F3 — Oyun** (2026-10-21)
- Sıradaki faz: **F4 — Sonuç + NameForm**
- **Önemli**: F3 sırasında backend'de gerçek bir bug bulundu ve düzeltildi — `X-Session-Token` header'ı CORS preflight'ta izinli değildi (Django test client bunu simüle etmediği için backend testlerinde yakalanmamıştı, yalnızca gerçek tarayıcı testinde ortaya çıktı). `rapidquiz-backend`'de `CORS_ALLOW_HEADERS`'a eklendi (commit d13b877). **Bu, backend ile ilgili her entegrasyonun mutlaka gerçek tarayıcıda test edilmesi gerektiğinin kanıtı — birim testleri yetmiyor.**
- F3'te yapılanlar:
  - `src/composables/useCountdown.ts`: rAF tabanlı geri sayım. Her tick'te `performance.now() - startedAt` ile gerçek geçen süre hesaplanıyor (biriktirmeli sayaç değil) — bu sayede **sekme arka plana alınıp rAF duraklasa bile**, tekrar öne geldiğinde gerçek süre doğru yakalanıyor ("sekme değişince sayaç durmaz" kuralı). Sunucu zaten `shown_at`/`answered_at` ile kendi hesabını yapıyor, istemci sayacı yalnızca görsel.
  - `src/api/game.ts`: `startSession`/`fetchNextQuestion`/`submitAnswer`.
  - `src/stores/quiz.ts` (`useQuizStore`): `start`→`loadNext`→`submitAnswer` akışı, `phase` state machine (`idle/loading/question/feedback/done/error`), feedback sonrası 1sn bekleyip otomatik `loadNext()` (store içinde `setTimeout`, view'da değil — test edilebilirlik ve tek sorumluluk için).
  - Bileşenler: `ChoiceButton` (idle/selected/correct/incorrect, ≥56px — `min-h-14`), `QuestionCard` (`text-[22px]`+), `CountdownRing` (SVG, son 2sn sarı, `motion-reduce:` ile animasyon kapatılıyor), `ProgressDots` (10 nokta, `role="img"` + `aria-label`).
  - `PlayView.vue`: mount'ta `quiz.start(slug)` → 3-2-1 intro (`setTimeout` tabanlı, component unmount'ta iptal ediliyor) → `quiz.loadNext()`; klavye 1-4 (`window` düzeyinde `keydown`, yalnızca `phase==='question'` iken); `aria-live="polite"` ile doğru/yanlış duyurusu; `phase==='done'` olunca `/result`'a yönlendirme; hata durumunda "Ana sayfaya dön" (bu, `quiz.reset()` çağıran TEK yer — doğal done→result geçişinde state SİLİNMİYOR çünkü F4'teki `/finish/` çağrısı hâlâ oturum token'ına ihtiyaç duyacak).
  - Router: `/play/:slug` ve `/result`'a `beforeEnter` guard'ı eklendi — `from.matched.length === 0` ise (taze yükleme/yenileme) ana sayfaya yönlendiriyor, çünkü oyun state'i yalnızca Pinia'da (bellekte).
  - 38/38 test geçti (useCountdown sahte zamanlayıcıyla — rAF dahil `vi.useFakeTimers({toFake:[...]})`; quiz store; 4 sunum bileşeni; PlayView'ın tam entegrasyon testi: 3-2-1 intro, klavye seçimi, geri bildirim sonrası otomatik ilerleme, done→/result yönlendirmesi).
  - Gerçek backend'e karşı tarayıcıda tam oyun turu oynanarak doğrulandı (CORS düzeltmesinden sonra): intro, sayaç, soru/şık render'ı, cevap gönderimi, done→/result akışı hatasız çalıştı.
- F2'de yapılanlar: `src/api/catalog.ts` (`fetchCategories`), `src/components/CategoryCard.vue` (RouterLink ile `/play/:slug`'a bağlı, kategori rengiyle tonlanmış ikon rozeti — `src/components/categoryIcons.ts`'te slug→emoji eşlemesi, **kasıtlı olarak bir ikon kütüphanesi eklenmedi** çünkü Teknoloji listesinde yok). `HomeView.vue`: kural özeti kutusu + kategori listesi, 3 durum (`loading`/`error`/`ready`) — hata durumunda `tr.errors[code]` mesajı + "Tekrar dene" butonu (gerçek backend kapatılıp açılarak uçtan uca doğrulandı). Ana içerik genişliği `max-w-[640px]`'e sabitlendi (F6'nın 360-640px responsive hedefiyle uyumlu, tek sütun kart listesi). 16/16 test geçti (CategoryCard render/link, HomeView loading/error/retry/success — `fetchCategories` mock'landı), `npm run typecheck`/`build` temiz, tarayıcıda gerçek backend'e karşı görsel + fonksiyonel doğrulandı (backend durdurulup "Sunucuya bağlanılamadı" mesajı, yeniden başlatılıp "Tekrar dene" ile kurtarma test edildi).
- F1'de yapılanlar: `npm install` ile gerçek paket kurulumu — **Tailwind CSS 4** (`@tailwindcss/vite` eklentisi, `tailwind.config.js` yok, token'lar `src/assets/main.css`'te `@theme` ile tanımlı), Vue 3.5/Pinia 4/Vue Router 5/Axios 1.20 (güncel major'lar — proje Ekim 2026'da kuruldu). **Önemli uyumluluk notu**: `typescript@7` (native "tsgo" portu) `vue-tsc@3.3.13` ile paket exports uyuşmazlığı veriyor (`ERR_PACKAGE_PATH_NOT_EXPORTED`) — `typescript` bilerek `6.0.3`'e sabitlendi, ileride vue-tsc TS7 desteği netleşmeden yükseltilmemeli. `vite.config.ts`'te tip birleşimi için `vitest/config`'ten `defineConfig` import ediliyor (düz `vite`'tan değil, yoksa `test` alanı tip hatası veriyor). `tsconfig.app.json`/`tsconfig.node.json`'da `noEmit:true` + `baseUrl` kaldırıldı (TS 6'da deprecated, yalnızca `paths` yeterli) — yoksa `vue-tsc -b` `vite.config.js/.d.ts` gibi derlenmiş dosyaları repoya sızdırıyordu.
  - `src/api/client.ts`: Axios instance, `attachSessionToken`/`mapError` ayrı fonksiyonlar olarak export edildi (test edilebilirlik için) — `X-Session-Token` header'ı Pinia session store'dan otomatik ekleniyor, backend `{"error":{"code","message"}}` zarfı `ApiError`'a eşleniyor (bilinmeyen/network hatası → `network_error`).
  - `src/stores/session.ts`: Pinia setup store — `sessionId/token/categorySlug` yalnızca bellekte; `lastPlayerName` `localStorage`'da try/catch ile (gizli sekmede sessizce no-op).
  - `src/router/index.ts`: `createWebHistory`, 4 route (`/`, `/play/:slug`, `/result`, `/leaderboard/:slug`) → şimdilik boş view'lar (yalnızca başlık + "Yakında").
  - `src/i18n/tr.json`: tüm metinler + B1'deki 9 hata koduna karşılık gelen TR mesajlar (`errors.*`).
  - `src/types/api.ts`: backend yanıtlarıyla birebir TS tipleri (`NextQuestionResponse` union — `{done:true}` veya tam soru objesi).
  - 11/11 Vitest testi geçti (router→view eşlemesi, axios interceptor'ları, session store), `npm run typecheck` ve `npm run build` temiz, dev server'da tarayıcıda 4 route da görsel olarak doğrulandı (Nunito başlıklar, `#6BA6A0` primary renk, soft arka plan uygulanmış).
  - `.do/app.yaml` backend reposunda zaten bu repoyu (`rapidquiz-frontend`) `static_sites.web` olarak referans alıyor (`npm ci && npm run build`, `output_dir: dist`, `VITE_API_BASE_URL` BUILD_TIME).
- Not: Backend ayrı repoda (`rapidquiz-backend`), API tabanı `VITE_API_BASE_URL` ile verilir.

## Kurallar (her fazda geçerli)
- Puan, süre, sıralama YALNIZCA sunucuda hesaplanır; frontend asla kendi puan/süre hesaplamaz, sunucudan döneni gösterir.
- Oyun istekleri `X-Session-Token` başlığıyla gider, çerez yok.
- Hata biçimi: `{"error":{"code","message"}}`. Kodlar: `invalid_token, session_expired, session_finished, question_mismatch, already_answered, invalid_name, rate_limited, not_found, validation_error`.
- Her faz testleriyle biter; testler geçmeden faz bitmez. Yalnızca istenen fazı yap.

## Teknoloji
Vue 3 (`<script setup>`, TS), Vite, Pinia, Vue Router (history), Axios, Tailwind, Vitest, Playwright.
Deploy: DigitalOcean App Platform — static site.

## API (`/api/v1`, backend reposunda)
| Metot | Yol | Gövde → Yanıt |
|---|---|---|
| GET | `/health/` | → `{status:"ok"}` |
| GET | `/categories/` | → `[{name,slug,icon,color,question_count}]` |
| POST | `/sessions/` | `{category,platform}` → `{session_id,token,total_questions,time_limit_ms}` |
| POST | `/sessions/{id}/next/` | → `{index,question_id,text,choices:[{id,text}],time_limit_ms}` veya `{done:true}` |
| POST | `/sessions/{id}/answer/` | `{question_id,choice_id\|null}` → `{is_correct,correct_choice_id,points,score,elapsed_ms}` |
| POST | `/sessions/{id}/finish/` | `{player_name}` → `{score,rank,correct_count}` |
| GET | `/leaderboard/{slug}/?period=&limit=` | → `[{rank,player_name,score,correct_count,finished_at}]` (limit ≤100) |

## Oyun Akışı
- Kategoriler (slug): `spor`, `genel-kultur`, `yazilim`, `yapay-zeka-teknoloji`, `tarih`.
- Tur başına 10 soru, soru başına 5 sn. Kart → `POST /sessions` → 3-2-1 → `/next` → sayaç başlar → seçim veya süre dolması (`choice_id:null`) → `/answer` → 1 sn geri bildirim → tekrar; `done` → `/result` → `/finish` → liderlik.
- İsim: 2–20 karakter, harf (Türkçe dahil)/rakam/boşluk/`_-.`.

## Arayüz
- Sayfalar: `/` (kural özeti + 5 kategori kartı) · `/play/:slug` (3-2-1, sonra soru) · `/result` (skor + isim) · `/leaderboard/:slug` (sekmeler, Bugün/Hafta/Tümü, `?highlight=<rank>` satırı vurgulu).
- Stil: soft, ferah, her yaşa uygun. `--bg #F7F9F8`, `--surface #FFF` (16px köşe, hafif gölge), `--primary #6BA6A0`, `--text #2F3A3A`, `--text-muted #6B7878`, `--success #7CC6A0`, `--danger #F0A3A3`, `--warning #F3C27A`. Nunito + Inter (latin-ext).
- Soru ekranında sadece: ilerleme (3/10), skor, dairesel sayaç (son 2 sn sarı, sayı yazılı), soru (mobil ≥22px), 4 şık (≥56px, ekranın alt yarısı).
- Gönderimde şıklar kilitlenir; doğru şık hep gösterilir (yeşil+ikon / kırmızımsı+ikon). Klavye 1–4, `aria-live`, WCAG AA, `prefers-reduced-motion`, 360px'ten masaüstüne (maks 640px). Sekme değişince sayaç durmaz. Sayfa yenilenirse ana sayfa. Metinler `src/i18n/tr.json`'da.
- Token/oturum yalnızca Pinia'da; son isim `localStorage`'da önerilir (try/catch).
- Kategori renkleri: spor `#8EC5E8`, genel-kultur `#F5C98B`, yazilim `#A9B8F0`, yapay-zeka-teknoloji `#C6A9E8`, tarih `#E8B4A0`.

## Deploy
- `.do/app.yaml` (bu repoda, backend ile birlikte kök seviyede ya da sadece bu repo static_sites.web olarak): `npm ci && npm run build`, `output_dir: dist`, `catchall_document: index.html`, BUILD_TIME `VITE_API_BASE_URL`.

## Fazlar
- **F1** İskelet: Vite+Vue+TS, Pinia, Router, Axios client (token başlığı, hata eşleme), Tailwind + token'lar, fontlar, tr.json, boş view'lar.
- **F2** Ana sayfa + CategoryCard (yükleniyor/hata durumları).
- **F3** Oyun: `useQuizStore`, `useCountdown` (rAF), PlayView, CountdownRing, QuestionCard, ChoiceButton, ProgressDots; Vitest (sahte zamanlayıcı).
- **F4** Sonuç + NameForm, `/finish`, liderliğe yönlendirme, tekrar oyna.
- **F5** Liderlik tablosu, filtreler, vurgu, ilk 3 madalya.
- **F6** Erişilebilirlik, 360px, meta/favicon, Playwright E2E (API mock), README.
