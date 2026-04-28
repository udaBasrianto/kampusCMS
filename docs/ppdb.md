# 🎓 Rencana Pengembangan Modul PMB (Penerimaan Mahasiswa Baru)
*Catatan: Menggunakan istilah PMB karena targetnya adalah level Universitas.*

Modul PMB adalah *core revenue engine* bagi institusi kampus. Skema ini dirancang agar KampusPro menjadi platform *End-to-End*, mulai dari *marketing/leads* hingga pendaftar resmi menjadi mahasiswa aktif.

---

## 🏛️ 1. Skema Database (Database Architecture)

Kita membutuhkan tabel-tabel baru untuk memisahkan data "Pendaftar" dengan data "Mahasiswa/User Aktif".

### `pmb_batches` (Pengaturan Gelombang/Jalur)
Mengatur kapan pendaftaran dibuka, jenis jalur, dan biayanya.
- `id` (UUID, PK)
- `name` (String) -> misal: "Gelombang 1 Reguler 2026", "Jalur Prestasi"
- `academic_year` (String) -> "2026/2027"
- `start_date` (Date)
- `end_date` (Date)
- `registration_fee` (Decimal) -> Biaya beli formulir (misal: 250.000)
- `is_active` (Boolean)

### `pmb_candidates` (Data Calon Mahasiswa)
Menyimpan seluruh data personal pendaftar.
- `id` (UUID, PK)
- `user_id` (UUID, FK ke tabel `users` dengan role `candidate`)
- `batch_id` (UUID, FK)
- `registration_number` (String, Unique) -> Generate otomatis (misal: PMB260001)
- `full_name` (String)
- `nisn` (String)
- `phone_whatsapp` (String)
- `school_origin` (String) -> Asal sekolah (SMA/SMK)
- `first_choice_program_id` (UUID, FK ke `faculty_programs`)
- `second_choice_program_id` (UUID, FK ke `faculty_programs`)
- `status` (Enum) -> `DRAFT`, `WAITING_PAYMENT`, `PAYMENT_VERIFIED`, `DOCUMENT_VERIFIED`, `PASSED`, `FAILED`, `ENROLLED`

### `pmb_documents` (Berkas Persyaratan)
Menyimpan file yang diupload peserta.
- `id` (UUID, PK)
- `candidate_id` (UUID, FK)
- `document_type` (Enum) -> `KTP`, `KK`, `IJAZAH`, `PAS_FOTO`, `RAPOR`, `SERTIFIKAT`
- `file_url` (String)
- `status` (Enum) -> `PENDING`, `APPROVED`, `REJECTED`
- `admin_notes` (Text) -> Alasan jika ditolak

### `pmb_payments` (Pembayaran Formulir/Daftar Ulang)
- `id` (UUID, PK)
- `candidate_id` (UUID, FK)
- `payment_type` (Enum) -> `REGISTRATION`, `TUITION` (Daftar Ulang)
- `amount` (Decimal)
- `proof_image_url` (String) -> Bukti transfer
- `status` (Enum) -> `PENDING`, `VERIFIED`, `REJECTED`
- `verified_at` (Timestamp)

---

## 🔄 2. User Flow (Alur Pengguna)

### A. Flow Calon Mahasiswa (Front-End)
1. **Landing Page PMB:** User melihat informasi biaya, syarat, dan prodi.
2. **Buat Akun:** User mendaftar menggunakan Email, Nama, dan WhatsApp. Akun terbuat di tabel `users` dengan role `candidate`.
3. **Pilih Jalur:** User memilih gelombang pendaftaran yang aktif.
4. **Isi Formulir (Multi-step):**
   - Step 1: Identitas diri & Asal Sekolah
   - Step 2: Pilih Program Studi 1 & 2
5. **Pembayaran:** Muncul tagihan formulir (misal Rp 250.000). User upload bukti transfer. Status = `WAITING_PAYMENT_VERIFICATION`.
6. **Upload Berkas:** Setelah admin verifikasi bayar, menu upload (KTP, Ijazah, dll) terbuka.
7. **Ujian / Seleksi:** (Opsional) Mengunduh Kartu Ujian.
8. **Pengumuman:** Login melihat status Kelulusan & Tagihan Daftar Ulang.

### B. Flow Admin PMB (Back-End / Dashboard)
1. **Master Data:** Admin membuat `Batch` (Gelombang 1, Gelombang 2) dan harga pendaftaran.
2. **Verifikasi Pembayaran:** Mengecek mutasi bank & bukti upload peserta -> Klik `Approve`.
3. **Verifikasi Berkas:** Cek kesesuaian ijazah/KTP -> Klik `Valid` atau `Tolak` (beri catatan, peserta harus upload ulang).
4. **Penentuan Kelulusan:** Update status `pmb_candidates` menjadi `PASSED` secara massal.
5. **Report & Export:** Export data peserta lulus ke Excel/CSV untuk dilaporkan ke DIKTI / pindah ke sistem SIAKAD.

---

## 🛠️ 3. Roadmap / Fase Pengembangan

Modul sebesar ini harus dibangun dalam fase iteratif agar cepat bisa dites.

### Fase 1: Persiapan & Landing Page (Minggu 1)
- [ ] Setup Schema Backend & API CRUD (Batches, Candidates).
- [ ] Buat Landing Page PMB `/pmb` (Informasi Biaya, Syarat, Jalur).
- [ ] Buat Auth System khusus Role `Candidate`.

### Fase 2: Portal Calon Mahasiswa (Minggu 2)
- [ ] Halaman Dashboard Calon Mahasiswa (`/pmb/dashboard`).
- [ ] Multi-step Form Biodata & Pemilihan Prodi.
- [ ] Modul Pembayaran Upload Bukti Transfer.

### Fase 3: Dashboard Admin PMB (Minggu 3)
- [ ] Menu Admin: Manajemen Gelombang & Harga.
- [ ] Menu Admin: Daftar Pendaftar (Table lengkap dengan filter status).
- [ ] Menu Admin: UI Verifikasi Pembayaran & Berkas (Bisa zoom gambar).

### Fase 4: Pengumuman & Finalisasi (Minggu 4)
- [ ] Sistem Cetak PDF: Kartu Tanda Peserta.
- [ ] Fitur Pengumuman Kelulusan massal oleh Admin.
- [ ] Export Data Pendaftar ke format Excel (CSV).
- [ ] (Opsional) Integrasi Email/WhatsApp Notification otomatis menggunakan API provider (misal Fonnte/Wablas).

---

## 💡 Nilai Jual Tambahan (Selling Points)
Sistem ini sangat disukai pemilik yayasan kampus jika memiliki fitur:
1. **Lead Tracking:** Bisa melihat jumlah orang yang *hanya* bikin akun tapi belum bayar formulir. Admin bisa *follow-up* (telepon/WA) mereka agar segera membayar.
2. **Dashboard Analytics:** Grafik berbentuk *Funnel* (Daftar Akun -> Beli Formulir -> Isi Berkas -> Lulus -> Daftar Ulang). Membantu rektorat melihat efektivitas marketing PMB.
