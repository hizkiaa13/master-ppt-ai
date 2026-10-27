# 🚀 Master PPT AI - Generator PowerPoint Cerdas Berbasis AI

Web aplikasi cerdas untuk membuat **Master Template PowerPoint (.pptx)** profesional dengan rekomendasi AI otomatis untuk pemilihan font pairing, skema warna berbasis teori harmoni warna, dan struktur layout slide yang konsisten.

---

## 🌟 Fitur Utama & Pembaharuan Terbaru

### 1. 🔢 Input Jumlah Slide (1–15 Slide)
- Pengguna dapat menentukan jumlah slide yang ingin di-generate (range: 1 - 15 slide, default 5).
- Terdapat slider dan preset cepat (3, 5, 8, 10, 12, 15 slide).
- AI secara dinamis menyusun struktur alur slide yang kontekstual sesuai dengan kuantitas yang dipilih.

### 2. 🎨 Custom Color Picker & Palet Harmonis
- **8 Palet Warna Terkurasi**: Ocean Blue, Forest Green, Sunset Orange, Royal Purple, Minimalist Slate, Cyberpunk Neon, Crimson Executive, dan Midnight Gold.
- **Custom Color Picker**: Input visual color picker + hex code text input dengan kalkulasi otomatis warna sekunder dan aksen.
- **Live Preview Real-time**: Menampilkan preview instan warna primer, sekunder, dan aksen sebelum slide digenerate.

### 3. ✍️ Judul Presentasi & Tema Bebas
- Text input untuk judul presentasi (wajib diisi, maksimal 100 karakter).
- Textarea deskripsi konteks/tema bebas (opsional, maksimal 500 karakter).
- Kategori khusus **"Tema Bebas"** yang menyesuaikan keseluruhan nuansa, tipografi, dan placeholder konten berdasarkan deskripsi pengguna.

### 4. 🖥️ Preview Per Slide & Editor Interaktif
- **Kanvas Slide Berasio 16:9**: Representasi visual yang akurat terhadap output PowerPoint.
- **Klik untuk Edit Teks**: Ubah langsung isi placeholder (judul, poin, deskripsi) di kanvas slide.
- **Ganti Layout Slide**: Pilihan dropdown layout (Centered, Left Aligned, Two Column, Image Right, Image Left, Comparison).
- **Ganti Warna Background**: Color picker per slide untuk variasi visual yang dinamis.
- **Thumbnail Strip**: Navigasi carousel horizontal untuk beralih antar slide secara mulus.
- **Reset to Default AI**: Opsi untuk mengembalikan seluruh editan ke rekomendasi awal AI.

### 5. 📥 Ekspor & Download PPTX Final
- Menghasilkan dokumen PowerPoint OpenXML standard (`.pptx`) beresolusi 16:9 menggunakan **PptxGenJS**.
- Menyimpan revisi slide yang telah diedit ke database server (`edited_slides`).
- Endpoint finalisasi untuk memproduksi file PPTX final terpersonalisasi.
- Fallback ekspor langsung di sisi client browser bila koneksi internet terbatas.

---

## 🛠️ Tech Stack

| Layer | Teknologi | Keterangan |
|---|---|---|
| **Frontend** | React 19 + Vite 6 | Antarmuka kilat berbasis komponen modern |
| **Styling** | Tailwind CSS 3 | Glassmorphism, Dark UI, gradient modern |
| **Routing & Icons** | React Router v7 & Lucide React | Navigasi SPA & ikonografi konsisten |
| **Backend** | Node.js + Express 5 | RESTful API terstruktur dan aman |
| **Database** | Supabase (PostgreSQL) | Cloud database dengan real-time capabilities |
| **PPTX Engine** | PptxGenJS v4 | Generator presentasi PPTX native |
| **Deployment** | Vercel | Hosting serverless untuk frontend + API |

---

## 💾 Struktur Database

