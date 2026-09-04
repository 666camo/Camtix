# CamTix - Concert & Event Ticket Booking Platform

CamTix adalah platform pemesanan tiket konser dan event berbasis arsitektur **Microservices** menggunakan **Spring Boot (Java 17)** di sisi backend dan **React 19 + Vite + Tailwind CSS** di sisi frontend.

---

## 🏗️ Arsitektur Sistem

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

### Komponen Microservices
| Service | Port | Deskripsi | Database |
|---|---|---|---|
| **api-gateway** | `8080` | Entry point & routing ke seluruh service | - |
| **user-service** | `8081` | Autentikasi, JWT, OTP, manajemen user & visitor | `camtix_user_db` (PostgreSQL :5432) |
| **event-service** | `8082` | Manajemen konser/event, kategori tiket, upload poster (MinIO), Redis caching | `camtix_event_db` (PostgreSQL :5433) |
| **transaction-service** | `8083` | Booking tiket, integrasi pembayaran Midtrans, upload bukti transfer, email e-ticket | `camtix_transaction_db` (PostgreSQL :5434) |
| **frontend** | `80` | Client web interface (React 19 + Vite + Tailwind CSS) | - |

---

## 📋 Prasyarat

Sebelum memulai, pastikan perangkat Anda telah terinstall:
- **Docker** & **Docker Compose**
- *(Opsional untuk local non-Docker development)*:
  - **Java JDK 17**
  - **Maven 3.8+**
  - **Node.js 20+**

---

## 🚀 Panduan Menjalankan (Docker Compose)

### 1. Clone & Setup Environment File
Salin file `.env.example` menjadi `.env` di root direktori project:
```bash
cp .env.example .env
```
Sesuaikan konfigurasi pada file `.env` terutama `JWT_SECRET`, `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD`, serta credentials Midtrans bila ada.

### 2. Jalankan Seluruh Stack
```bash
docker compose up --build -d
```
Perintah ini akan secara otomatis:
1. Membangun dan menjalankan 3 database PostgreSQL terpisah beserta skema SQL awal (`/database/*.sql`).
2. Menjalankan Redis dan MinIO Object Storage.
3. Membangun seluruh modul backend dan frontend.
4. Menjalankan health check otomatis antar kontainer.

### 3. Cek Status Kontainer
```bash
docker compose ps
```

### 4. Menghentikan Layanan
```bash
docker compose down
```
*(Tambahkan `-v` bila ingin mereset seluruh volume/data database: `docker compose down -v`)*

---

## 🔑 Default Akun (Demo Data Seeder)

Data awal otomatis diisi saat pertama kali database dijalankan via Seeder:

| Email | Password | Role | Keterangan |
|---|---|---|---|
| `admin@camtix.com` | `admin123` | `ADMIN_CAMTIX` | Administrator Utama |
| `adminapp@camtix.com` | `admin123` | `ADMIN_APLIKASI` | Administrator Operasional |
| `user@camtix.com` | `user123` | `USER` | Akun Pelanggan Demo |

---

## 📖 Dokumentasi API (Swagger / OpenAPI)

Ketika backend aktif, dokumentasi interaktif Swagger UI dapat diakses langsung pada masing-masing service:
- **User Service:** `http://localhost:8081/swagger-ui/index.html`
- **Event Service:** `http://localhost:8082/swagger-ui/index.html`
- **Transaction Service:** `http://localhost:8083/swagger-ui/index.html`

---

## ⚙️ Variabel Konfigurasi Utama (`.env`)

| Variabel | Deskripsi | Default / Contoh |
|---|---|---|
| `DB_USER` | Username PostgreSQL | `postgres` |
| `DB_PASSWORD` | Password PostgreSQL | `your_secure_password` |
| `JWT_SECRET` | Secret key penandatangan token JWT (HS256) | *Min 64 karakter Base64* |
| `JWT_EXPIRATION` | Masa berlaku token (ms) | `86400000` (24 jam) |
| `SPRING_MAIL_USERNAME` | Email Gmail untuk pengiriman OTP & E-Ticket | `your_email@gmail.com` |
| `SPRING_MAIL_PASSWORD` | App Password Gmail | `your_app_password` |
| `INTERNAL_API_KEY` | Secret key komunikasi antar-microservice | *Custom secret string* |
| `MIDTRANS_SERVER_KEY` | Server Key Midtrans Payment Gateway | `Mid-server-...` |
| `MIDTRANS_IS_PRODUCTION` | Flag mode Midtrans (Sandbox / Prod) | `false` |
| `VITE_API_BASE_URL` | Base URL API Gateway untuk frontend | `http://localhost:8080` |
| `VITE_GOOGLE_CLIENT_ID` | OAuth Client ID Google Login | `*.apps.googleusercontent.com` |
