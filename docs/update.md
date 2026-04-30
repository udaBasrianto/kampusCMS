# 📋 Update Log — 30 April 2026

Dokumen ini mencatat seluruh perubahan kode yang dilakukan pada sesi ini.

---

## 1. 🔒 Security Hardening — Admin Route Protection

### Masalah
Route group `/api/v1/admin` tidak memiliki pengecekan role, sehingga **semua user yang login** (termasuk `faculty_admin`) bisa mengakses endpoint admin seperti delete user, ubah settings, dll.

### Solusi
Menambahkan middleware `requireRole("admin")` pada seluruh group admin.

### File Diubah

**`backend/main.go`**
```diff
- admin := api.Group("/admin", authMiddleware)
+ admin := api.Group("/admin", authMiddleware, requireRole("admin"))
```

---

## 2. 📅 Fitur Campus Events (Full Stack)

Menambahkan modul **Event Kampus** yang tampil di halaman beranda dan bisa dikelola dari admin panel.

### 2.1 Backend

#### `backend/schema.sql` — Tabel Baru
```sql
CREATE TABLE IF NOT EXISTS campus_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    event_date DATE NOT NULL,
    start_time TIME DEFAULT '00:00',
    end_time TIME DEFAULT '23:59',
    location VARCHAR(255),
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `backend/models.go` — Struct Baru
```go
type CampusEvent struct {
    ID          string `json:"id"`
    Title       string `json:"title"`
    Description string `json:"description"`
    ImageURL    string `json:"image_url"`
    EventDate   string `json:"event_date"`
    StartTime   string `json:"start_time"`
    EndTime     string `json:"end_time"`
    Location    string `json:"location"`
    Active      bool   `json:"active"`
    SortOrder   int    `json:"sort_order"`
    CreatedAt   string `json:"created_at"`
    UpdatedAt   string `json:"updated_at"`
}
```

#### `backend/crud.go` — CRUD Whitelist
```go
"campus_events": {
    "title": true, "description": true, "image_url": true, "event_date": true,
    "start_time": true, "end_time": true, "location": true, "active": true, "sort_order": true,
},
```

#### `backend/handlers.go` — 2 Handler Baru
| Handler | Endpoint | Deskripsi |
|:---|:---|:---|
| `getEvents()` | `GET /api/v1/events` | List semua event aktif (public) |
| `getEventByID()` | `GET /api/v1/events/:id` | Detail event by UUID (public) |

#### `backend/main.go` — 2 Route Baru
```go
api.Get("/events", getEvents)
api.Get("/events/:id", getEventByID)
```

### 2.2 Frontend

#### `src/integrations/api/client.ts` — Type & Method
```typescript
// Type baru
export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  image_url: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Method baru
async getEvents() { ... }
async getEventByID(id: string) { ... }
```

#### `src/hooks/useCampusData.ts` — 2 Hook Baru
```typescript
export const useEvents = () => useQuery({ queryKey: ["campus_events"], ... });
export const useEvent = (id: string) => useQuery({ queryKey: ["campus_event", id], ... });
```

#### `src/components/site/CampusEvents.tsx` — Komponen Beranda (BARU)
- Grid 3 kolom event cards
- Poster image dengan hover zoom effect
- Tanggal besar (day/month) dengan gold accent line
- Info waktu (jam mulai-selesai) dan lokasi
- Card clickable → navigasi ke halaman detail
- Auto-hide jika belum ada data event
- Link "Lihat Semua Event"

#### `src/routes/events.$id.tsx` — Halaman Detail Event (BARU)
- Hero poster full-width
- Info cards (tanggal, waktu, lokasi) dengan ikon dan warna berbeda
- Deskripsi event lengkap
- Tombol Share (native share API / copy link)
- Section "Event Lainnya" di bagian bawah
- Handling state: loading, not found, dan error

#### `src/routes/index.tsx` — Homepage Updated
```diff
+ import { CampusEvents } from "@/components/site/CampusEvents";

  <News />
+ <CampusEvents />
  <Testimonials />
```

#### `src/routes/admin.events.tsx` — Admin Page (BARU)
- Menggunakan `CrudTable` component
- Field: judul, deskripsi, tanggal, jam mulai/selesai, lokasi, poster image, aktif, urutan
- Custom row render dengan thumbnail dan badge tanggal

#### `src/routes/admin.tsx` — Sidebar Navigation
```diff
+ import { CalendarDays } from "lucide-react";

  { to: "/admin/news", label: "Berita", icon: Newspaper, roles: ["admin"] },
+ { to: "/admin/events", label: "Events", icon: CalendarDays, roles: ["admin"] },
  { to: "/admin/testimonials", label: "Testimoni", icon: Quote, roles: ["admin"] },