### Table: `themes`
- `id` (TEXT, PRIMARY KEY)
- `name` (TEXT UNIQUE)
- `description` (TEXT)
- `font_heading` (TEXT)
- `font_body` (TEXT)
- `color_primary` (TEXT)
- `color_secondary` (TEXT)
- `color_accent` (TEXT)
- `layout_templates` (TEXT)
- `category` (TEXT)
- `preview_image` (TEXT)
- `custom_title` (TEXT) *(Baru)*
- `custom_description` (TEXT) *(Baru)*
- `slide_count` (INTEGER DEFAULT 5) *(Baru)*
- `custom_colors` (TEXT) *(Baru)*
- `created_at` (DATETIME)

### Table: `master_histories`
- `id` (TEXT, PRIMARY KEY)
- `user_id` (TEXT)
- `theme_id` (TEXT)
- `theme_name` (TEXT)
- `custom_fonts` (TEXT)
- `custom_colors` (TEXT)
- `custom_layouts` (TEXT)
- `slide_previews` (TEXT JSON) *(Baru)*
- `edited_slides` (TEXT JSON) *(Baru)*
- `final_pptx_path` (TEXT) *(Baru)*
- `pptx_file_path` (TEXT)
- `created_at` (DATETIME)

---

## 🌐 Endpoint API

| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| `GET` | `/api/health` | Status API backend | Publik |
| `POST` | `/api/auth/register` | Mendaftarkan akun baru | Publik |
| `POST` | `/api/auth/login` | Masuk dan memperoleh token JWT | Publik |
| `GET` | `/api/auth/me` | Memperoleh profil user aktif | JWT |
| `GET` | `/api/themes` | Mengambil seluruh tema master | JWT |
| `POST` | `/api/themes/:id/recommendations` | Rekomendasi AI font, warna, layout | JWT |
| `POST` | `/api/pptx/generate` | Generate deck slide & rekomendasi AI | JWT |
| `GET` | `/api/pptx/preview/:masterId` | Mengambil data preview slide master | JWT |
| `PUT` | `/api/pptx/slide/:masterId` | Memperbarui editan slide per master | JWT |
| `POST` | `/api/pptx/finalize/:masterId` | Membangun file PPTX final teredit | JWT |
| `GET` | `/api/pptx/download/:id` | Mengunduh file PPTX (.pptx) | JWT |
| `GET` | `/api/pptx/history` | Mengambil riwayat master user | JWT |
| `PUT` | `/api/user/profile` | Memperbarui nama user | JWT |
| `PUT` | `/api/user/password` | Mengganti kata sandi | JWT |

---

## 🚀 Panduan Menjalankan Aplikasi

### Prasyarat
- Node.js v20+ 
- Akun [Supabase](https://supabase.com) (gratis)
- Akun [Vercel](https://vercel.com) (gratis)

### 1. Setup Database Supabase
1. Buat project baru di [Supabase Dashboard](https://app.supabase.com)
2. Buka **SQL Editor** di dashboard Supabase
3. Copy dan jalankan isi file `backend/supabase-migration.sql`
4. Salin **Project URL** dan **Service Role Key** dari Settings > API

### 2. Setup Environment Variables
Copy file `.env.example` ke `.env` di folder `backend/`:
```bash
cp master-ppt-ai/backend/.env.example master-ppt-ai/backend/.env
```
Isi variabel berikut:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_random_secret_key
```

### 3. Menjalankan Lokal
```bash
# Install dependencies
npm install
cd master-ppt-ai/backend && npm install
cd ../frontend && npm install

# Jalankan dari root directory
cd ../../
npm run dev
```
> Backend: **`http://localhost:5000`** | Frontend: **`http://localhost:5173`**

### 4. Deploy ke Vercel
Project sudah dikonfigurasi untuk Vercel. Set environment variables di Vercel Dashboard:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`  
- `GEMINI_API_KEY`
- `JWT_SECRET`
- `NODE_ENV=production`
- `FRONTEND_URL=https://your-app.vercel.app`
