# 📋 Update Log — 27-28 April 2026

Ringkasan seluruh perubahan yang dilakukan pada codebase KampusPro.

---

## 🔒 1. Backend Security & Stability

### JWT Security
- Implementasi `initJWTSecret()` dengan validasi minimum 16 karakter
- Verifikasi signing method (HMAC) di auth middleware untuk cegah algorithm confusion
- Validasi input login (email + password wajib diisi)

### Error Handling
- **11 `rows.Scan()`** yang diabaikan → sekarang semua di-check + di-log
- **~25 `err.Error()`** di response → diganti pesan generic (cegah info leaking)
- Error di-log server-side via `log.Println()`

### Database
- Connection pooling: `MaxOpenConns(25)`, `MaxIdleConns(5)`, `ConnMaxLifetime(5m)`
- Health endpoint (`/api/v1/health`) sekarang ping DB, return 503 jika mati

### Upload Security
- Whitelist ekstensi: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`, `.pdf`, `.ico`
- Limit ukuran file: **10MB**

### Server
- Graceful shutdown via signal handler (SIGINT/SIGTERM)
- CORS default diubah dari `*` ke `http://localhost:8080,http://localhost:5173`
- Backend `.env` file dibuat untuk konfigurasi lokal

**File:** `auth.go`, `db.go`, `upload.go`, `main.go`, `handlers.go`, `crud.go`

---

## 🐛 2. Bug Fix: Base64 Encoding pada JSON Fields

### Problem
Field bertipe `interface{}` di Go model (`SiteSetting.Value`, `Faculty.Facilities`, `Faculty.ContactInfo`) di-scan dari PostgreSQL `jsonb` sebagai `[]byte`, lalu di-base64 encode oleh `encoding/json` saat kirim ke frontend.

### Solution
Ubah tipe dari `interface{}` ke `json.RawMessage` agar JSON di-embed as-is tanpa encoding.

```diff
- Value     interface{} `json:"value"`
+ Value     json.RawMessage `json:"value"`

- Facilities  interface{} `json:"facilities"`
+ Facilities  json.RawMessage `json:"facilities"`

- ContactInfo interface{} `json:"contact_info"`
+ ContactInfo json.RawMessage `json:"contact_info"`
```

Juga ditambahkan check di `normalizeValue()` untuk handle `json.RawMessage` tanpa double-encoding.

**File:** `models.go`, `crud.go`

---

## 🎨 3. Frontend Type Safety

### API Client (`client.ts`)
- Dibuat **12 TypeScript interfaces**: `HeroSlide`, `Faculty`, `FacultyProgram`, `Lecturer`, `NewsItem`, `Testimonial`, `BlogPost`, `PageItem`, `ContactMessage`, `SiteSetting`, `AppUser`, `DashboardStats`
- Semua `request<any>` diganti dengan typed generics
- ~30 penggunaan `any` dihilangkan

### Hooks
- `useFacultyData.ts` — semua `as any[]` cast dihapus
- `useCampusData.ts` — `as any[]` cast dihapus

### ESLint
- `no-unused-vars` diubah dari `off` ke `warn` dengan exception prefix `_`

**File:** `client.ts`, `useFacultyData.ts`, `useCampusData.ts`, `eslint.config.js`

---

## 🖼️ 4. Image Upload Fix

### Problem
1. Frontend di port `8080`, backend di port `3000` — gambar dengan path `/uploads/...` tidak bisa diakses
2. Input field gambar pakai `type="url"` yang menolak path relatif `/uploads/hero/xxx.jpg`

### Solution
1. Tambah **Vite proxy** di `vite.config.ts`: `/uploads` → `http://localhost:3000`
2. Ubah `type="url"` → `type="text"` di CrudTable image field

**File:** `vite.config.ts`, `CrudTable.tsx`

---

## 🎠 5. Hero Slider — Dinamis dari Database

### Sebelum
Komponen `HeroSlider` sepenuhnya hardcoded (gambar statis, teks tetap).

### Sesudah
- Ambil data dari API via `useHeroSlides()`
- Auto-advance setiap 6 detik
- Navigasi kiri/kanan + dot indicator clickable
- Animasi transisi antar slide (fade + slide)
- Fallback "Belum ada slide" jika data kosong

**File:** `src/components/site/HeroSlider.tsx`

---

## 📊 6. StatsBar — Dinamis & Bisa Ditambah/Hapus

### Sebelum
4 statistik hardcoded dari `data/campus.ts`.