```

---

## 3. 🤖 Chatbot AI — Integrasi Sumopod (OpenAI-Compatible)

### 3.1 Backend — Provider OpenAI-Compatible

#### `backend/chatbot.go` — Rewrite Total

**Settings struct diperluas:**
```go
type ChatbotSettings struct {
    Enabled      bool   `json:"enabled"`
    ApiKey       string `json:"api_key"`
    ApiUrl       string `json:"api_url"`      // BARU
    Model        string `json:"model"`         // BARU
    Provider     string `json:"provider"`
    SystemPrompt string `json:"system_prompt"`
}
```

**Provider baru — `openai`:**
- Fungsi `callOpenAICompatible()` mengirim request ke endpoint `/v1/chat/completions`
- Default URL: `https://ai.sumopod.com/v1/chat/completions`
- Default model: `gpt-5-nano`
- System prompt dikirim sebagai message role `system`
- Support semua model dari Sumopod/LiteLLM

**Handler baru — `fetchChatbotModels()`:**
- Endpoint: `POST /api/v1/admin/chatbot-models`
- Menerima `api_url` dan `api_key` dari request body
- Proxy GET request ke `/v1/models` dari provider
- Otomatis derive URL models dari URL chat completions
- Return daftar model yang tersedia

**Provider lama — `gemini` tetap berfungsi.**

#### `backend/main.go` — Route Baru
```go
admin.Post("/chatbot-models", fetchChatbotModels)
```

### 3.2 Frontend — Dynamic Model Loading

#### `src/components/admin/ChatbotForm.tsx` — Rewrite Total

**Konfigurasi UI baru:**
| Field | Tipe | Deskripsi |
|:---|:---|:---|
| Provider | Dropdown | OpenAI-Compatible / Gemini Direct |
| API URL | Text input | Endpoint chat completions (pre-filled Sumopod) |
| API Key | Password | Key dari provider AI |
| Model | Dynamic dropdown | Auto-load dari `/v1/models` saat API key diisi |

**Fitur model loading:**
- Auto-fetch model list saat API key diisi (debounce 800ms)
- Tombol manual "Muat Model" untuk refresh
- Model dikelompokkan berdasarkan `owned_by` (openai, google, anthropic, dll)
- Fallback input manual jika API gagal
- Badge preview model terpilih

### 3.3 Frontend — Bug Fix Widget

#### `src/components/site/ChatbotWidget.tsx` — Critical Fix

**Bug:** Widget hanya memanggil backend API jika `provider === "gemini"`. Untuk provider lain, langsung return pesan simulasi hardcoded.

```diff
- if (chatbot.api_key && chatbot.provider === "gemini") {
-   // call backend API...
- } else {
-   // hardcoded: "fitur AI sedang dalam tahap simulasi..."
- }

+ // Always send to backend API (backend handles all providers)
+ const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
+ const res = await fetch(`${API_URL}/chat`, { ... });
```

**Fix tambahan:** URL fallback diperbaiki dari `localhost:8080` ke `localhost:3000`.

---

## 📁 Daftar File yang Diubah/Ditambah

### Backend (Go)
| File | Status | Perubahan |
|:---|:---|:---|
| `backend/main.go` | ✏️ Modified | +requireRole, +3 routes (events, events/:id, chatbot-models) |
| `backend/schema.sql` | ✏️ Modified | +tabel campus_events |
| `backend/models.go` | ✏️ Modified | +struct CampusEvent |
| `backend/crud.go` | ✏️ Modified | +campus_events whitelist |
| `backend/handlers.go` | ✏️ Modified | +getEvents(), +getEventByID() |
| `backend/chatbot.go` | 🔄 Rewritten | +OpenAI-compatible provider, +fetchChatbotModels() |

### Frontend (TypeScript/React)
| File | Status | Perubahan |
|:---|:---|:---|
| `src/integrations/api/client.ts` | ✏️ Modified | +CampusEvent type, +getEvents(), +getEventByID() |
| `src/hooks/useCampusData.ts` | ✏️ Modified | +useEvents(), +useEvent() |
| `src/components/site/CampusEvents.tsx` | 🆕 New | Komponen event grid di beranda |
| `src/routes/events.$id.tsx` | 🆕 New | Halaman detail event |
| `src/routes/admin.events.tsx` | 🆕 New | Admin CRUD page untuk events |
| `src/routes/index.tsx` | ✏️ Modified | +CampusEvents di homepage |
| `src/routes/admin.tsx` | ✏️ Modified | +Events menu di sidebar |
| `src/components/admin/ChatbotForm.tsx` | 🔄 Rewritten | Dynamic model loading dari API |
| `src/components/site/ChatbotWidget.tsx` | ✏️ Modified | Fix: semua provider kirim ke backend |

