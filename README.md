# CamTix - Concert & Event Ticket Booking Platform

CamTix adalah platform pemesanan tiket konser dan event musik modern berskala enterprise berbasis **Fullstack Microservices** yang menggunakan **Spring Boot 3 (Java 17)** pada sisi backend dan **React 19 + Vite + Tailwind CSS** pada sisi frontend.

---

## 📝 Deskripsi Singkat Aplikasi

**CamTix** dirancang untuk memberikan pengalaman pemesanan tiket konser dan event musik yang cepat, aman, dan responsif bagi pengguna, sekaligus menyediakan sistem manajemen terintegrasi untuk pengelola event (admin). 

Aplikasi ini menyajikan solusi transaksi tiket digital end-to-end yang mencakup:
- **E-Commerce & Katalog Event:** Pengguna dapat menjelajahi daftar konser/event terbaru, melakukan pencarian dengan kata kunci, serta menyaring berdasarkan kota, kategori, dan rentang tanggal.
- **Pemesanan & Multi-Payment Gateway:** Mendukung alur booking tiket real-time dengan kalkulasi otomatis, integrasi payment gateway **Midtrans** (QRIS, VA, E-Wallet), serta metode transfer bank manual dengan fitur verifikasi bukti pembayaran.
- **E-Ticket & Invoice Digital:** Setelah pembayaran terverifikasi, pengguna secara otomatis menerima tiket elektronik (E-Ticket) berformat PDF lengkap dengan kode QR unik dan bukti transaksi.
- **Manajemen Operasional & Admin Dashboard:** Menyediakan panel kontrol terpusat bagi Admin untuk mengelola event, tipe tiket, stok real-time, metode pembayaran, pengguna, serta melihat statistik pendapatan dan aktivitas pengunjung secara real-time.

Dengan arsitektur microservices terpisah (`user-service`, `event-service`, `transaction-service`, dan `api-gateway`), CamTix menjamin keandalan sistem, skalabilitas yang tinggi, serta pemisahan tanggung jawab (*separation of concerns*) yang rapi antar komponen.

---

## 📌 Fitur Utama

### 🎨 Frontend (Client-Side)
- **Responsive Layout:** Tampilan adaptif untuk Mobile (≤ 768px), Tablet (769px – 1024px), dan Desktop (>1024px) dengan Tailwind CSS v4 & Framer Motion animations.
- **Authentication Flow Lengkap:** Login, Register dengan OTP verification via email, Google OAuth 2.0 (GIS), Forgot Password, Reset Password, Logout, dan Session Persistence via LocalStorage.
- **Client-Side Routing & Guard:** Public routes, Private customer routes (`/booking`, `/payment`, `/history`), Role-based Admin routes (`/admin/*`), dan Fallback Error Pages (`401`, `403`, `404`, `500`).
- **Real-Time Admin Dashboard:** Ringkasan KPI (Total Events, Total Users, Total Bookings, Paid Payments, Total Revenue IDR, Total Visitors), grafik status event, dan tabel aktivitas terbaru real-time.
- **CRUD Interface Lengkap:** 
  - Events (List, Detail, Add Poster Upload, Edit, Soft Delete)
  - Tickets (List, Detail, Add with Event Selector, Edit, Delete, Stock Management)
  - Payment Methods (List, Add, Edit, Delete, Active Toggle)
  - Users Management (List, Detail Profile, Role Filter, Ban/Unban Hierarchy, Delete)
  - Bookings & Transactions (List, Filter, Real-time Status)
  - Payments Verification (List, Bukti Transfer Viewer Modal, Approve/Reject dengan Catatan Admin)
- **Search, Filter & Multi-criteria Sorting:** Pencarian keyword, filter multi-kategori, status, range tanggal, serta pengurutan (Terbaru, Terlama, A-Z, Z-A, Harga).
- **Pagination Interaktif:** Navigasi Previous/Next, nomor halaman, range item, dan selector ukuran per halaman (5, 10, 20, 50).
- **Real-Time Form Validation:** Validasi live feedback untuk input email, format nomor telepon Indonesia, minimum/maximum karakter, dan konfirmasi password.
- **Toast Notifications:** Feedback aksi real-time (Success, Error, Warning, Info) menggunakan `react-hot-toast`.
- **Internationalization (i18n):** Dukungan multi-bahasa (Bahasa Indonesia & English).
- **E-Ticket & Invoice Export:** Download tiket PDF dan kode QR otomatis setelah pembayaran terkonfirmasi.