### Sesudah
- Data dari API (`site_settings` key `stats`)
- **Bisa ditambah dan dihapus** dari admin Settings → Statistik
- Grid otomatis menyesuaikan jumlah item (2/3/4 kolom)
- Icon otomatis dari pool (MapPin, Building2, GraduationCap, dll)

**File:** `src/components/site/StatsBar.tsx`, `src/components/admin/StatsSettingsForm.tsx`

---

## ⚙️ 7. Admin Settings — Semua Tab Pakai Form UI

### Sebelum
Semua tab settings menggunakan **JSON editor** (textarea raw JSON).

### Sesudah
Setiap tab punya form UI proper:

| Tab | Komponen | Fitur |
|-----|----------|-------|
| Info Kampus | `CampusInfoForm` | Input: nama, singkatan, tagline, motto, tahun berdiri |
| Statistik | `StatsSettingsForm` | Card list + tambah/hapus item dinamis |
| CTA Banner | `CtaBannerForm` | Input: eyebrow, judul, deskripsi, 2 tombol aksi |
| Footer | `FooterForm` | Input: deskripsi, copyright, 3 kolom navigasi |
| Kontak | `ContactForm` | 2 card: kontak (alamat/telp/email/WA) + sosial media |

Tab buttons sekarang juga punya ikon.

**File baru:**
- `src/components/admin/CampusInfoForm.tsx`
- `src/components/admin/StatsSettingsForm.tsx`
- `src/components/admin/CtaBannerForm.tsx`
- `src/components/admin/FooterForm.tsx`
- `src/components/admin/ContactForm.tsx`
- `src/hooks/useSettingsState.ts`

**File diubah:** `src/routes/admin.settings.tsx`

---

## 🏛️ 8. Program Studi Unggulan — Dinamis dari Database

### Sebelum
Fallback hardcoded 4 program studi jika API kosong.

### Sesudah
- Murni dari data Fakultas di API (`useFaculties()`)
- Hanya tampilkan yang `active === true`
- Grid otomatis (1-4+ kolom) sesuai jumlah data
- Fallback dihapus — return `null` jika kosong

**File:** `src/components/site/Faculties.tsx`

---

## 📝 9. Admin Fakultas — Form UX Upgrade

### CrudTable Field Types Baru
2 field type ditambahkan ke `CrudTable`:

| Type | Kegunaan | UI |
|------|----------|-----|
| `list-items` | Data array (fasilitas, dll) | List dinamis + tambah/hapus + sub-fields |
| `key-value` | Data object (kontak, dll) | Grid input terstruktur |

### Admin Fakultas Form
| Field Lama | Field Baru |
|---|---|
| `facilities` → JSON textarea | `🏛️ Fasilitas` → list items (Nama + Deskripsi) |
| `contact_info` → JSON textarea | `📞 Kontak Dekanat` → 3 input (Alamat, Email, Telepon) |

**File:** `src/components/admin/CrudTable.tsx`, `src/routes/admin.faculties.tsx`

---

## 🔧 10. Halaman Detail Fakultas — Fix & Full Dinamis

### Bug Fix
`facilities.map is not a function` — data dari DB bisa string/null/object, bukan array. Ditambahkan safe parsing untuk `facilities` dan `contact_info`.

### Semua Section Dinamis
| Section | Data Source | Editable dari Admin |
|---------|-------------|---------------------|
| Hero (gambar, eyebrow, judul, deskripsi) | `faculties` table | ✅ Menu Fakultas |
| Quick Stats (prodi, dosen, akreditasi) | API count + `faculties` | ✅ Otomatis |
| Tentang (about, visi, misi) | `faculties` table (Markdown) | ✅ Menu Fakultas |
| Program Studi | `faculty_programs` table | ✅ Menu Program Studi |
| Dosen | `lecturers` table | ✅ Menu Dosen |
| Fasilitas | `faculties.facilities` (JSON array) | ✅ Menu Fakultas (list-items) |
| Artikel | `blog_posts` (filter by faculty_id) | ✅ Menu Blog |
| Kontak Dekanat | `faculties.contact_info` (JSON object) | ✅ Menu Fakultas (key-value) |

**File:** `src/routes/fakultas.$slug.tsx`

---

## 🐛 11. Fix Admin Blank Page & Global Theme

### Problem
Halaman admin menjadi *blank page* akibat dua hal:
1. `RootComponent` mencoba menggunakan `isAdmin` namun tidak memanggil `useAuth()`.
2. Tabel `site_settings` di PostgreSQL belum terbentuk, sehingga API error (500) dan menyebabkan *crash* pada React.

