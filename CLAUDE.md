# RapidQuiz Frontend — CLAUDE.md

Bu dosya her fazdan sonra güncellenir. Yeni bir oturum başlarken önce bu dosyayı oku.

## Durum
- **Faz dışı düzeltme + UX cilası (2026-10-22, kullanıcı gerçek kullanımda bulduktan sonra)**:
  - **Kritik navigasyon hatası**: `PlayView`→`/result` ve `ResultView`→`/leaderboard` (ve "tekrar oyna") geçişleri `router.push` kullanıyordu, bu yüzden tarayıcı geçmişinde Play/Result adımları birikiyordu. Liderlik tablosundan geri tuşuna basınca kullanıcı artık geçersiz olan isim formuna (Result), bir daha basınca da yeni bir tur başlatan Play'e düşüyordu. **Düzeltme**: bu üç geçiş `router.replace`'e çevrildi — artık geçmişte yalnızca Home→Leaderboard kalıyor, geri tuşu doğrudan ana sayfaya dönüyor (tarayıcıda canlı doğrulandı: `navigate back` → doğrudan `/`). Ayrıca `LeaderboardView` ve `ResultView`'a açıkça tıklanabilir "← Ana Sayfa" linki eklendi (kullanıcının "liderlik tablosunda sıkışıp kalıyorum" şikayetinin asıl çözümü — geri tuşuna güvenmeden de çıkış yolu olsun diye).
  - **Görsel/animasyon cilası** ("arayüz tekdüze" geri bildirimi üzerine): `main.css`'e `prefers-reduced-motion` için global güvenlik ağı (`animation-duration`/`transition-duration` sıfıra iniyor) + 5 keyframe (`pop`, `shake`, `bounce-in`, `fade-up`, `ring-pulse`) eklendi. `App.vue`'da route değişiminde cross-fade. `CategoryCard`: kategori renginde sol kenar aksan çubuğu (önceden renk yalnızca küçük ikon rozetinde %20 opaklıktaydı), hover'da kalkma/gölge + ok ikonu kayması, giriş sırasında kademeli (stagger) fade-up. `ChoiceButton`: basılı efekti (`active:scale`), doğru cevapta bounce-in, yanlış cevapta shake. `PlayView`: soru metni her değiştiğinde fade-up (key'li), skor her değiştiğinde pop animasyonu (key'li), şıklar kademeli giriyor. `ResultView`: başlık/skor bounce-in. `LeaderboardView`: satırlar kademeli giriyor, ilk 3 madalya pop, vurgulanan satır nabız gibi atan halka (`ring-pulse`). Tüm yeni animasyonlar global `prefers-reduced-motion` kuralıyla otomatik devre dışı kalıyor.
  - 54/54 test geçti (LeaderboardView testine eksik `home` route eklendi), build/typecheck temiz, tarayıcıda gerçek bir tur oynanıp (10 soru, klavye ile) liderlik tablosuna ulaşıldı, geri tuşu doğrudan ana sayfaya döndüğü canlı doğrulandı.
- Son tamamlanan faz: **F6 — Erişilebilirlik, 360px, meta/favicon, Playwright E2E, README** (2026-10-22)
- Sıradaki faz: **(yok — frontend F1-F6 tamamlandı)**
- F6'da yapılanlar:
  - **WCAG AA renk düzeltmesi (önemli bulgu)**: spec'teki `--color-primary/success/danger/warning` değerlerinin hiçbiri beyaz üzerinde METİN olarak AA'yı (4.5:1) karşılamıyor (gerçek kontrast oranları hesaplandı: primary 2.77, success 2.01, danger 2.01, warning 1.64 — hepsi 3:1'in bile altında). Token değerleri spec'in kendisi olduğu için DEĞİŞTİRİLMEDİ; bunun yerine aynı ton, koyulaştırılmış `--color-*-ink` varyantları eklendi (`src/assets/main.css`, 4.5:1'e göre hesaplanmış: primary→#4D807A, success→#3A845E, danger→#DE3535, warning→#A7690F) ve tüm okunur metin/beyaz-yazılı-buton kullanımları bunlara geçirildi (başlıklar, skor sayıları, hata mesajları, submit/retry butonları, sekme aktif durumu, liderlik vurgu halkası). Orijinal token'lar yalnızca dekoratif/non-text kullanımlarda kaldı (CountdownRing'in ring çizgisi, ProgressDots dolgusu, ChoiceButton'ın seçili tint'i, kategori kartı focus outline'ı).
  - `prefers-reduced-motion`: kalan `transition` kullanan tüm bileşenlere (`ChoiceButton`, `CategoryCard`, butonlar, sekmeler) `motion-reduce:transition-none` eklendi.
  - `PlayView`'a eksik olan görünmez `<h1>` (`sr-only`) eklendi — ekran okuyucu kullanıcıları için sayfa başlığı artık her view'da var.
  - `public/favicon.svg` + `index.html`'e `theme-color`, `description`, Open Graph meta etiketleri eklendi.
  - **360px-640px responsive doğrulaması**: tarayıcıda 360px ve 640px genişliklerde tüm sayfalar kontrol edildi, taşma yok. PlayView'da şıkların gerçekten "ekranın alt yarısında" olduğu (`mt-auto` ile) DOM ölçümüyle kanıtlandı (`choicesRect.top=440/740px`) — uzun emüle viewport'ların panel ekranına sığdırılırken kırpılması nedeniyle ekran görüntüleri yanıltıcıydı, bu yüzden atomic `browser_batch` içinde JS ölçümü kullanıldı; gelecekte benzer uzun-sayfa doğrulamalarında ekran görüntüsü yerine `getBoundingClientRect()` tercih edilmeli.
  - **Playwright E2E** (`playwright.config.ts`, `e2e/golden-path.spec.ts`): tüm backend çağrıları `page.route()` ile mock'landı (gerçek backend gerektirmez) — kategori seç → oyna (2 mock soru) → bitir → isim gönder → liderlik tablosunda vurgulanmış satırı gör, uçtan uca tek testte. `npx playwright install chromium` ile tarayıcı kuruldu, test 7 saniyede geçti. `npm run e2e` script'i eklendi.
  - README'ye özellik listesi, `e2e` komutu, mimari genişletmesi (`quiz.ts`, `useCountdown.ts`, router guard'ı) ve WCAG AA renk notu eklendi.
  - 54/54 Vitest testi + 1/1 Playwright E2E testi geçti, build/typecheck temiz.
- F5'te yapılanlar:
  - `src/api/leaderboard.ts`: `fetchLeaderboard(slug, period)`.
  - `LeaderboardView.vue`: kategori adını göstermek için `fetchCategories()`'i tekrar kullanıp slug'a göre eşleştiriyor (ekstra model yerine mevcut endpoint'i yeniden kullanmak daha az karmaşık); `period` sekmeleri (`role="tablist"`/`role="tab"`/`aria-selected`), `?highlight=<rank>` query param'ı `route.query`'den okunup eşleşen satıra `ring-2 ring-primary` uygulanıyor, ilk 3 sıraya 🥇🥈🥉 madalyası (`MEDALS` map, 4.+ sıra düz numara), yükleniyor/hata (tekrar dene)/boş liste durumları.
  - 54/54 test geçti (kategori adı+madalyalar, varsayılan `period=all` ile fetch, sekme değişince yeniden fetch, highlight vurgusu, boş durum, hata+tekrar dene), build/typecheck temiz.
  - Gerçek backend'e karşı tarayıcıda doğrulandı: kategori adı ("Tarih") doğru çekiliyor, sekme geçişi çalışıyor, `?highlight=1` ile satırda gerçekten `ring-2 ring-primary` sınıfının uygulandığı DOM'dan teyit edildi (F4'te oluşturulan "Emir" kaydı 🥇 ile görünüyor).
- F4'te yapılanlar:
  - `src/api/game.ts`: `finishSession(sessionId, playerName)`.
  - `useQuizStore.finish(playerName)`: `/finish/` çağırır, başarıda `sessionStore.rememberPlayerName()` (localStorage) + `reset()` (session/quiz state temizlenir — bu noktadan sonra token tekrar kullanılamaz zaten), `{rank}` döner; hatada `finishErrorMessage` set edilir, state KORUNUR (kullanıcı tekrar deneyebilsin).
  - `NameForm.vue`: `v-model` ile isim input'u, hata mesajı (`role="alert"`), gönderiliyor durumunda disabled buton.
  - `ResultView.vue`: mount anında `quiz.score`/`quiz.correctCount`/`sessionStore.categorySlug` donduruluyor (çünkü `finish()` sonrasında `reset()` bunları siler) — skor+doğru gösterimi, `NameForm`, başarıda `/leaderboard/:slug?highlight=<rank>`'a yönlendirme, hata durumunda sayfada kal + mesaj göster, "Tekrar oyna" butonu (`/play/:slug`'a geri döner, aynı kategoriyle yeni tur).
  - 48/48 test geçti (store `finish` başarı/hata, NameForm, ResultView — skor gösterimi/başarılı yönlendirme/hata durumu/tekrar oyna), build/typecheck temiz.
  - Gerçek backend'e karşı tarayıcıda iki kez uçtan uca doğrulandı: tur bitti → isim gönderildi → `/finish/` 200 → `/leaderboard/:slug?highlight=N`'e yönlendirme çalıştı. Bonus doğrulama: ikinci turda isim alanı önceki "Emir" ismiyle önceden doluydu — `lastPlayerName` localStorage hatırlama özelliği canlı doğrulandı.
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