### ⚙️ Backend (Server-Side)
- **RESTful API Standar:** Endpoint lengkap dengan metode HTTP GET, POST, PUT, PATCH, DELETE serta penanganan HTTP Status Code standar (200, 201, 400, 401, 403, 404, 422, 500).
- **Microservices Architecture:**
  - `api-gateway` (Port 8080): Routing tersentralisasi, CORS policy, rate limiting, multipart payload routing.
  - `user-service` (Port 8081): Autentikasi JWT, Refresh Token rotation, OTP email verification, Google OAuth validation, RBAC, Rate Limiting (Bucket4j), Soft Delete.
  - `event-service` (Port 8082): Manajemen event & tiket, atomic stock decrement/restore, Redis caching, MinIO image upload, Soft Delete.
  - `transaction-service` (Port 8083): Pemesanan tiket, Midtrans Snap payment gateway integration, SHA-512 webhook verification, upload bukti bayar, pengiriman e-ticket email via RabbitMQ asynchronous queue.
- **Role-Based Access Control (RBAC):** 3 tingkat hak akses (`USER`, `ADMIN_CAMTIX`, `ADMIN_APLIKASI`).
- **Database Architecture & JPA Relationships:**
  - 8 tabel ternormalisasi (3NF) pada 3 database PostgreSQL terisolasi (`camtix_user_db`, `camtix_event_db`, `camtix_transaction_db`).
  - Relasi JPA One-to-One, One-to-Many, Many-to-One, dan relasi terdistribusi antar microservice via REST.
  - Timestamp auditing otomatis (`created_at`, `updated_at`) pada setiap entitas.
  - Soft Delete (`deleted_at`) pada tabel `users` dan `events`.
  - Database seed berisi lebih dari 20 data per tabel.
- **Security:** Password hashing dengan BCrypt, Stateless JWT authentication, CORS header handling, parameterized queries (SQL Injection Prevention), dan Midtrans SHA-512 signature verification.
- **Interactive API Documentation:** Swagger UI / OpenAPI 3 terintegrasi di setiap service.

---

## 🛠️ Teknologi yang Digunakan

| Komponen | Teknologi |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, Framer Motion, Axios, React Router v7, react-i18next, Lucide React, react-hot-toast, html2pdf.js, qrcode |
| **Backend Framework** | Spring Boot 3.3.0, Spring Cloud Gateway 2023.0.1, Java 17 |
| **Security & Auth** | Spring Security, JJWT (JSON Web Token), BCrypt, Google Identity Services, Bucket4j |
| **Database & ORM** | PostgreSQL 17/18, Spring Data JPA, Hibernate ORM |
| **Media & Object Storage** | MinIO S3 Object Storage |
| **Caching & Message Broker**| Redis 7 (Cache), RabbitMQ 3 (Async Task / Email Delivery) |
| **Payment Gateway** | Midtrans Snap API |
| **DevOps & Container** | Docker, Docker Compose |

---

## 🏗️ Arsitektur Sistem & Struktur Monorepo

```
                         +-------------------------+
                         |     React Frontend      |
                         |       (Port 80)         |
                         +------------+------------+
                                      |
                                      v
                         +-------------------------+
                         |   Spring Cloud Gateway  |
                         |       (Port 8080)       |
                         +------------+------------+
                                      |
         +----------------------------+----------------------------+
         |                            |                            |
         v                            v                            v
+------------------+         +------------------+         +------------------+
|   user-service   |         |  event-service   |         |transaction-serv. |
|   (Port 8081)    |         |   (Port 8082)    |         |   (Port 8083)    |
+--------+---------+         +--------+---------+         +--------+---------+
         |                            |                            |
         v                            v                            v
+------------------+         +------------------+         +------------------+
| PostgreSQL (5432)|         | PostgreSQL (5433)|         | PostgreSQL (5434)|
|  camtix_user_db  |         | camtix_event_db  |         |camtix_transac_db |
+------------------+         +--------+---------+         +------------------+
                                      |
                             +--------+--------+
                             | Redis & MinIO   |
                             | (Cache & Media) |
                             +-----------------+
```

### Struktur Folder
```
PROJECT JAVA LANJUTAN/
├── camtix-backend/
│   ├── api-gateway/            # Spring Cloud API Gateway (Port 8080)
│   ├── user-service/           # User Auth, Profile, Visitor Service (Port 8081)
│   ├── event-service/          # Event & Ticket Management, MinIO Upload (Port 8082)
│   └── transaction-service/    # Booking, Payment & Midtrans Service (Port 8083)
├── camtix-frontend/            # React 19 + Vite Frontend SPA (Port 80 / 5173)
│   ├── src/
│   │   ├── components/         # Reusable UI (Pagination, ProtectedRoute, etc.)
│   │   ├── context/            # AuthContext (State & Token management)
│   │   ├── layouts/            # Public, Admin & Error Layouts
│   │   ├── pages/              # Public & Admin Pages
│   │   ├── services/           # Axios API services
│   │   └── i18n/               # Localization configuration
├── database/                   # Database DDL & 20+ Seed SQL Scripts
│   ├── camtix_user_db.sql
│   ├── camtix_event_db.sql
│   └── camtix_transaction_db.sql
├── CamTix_FLOWCHART.drawio     # Perancangan Sistem / Flowchart
├── docker-compose.yml          # Multi-container orchestration
└── README.md
```

