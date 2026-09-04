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