### Solution
1. **Auto-migrate DB**: Modifikasi `backend/db.go` agar tabel `site_settings` otomatis dibuat jika belum ada.
2. **Global Theme Provider**: Pemilihan tema (terang/gelap dan warna aksen) sekarang dipisah. Pengaturan tema hanya muncul untuk admin (`<ThemeSwitcher />`), tapi pengaplikasian tema berjalan secara global menggunakan `<HeadThemeProvider />` di `__root.tsx`, sehingga bisa dilihat oleh pengguna umum tanpa bisa diganti seenaknya.

---

## 💾 12. Dummy Data (Database Seeder)

Membuat skrip *seeder* otomatis (`seed.sql` & `seed.go`) untuk mengisi data dummy dalam jumlah besar agar semua menu admin memiliki konten uji coba.
- 10 Fakultas lengkap dengan gambar & deskripsi unik
- 30 Program Studi (3 per fakultas)
- 30 Dosen (3 per fakultas)
- 10 Hero Slides, News, Testimoni, Pages
- 20 Artikel Blog
- Setiap data di-*generate* secara dinamis menggunakan loop `PL/pgSQL` dan hash random (`md5`) untuk menghindari bentrok (`duplicate key unique constraint`).

---

## 📖 13. Fix Routing Halaman Detail Blog

### Problem
Ketika mengklik artikel blog, muncul *404 Not Found*. Ini karena konflik antara sistem *Flat Routing* TanStack Router dan penamaan *layout*. File `blog.tsx` bertindak sebagai layout pembungkus tanpa `<Outlet />`, sehingga child route `blog.$slug.tsx` tidak pernah dirender.

### Solution
Mengubah struktur dari *Flat Routing* ke *Directory Routing*. File `blog.index.tsx` dan `blog.$slug.tsx` dipindahkan ke dalam sub-folder `src/routes/blog/`. Route tree di-*generate* ulang dan Vite di-*restart*, membuat route `/blog/$slug` berfungsi mandiri.

---

## 👁️ 14. IP-Based View Counter Artikel Blog

### Problem
Mencegah duplikasi hitungan *view* (dilihat) ketika pengguna me-*refresh* artikel yang sama berulang kali.

### Solution
1. **Schema Update**: Tambah tabel baru `blog_post_views` (menyimpan ID postingan dan IP pengunjung dengan constraint UNIQUE) dan tambah kolom `views` di `blog_posts`.
2. **Backend Logic**: API `GET /blog/:slug` dimodifikasi. Setiap kali artikel dibuka, backend membaca `c.IP()` dan melakukan `INSERT ... ON CONFLICT DO NOTHING`. Jika berhasil, kolom `views` ditambahkan +1.
3. **Frontend UI**: Ikon Mata (Eye) dari `lucide-react` ditambahkan di halaman `/blog` dan `/blog/$slug` untuk menampilkan data statistik *view*.

---

## 🤖 15. AI Chatbot Integration (Gemini AI)

### Backend Proxy Security
- **Problem**: Memanggil API Gemini langsung dari browser membocorkan API Key ke publik via Network Tab.
- **Solution**: Membuat *secure proxy* di GoFiber (`POST /api/v1/chat`). Backend mengambil API Key dari database, lalu melakukan request ke Google Gemini secara rahasia.

### Admin Configuration
- Menu baru di **Settings > AI Chatbot** untuk:
  - On/Off Chatbot secara instan.
  - Mengatur API Key Gemini.
  - Menyetel **System Prompt** (Kepribadian AI).
  - Menentukan pesan sapaan (*Initial Greeting*).

### Auth-Restricted Usage
- Chatbot dibatasi hanya untuk user terdaftar. 
- Pengunjung umum tetap bisa melihat widget, namun saat dibuka akan muncul pesan kunci (*Locked State*) dengan tombol ajakan untuk Login/Register.

**File:** `backend/chatbot.go`, `src/components/site/ChatbotWidget.tsx`, `src/components/admin/ChatbotForm.tsx`

---

## 📉 16. Real Analytics Dashboard

### Backend Analytics Engine
- **Problem**: Data grafik di dashboard sebelumnya hanya dummy/random.
- **Solution**: Membuat endpoint `GET /api/v1/admin/analytics` yang menghitung data asli dari database:
  - **Kunjungan**: Data dari tabel `blog_post_views` (berdasarkan IP unik).
  - **Pesan**: Jumlah pesan masuk dari `contact_messages`.
  - **Konten**: Agregasi pembuatan berita dan artikel blog 30 hari terakhir.

### Frontend Chart Integration
- Dashboard Statistik kini sepenuhnya dinamis menggunakan data dari backend.
- Grafik Recharts menampilkan tren asli aktivitas website dalam 30 hari terakhir.