---

## 🔑 Akun Demo Pengujian

Gunakan akun-akun berikut untuk menguji berbagai role dan fungsionalitas sistem:

| Role | Email | Password | Hak Akses Utama |
|---|---|---|---|
| **ADMIN_APLIKASI** | `adminapp@camtix.com` | `admin123` | Dashboard, Manajemen User & Hak Akses, Ban/Unban Admin & User, Monitoring Sistem |
| **ADMIN_CAMTIX** | `admin@camtix.com` | `admin123` | Dashboard, CRUD Event, CRUD Tiket, CRUD Metode Pembayaran, Verifikasi Pembayaran Tiket |
| **USER** | `bambang@camtix.com` | `user123` | Browsing Event, Pemesanan Tiket, Pembayaran (Midtrans / Transfer), E-Ticket History |
| **USER** | `clara@camtix.com` | `user123` | User customer aktif untuk simulasi booking |
| **USER (Banned Demo)** | `user@camtix.com` | `user123` | Akun berstatus banned (untuk simulasi penolakan login / unban) |

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

### Opsi 1: Menjalankan dengan Docker Compose (Direkomendasikan)

Pastikan **Docker Desktop** sudah terpasang dan berjalan di komputer Anda.

1. **Clone repository:**
   ```bash
   git clone <URL_REPOSITORY_GITHUB>
   cd "PROJECT JAVA LANJUTAN"
   ```

2. **Jalankan seluruh service dengan Docker Compose:**
   ```bash
   docker-compose up -d --build
   ```

3. **Akses aplikasi:**
   - **Frontend App:** [http://localhost](http://localhost) (atau [http://localhost:5173](http://localhost:5173))
   - **API Gateway:** [http://localhost:8080](http://localhost:8080)
   - **Swagger Docs User Service:** [http://localhost:8081/swagger-ui/index.html](http://localhost:8081/swagger-ui/index.html)
   - **Swagger Docs Event Service:** [http://localhost:8082/swagger-ui/index.html](http://localhost:8082/swagger-ui/index.html)
   - **Swagger Docs Transaction Service:** [http://localhost:8083/swagger-ui/index.html](http://localhost:8083/swagger-ui/index.html)
   - **MinIO Console:** [http://localhost:9001](http://localhost:9001) (User: `minioadmin` / Pass: `minioadmin`)
   - **RabbitMQ Management:** [http://localhost:15672](http://localhost:15672) (User: `guest` / Pass: `guest`)

---

### Opsi 2: Menjalankan Secara Manual (Development Mode)

#### Prasyarat
- Java JDK 17+
- Node.js 18+ & npm
- PostgreSQL 16+
- Maven 3.8+

#### 1. Setup Database
Buat 3 database di PostgreSQL lokal:
- `camtix_user_db` lalu import `database/camtix_user_db.sql`
- `camtix_event_db` lalu import `database/camtix_event_db.sql`
- `camtix_transaction_db` lalu import `database/camtix_transaction_db.sql`

#### 2. Menjalankan Backend Services
Buka terminal terpisah untuk setiap service dan jalankan:
```bash
# Terminal 1: API Gateway
cd camtix-backend/api-gateway/api-gateway
./mvnw spring-boot:run

# Terminal 2: User Service
cd camtix-backend/user-service/user-service
./mvnw spring-boot:run

# Terminal 3: Event Service
cd camtix-backend/event-service/event-service
./mvnw spring-boot:run

# Terminal 4: Transaction Service
cd camtix-backend/transaction-service/transaction-service
./mvnw spring-boot:run
```

#### 3. Menjalankan Frontend
```bash
cd camtix-frontend
npm install
npm run dev
```
Akses frontend di browser melalui `http://localhost:5173`.

---

## 📊 Dokumentasi Perancangan Sistem (Flowchart)

File perancangan flowchart alur autentikasi, transaksi, dan verifikasi admin tersedia dalam format Draw.io pada root repository:
- 📄 `CamTix_FLOWCHART.drawio`

Dapat dibuka menggunakan [app.diagrams.net](https://app.diagrams.net/) atau ekstensi VS Code Draw.io Integration.

---

## 👨‍💻 Kontributor & Lisensi
Proyek Akhir Pemrograman Java Lanjutan (S1). Dikembangkan oleh Tim Pengembang CamTix.
Lisensi: MIT.
