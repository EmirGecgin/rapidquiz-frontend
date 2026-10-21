# RapidQuiz Frontend — CLAUDE.md

Bu dosya her fazdan sonra güncellenir. Yeni bir oturum başlarken önce bu dosyayı oku.

## Durum
- Son tamamlanan faz: **(henüz yok)**
- Sıradaki faz: **F1 — İskelet** (F3 için backend B3 hazır olmalı)
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