**File:** `backend/analytics.go`, `src/routes/admin.index.tsx`, `client.ts`, `useCampusData.ts`

---

## 🧼 17. UI Cleanup: Dashboard Focus

### Conditionally Hidden Widgets
- Widget melayang (*Chatbot*, *Scroll To Top*) otomatis disembunyikan ketika pengguna berada di halaman Admin atau PMB Dashboard agar tidak mengganggu navigasi dashboard.

### Floating Theme Switcher Removal
- Ikon melayang pemilih warna tema di halaman Admin dihapus.
- Pengaturan tema sekarang terpusat secara resmi di **Settings > Tampilan & Tema** (mencegah duplikasi UI).

**File:** `src/routes/__root.tsx`, `src/routes/admin.tsx`

---

## 🎨 18. Global Theme Enforcement

### Force Global Style
- **Problem**: User yang pernah memilih warna secara lokal via widget lama terkunci pada warna tersebut meskipun Admin sudah merubah tema website secara global.
- **Solution**: `GlobalThemeProvider` dimodifikasi untuk menghapus data `localStorage` (override lokal) dan memaksa warna dari pengaturan Admin diaplikasikan ke semua pengguna.

**File:** `src/routes/__root.tsx`

---

## 📁 Daftar File yang Diubah

### Backend (Go)
| File | Perubahan |
|------|-----------|
| `auth.go` | JWT init, signing verification, login validation |
| `db.go` | Connection pooling config, **Auto-create site_settings** |
| `upload.go` | Extension whitelist, size limit |
| `main.go` | Graceful shutdown, CORS, health check |
| `handlers.go` | **IP-based view counter (`blog_post_views`)**, generic error messages |
| `chatbot.go` | **NEW** — Secure AI Proxy for Gemini |
| `analytics.go` | **NEW** — 30-day analytics data generator |
| `crud.go` | Generic error messages, json.RawMessage handling |
| `models.go` | interface{} → json.RawMessage, **Tambah kolom Views di BlogPost** |
| `schema.sql` | Perbaikan constraint pada faculties & faculty_programs |
| `seed.sql` & `seed.go` | **NEW** — Data Seeder Generator |
| `add_views.go` | **NEW** — Database Migration Script untuk views |

### Frontend (TypeScript/React)
| File | Perubahan |
|------|-----------|
| `client.ts` | 12 TypeScript interfaces, typed generics |
| `useFacultyData.ts` | Removed `as any[]` casts |
| `useCampusData.ts` | Removed `as any[]` cast |
| `useSettingsState.ts` | Reusable settings hook |
| `eslint.config.js` | Enable unused vars warning |
| `vite.config.ts` | Vite proxy untuk /uploads |
| `__root.tsx` | **Widget Visibility Logic**, **Force Global Theme**, access check |
| `routeTree.gen.ts` | **Regenerated untuk blog directory routing** |
| `CrudTable.tsx` | `type="text"` fix, `list-items` & `key-value` fields |
| `HeroSlider.tsx` | Full rewrite — dynamic from API |
| `StatsBar.tsx` | Dynamic items from settings |
| `Faculties.tsx` | Removed fallback, pure API-driven |
| `fakultas.$slug.tsx` | Safe parsing facilities/contact |
| `blog/index.tsx` | **MOVED** dari `blog.tsx` — Ditambah indikator View |
| `blog/$slug.tsx` | **MOVED** — Ditambah indikator View & Share button |
| `admin.index.tsx` | **Real Analytics Integration** |
| `admin.settings.tsx` | Form components per tab (incl. Chatbot tab) |
| `admin.faculties.tsx` | list-items & key-value fields |
| `ChatbotWidget.tsx` | **NEW** — Floating AI Chatbot with Locked Auth State |
| `ChatbotForm.tsx` | **NEW** — AI Management Form (API, Prompts, Status) |
| `ThemeSettingsForm.tsx` | UI Tema Website |
| `CampusInfoForm.tsx` | Form komponen |
| `StatsSettingsForm.tsx` | Dynamic add/remove |
| `CtaBannerForm.tsx` | Form komponen |
| `FooterForm.tsx` | Form komponen |
| `ContactForm.tsx` | Form komponen |

### Config
| File | Perubahan |
|------|-----------|
| `backend/.env` | CORS, JWT_SECRET, DB config |
| `client.ts` | **getAnalytics()**, TypeScript types |
| `useCampusData.ts` | **useAnalytics() hook** |
| `docs/update.md` | This file |