---

## 🗄️ SQL Migration (Jalankan di Production)

```sql
-- Campus Events
CREATE TABLE IF NOT EXISTS campus_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    event_date DATE NOT NULL,
    start_time TIME DEFAULT '00:00',
    end_time TIME DEFAULT '23:59',
    location VARCHAR(255),
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## ⚙️ Konfigurasi Chatbot Sumopod (Admin Dashboard)

Setelah deploy, buka **Admin → Settings → AI Chatbot** dan isi:

| Field | Nilai |
|:---|:---|
| Provider | `OpenAI-Compatible (Sumopod / LiteLLM / OpenAI)` |
| API URL | `https://ai.sumopod.com/v1/chat/completions` |
| API Key | `sk-xxxxx` (dari dashboard Sumopod) |
| Model | Pilih dari dropdown yang muncul otomatis |

### Model Rekomendasi (Harga per 1M token)
| Model | Harga Input | Cocok Untuk |
|:---|:---|:---|
| `gpt-5-nano` | $0.05 | Chatbot ringan, paling hemat |
| `deepseek-v4-flash` | $0.14 | Balance performa & harga |
| `qwen3.6-flash` | $0.13 (50% off) | Alternatif murah |
| `gemini/gemini-2.5-flash` | $0.30 | Reliable & cepat |
| `claude-haiku-4-5` | $0.70 (30% off) | Quality tinggi |

---

## 4. 🎨 Peningkatan UI & Integrasi Peta Leaflet

### 4.1 Widget Chatbot Dinamis
- **Ukuran Widget Kustom:** Menambahkan pengaturan `bot_avatar_size` pada UI form Chatbot admin dengan bentuk *slider*. Admin dapat mengatur ukuran maskot chatbot secara bebas (64px - 256px).
- **Tampilan Tanpa Batas (Borderless):** Memperbarui `src/components/site/ChatbotWidget.tsx` agar avatar maskot bot (misal: "UPIK") tidak lagi terpotong ke dalam lingkaran background kecil. Menggunakan efek `drop-shadow` agar gambar transparan melayang alami (3D floating style).

### 4.2 Peta Leaflet (OpenStreetMap) untuk Event
- **Dependensi Baru:** Menginstal library `leaflet` dan `react-leaflet`.
- **Komponen Peta Pintar:** Membuat `src/components/site/LeafletMap.tsx`. Fitur ini memprioritaskan koordinat pasti. Jika belum ada, akan menggunakan layanan Nominatim API (gratis) untuk menebak koordinat dari nama lokasi.
- **Peta Detail Event:** Menampilkan peta lokasi di halaman detail acara publik (`src/routes/events.$id.tsx`).
- **Peta Menu Event Dashboard:** Menampilkan semua acara mendatang di User Dashboard (`src/routes/dashboard.events.tsx`) beserta tombol ekspansi untuk memunculkan peta secara inline.

### 4.3 Akurasi Koordinat Event (Full-stack)
- **Perubahan Database:** Menambahkan kolom `map_coordinates VARCHAR(100)` pada tabel `campus_events` (di `schema.sql`).
- **Auto-Migration:** Mengimplementasikan fungsi *auto-alter table* sederhana di fungsi `initDB()` pada `backend/db.go`.
- **Admin & API:** Mengupdate `crud.go`, `handlers.go`, dan `models.go` untuk membaca dan menyimpan field koordinat peta.
- **Form Admin:** Di `src/routes/admin.events.tsx`, ditambahkan kolom isian "Koordinat Peta (Opsional)" agar admin bisa meletakkan `latitude, longitude` yang 100% akurat dari Google Maps.

### 4.4 Header Fakultas Dinamis (Slider & Partikel JS)
- **Modifikasi Header (`src/routes/fakultas/$slug.tsx`):**
  - Menerapkan komponen `HeroParticles` agar halaman profil fakultas memiliki efek visual partikel interaktif yang sama dengan beranda.
  - Memasukkan elemen `AnimatePresence` dan `motion.div` dari Framer Motion. Gambar cover fakultas sekarang akan muncul dengan efek transisi *fade & pelan-pelan zoom-out* (meniru gaya visual slider).
  - **Fallback Cerdas:** Apabila suatu fakultas tidak memiliki gambar `cover_image_url`, maka halaman akan otomatis mengambil gambar-gambar dari *Global Hero Slider* (beranda) dan menampilkannya bergantian setiap 5 detik di latar belakang fakultas tersebut.
