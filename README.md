# CAFE RUANG NAMU — PRODUCTION-READY QRIS & POS SYSTEM

Sistem Pemesanan Mandiri Meja, Pembayaran QRIS Dinamis Terintegrasi, Layar Kasir Operasional (POS), dan Profil Usaha UMKM Modern untuk **Cafe Ruang Namu**.

---

## ☕ 1. Ringkasan Arsitektur & Teknologi

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite 6, React Router v6, Lucide Icons | Responsive Mobile-First, Palet Warm Coffee & Cream |
| **Backend API** | Node.js (v24), Express.js, Helmet, CORS, JWT, Bcrypt | REST API terstandarisasi, aman, rate limiting ready |
| **Database** | SQLite (Better-SQLite3) | ACID Transactional, WAL mode, foreign keys diaktifkan |
| **Payment Gateway** | Adapter Pattern: Midtrans Core API QRIS & Mock Sandbox | Verifikasi webhook SHA-512, Idempotensi, Redaksi log |
| **Testing** | Node.js Native Test Runner (`node:test`, `node:assert`) | 15 skenario pengujian unit & integrasi otomatis (100% Pass) |

---

## 📁 2. Struktur Proyek

```
projek  umkm/
├── package.json                   # Root runner (dev, build, start, test, seed)
├── README.md                      # Dokumentasi teknis & panduan merchant
├── server/
│   ├── .env.example               # Template environment backend
│   ├── .env                       # File konfigurasi lokal
│   ├── package.json
│   ├── src/
│   │   ├── adapters/
│   │   │   ├── payment-provider.interface.js  # Kontrak standar adapter pembayaran
│   │   │   ├── midtrans.adapter.js            # Integrasi resmi Midtrans Core API QRIS
│   │   │   ├── mock.adapter.js                # Adapter uji coba sandbox otomatis
│   │   │   └── index.js                       # Factory provider dinamis
│   │   ├── config/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js             # Login JWT & session staf
│   │   │   ├── product.controller.js          # CRUD produk & mutasi stok
│   │   │   ├── category.controller.js         # Kategori produk
│   │   │   ├── table.controller.js            # Validasi meja & pembuatan QR meja
│   │   │   ├── order.controller.js            # Pembuatan & status pesanan
│   │   │   ├── payment.controller.js          # Transaksi QRIS, webhook & tunai
│   │   │   ├── profile.controller.js          # Data profil publik & promo
│   │   │   └── admin.controller.js            # Analitik, staf & ekspor CSV
│   │   ├── db/
│   │   │   ├── database.js                    # Koneksi Better-SQLite3 (WAL & foreign keys)
│   │   │   ├── schema.js                      # Skema DDL tabel & indeks
│   │   │   └── seed.js                        # Data awal: admin, kasir, 12 meja, menu, profil
│   │   ├── middleware/
│   │   │   └── auth.js                        # Proteksi JWT & RBAC (Admin/Kasir)
│   │   ├── routes/                            # Modular Express router
│   │   ├── services/
│   │   │   ├── order.service.js               # Kalkulasi harga & transaksi DB stok
│   │   │   └── payment.service.js             # Alur QRIS, verifikasi tanda tangan & tunai
│   │   ├── utils/
│   │   │   ├── jwt.js                         # Token signing & verification
│   │   │   └── logger.js                      # Redaksi kunci rahasia pada log
│   │   └── server.js                          # Express entrypoint & static build server
│   └── tests/
│       ├── auth.test.js                       # Pengujian autentikasi staf & RBAC
│       ├── order.test.js                      # Pengujian kalkulasi harga, pajak, & stok
│       ├── payment.test.js                    # Pengujian QRIS dinamis & transaksi tunai
│       └── webhook.test.js                    # Pengujian signature SHA-512 & idempotensi
└── client/
    ├── package.json
    ├── vite.config.js                         # Proxy API ke port 5000
    ├── index.html                             # Plus Jakarta Sans & Playfair Display typography
    └── src/
        ├── components/
        │   ├── Navbar.jsx                     # Navigasi publik & indikator buka/tutup
        │   ├── Footer.jsx                     # Footer profil usaha & tautan WhatsApp
        │   ├── CartDrawer.jsx                 # Keranjang mobile slide-out & kalkulasi PB1
        │   ├── QrisModal.jsx                  # Modal QRIS dinamis dengan countdown timer
        │   └── ReceiptModal.jsx               # Struk digital LUNAS & format cetak termal
        ├── context/
        │   ├── AuthContext.jsx                # State login user
        │   ├── CafeContext.jsx                # State profil cafe real-time
        │   └── CartContext.jsx                # State keranjang belanja & meja
        ├── pages/
        │   ├── public/                        # Halaman publik (Beranda, Profil, Menu, Fasilitas, Galeri, Lokasi, Kontak, Promo)
        │   ├── order/                         # Customer mobile-first ordering & status tracker
        │   ├── cashier/                       # Layar operasional POS Kasir & antrean dapur
        │   ├── admin/                         # Panel kontrol pemilik (Dashboard, Menu, Stok, Meja, Staf, Pengaturan)
        │   └── auth/                          # Login staf
        ├── services/
        │   └── api.js                         # Client API Fetch wrapper
        └── styles/
            └── index.css                      # Palet Ruang Namu & CSS cetak struk termal
```

---

## 🗄️ 3. Skema Basis Data

Sistem menggunakan SQLite berkemampuan tinggi dengan proteksi konkurensi WAL (*Write-Ahead Logging*):

1. **`users`**: Akun staf (`admin` & `cashier`) dengan hash kata sandi Bcrypt.
2. **`categories`**: Kategori menu (Coffee Signature, Manual Brew, Non-Coffee, Mocktails, Main Course, Light Bites).
3. **`products`**: Menu lengkap (nama, harga, stok, foto, deskripsi, indikator unggulan, populer, promo).
4. **`tables`**: Meja 01 s.d. 12 lengkap dengan token kriptografi aman dan payload tautan QR.
5. **`orders`**: Transaksi pemesanan (`order_number` unik: `RN-YYYYMMDD-XXXX`, token isolasi pelanggan, total, pajak PB1 10%, status alur).
6. **`order_items`**: Rincian item menu, harga satuan saat dibeli, kuantitas, catatan khusus.
7. **`payments`**: Transaksi pembayaran (`payment_id` unik, status PENDING/PAID/EXPIRED, string QRIS, URL QR, waktu lunas, nominal tunai & kembalian).
8. **`payment_events`**: Audit trail webhook resmi dan pengecekan **idempotensi** (mencegah duplikasi).
9. **`stock_movements`**: Log pergerakan stok (RESTOCK, ORDER_PLACED, ORDER_CANCELLED, MANUAL_ADJUST).
10. **`order_status_history`**: Audit trail tahapan pesanan (WAITING_PAYMENT → PAID → PREPARING → READY_TO_SERVE → DELIVERED).
11. **`cafe_settings`**: Konfigurasi dinamis profil cafe, jam operasional, kontak, dan kredensial payment gateway.
12. **`promotions`**: Program diskon aktif dengan validitas tanggal dan minimal belanja.
13. **`audit_logs`**: Log aktivitas staf dan perubahan konfigurasi sistem.

---

## 🌐 4. Endpoint API Backend

### Autentikasi
- `POST /api/auth/login`: Login staf (mengembalikan token JWT).
- `GET /api/auth/me`: Verifikasi profil pengguna aktif.

### Pemesanan Pelanggan (Customer Ordering)
- `POST /api/orders`: Buat pesanan baru (validasi stok dan hitung ulang harga di server).
- `GET /api/orders/:id`: Ambil detail pesanan & struk (diproteksi customer token).
- `GET /api/orders/queue`: Antrean pesanan aktif untuk kasir & dapur.
- `GET /api/orders`: Riwayat pesanan (filter status, pencarian, paginasi).
- `PUT /api/orders/:id/status`: Perbarui tahapan pesanan (`PREPARING`, `READY_TO_SERVE`, `DELIVERED`).

### Pembayaran & QRIS Dinamis
- `POST /api/payments/create`: Buat pembayaran QRIS dinamis untuk order.
- `GET /api/payments/:paymentId/status`: Ambil status pembayaran langsung dari provider.
- `POST /api/webhooks/payments/:provider`: Webhook resmi penerima notifikasi pelunasan.
- `POST /api/payments/cash`: Pembayaran tunai kasir (hitung kembalian otomatis & simpan user ID kasir).
- `POST /api/payments/:paymentId/cancel`: Batalkan transaksi di payment gateway.
- `POST /api/payments/:paymentId/refund`: Pengembalian dana (refund) transaksi lunas.
- `GET /api/payments/reconcile`: Rekonsiliasi transaksi lokal dengan provider.

### Menu, Stok & Meja
- `GET /api/products`: Katalog produk publik & admin.
- `POST /api/products`: Tambah produk baru (Admin).
- `PUT /api/products/:id`: Perbarui produk (Admin).
- `POST /api/products/:id/adjust-stock`: Mutasi stok dengan pencatatan alasan audit (Admin).
- `DELETE /api/products/:id`: Nonaktifkan produk (Admin).
- `GET /api/tables`: Daftar meja aktif.
- `GET /api/tables/validate`: Validasi meja dan token scan QR.
- `GET /api/tables/:id/qr`: Dapatkan gambar QR akrilik meja resolusi tinggi.

### Profil Publik & Pengaturan UMKM
- `GET /api/profile`: Ambil data profil publik, jam buka, status buka/tutup real-time, fasilitas & promo.
- `PUT /api/profile`: Perbarui profil, cerita, kontak, peta, dan jam buka (Admin).
- `GET /api/promotions`: Daftar promo aktif.
- `POST /api/promotions`: Buat promo baru (Admin).
- `GET /api/admin/dashboard`: Metrik pendapatan hari ini, bulan ini, dan produk terlaris.
- `GET /api/admin/orders/export-csv`: Unduh file laporan transaksi pesanan (CSV).

---

## 💳 5. Panduan Aktivasi Pembayaran: GoPay Merchant vs Midtrans API

### Hal Penting tentang GoPay Merchant
GoPay Merchant Indonesia pada aplikasi seluler menyediakan fitur *Tagih via QRIS*. Namun:
1. Akun aplikasi GoPay Merchant **tidak menyediakan API publik** untuk pembuatan QR dinamis per transaksi website secara otomatis.
2. Untuk menerima pembayaran QRIS dinamis yang terverifikasi server-to-server (otomatis berubah menjadi PAID tanpa klik manual kasir), pemilik cafe wajib menggunakan **Midtrans Payment Gateway** (anak perusahaan GoTo / penyedia gateway resmi GoPay).

### Langkah Menghubungkan Midtrans Core API QRIS:
1. Buka portal [Midtrans Registration](https://midtrans.com/) dan daftarkan akun bisnis Cafe Ruang Namu.
2. Di portal **Midtrans Sandbox** (untuk uji coba) atau **Midtrans Production**:
   - Buka menu **Settings → Access Keys**.
   - Salin **Merchant ID**, **Client Key**, dan **Server Key**.
3. Di sistem Cafe Ruang Namu, login ke **/admin** → Menu **Payment Gateway**:
   - Pilih provider: `MIDTRANS CORE API`.
   - Pilih lingkungan: `Sandbox` (untuk tes) atau `Produksi` (untuk live).
   - Masukkan Client Key dan Server Key Anda.
   - Klik **Simpan Konfigurasi**.
4. Di portal Midtrans:
   - Buka **Settings → Configuration**.
   - Pada kolom **Payment Notification URL**, isi URL webhook cafe Anda:  
     `https://domain-cafe-anda.com/api/webhooks/payments/midtrans`
5. Setelah metode QRIS disetujui oleh tim operasional Midtrans, transaksi QRIS pelanggan di meja akan langsung menghasilkan QR dinamis resmi Bank Indonesia dan pesanan akan otomatis terverifikasi lunas seketika (*settlement*).

---

## 🚀 6. Petunjuk Instalasi & Menjalankan Sistem

### Persyaratan Sistem:
- Node.js versi 18 ke atas (Direkomendasikan Node.js v24).
- npm versi 9 ke atas.

### Langkah Menjalankan:
```bash
# 1. Masuk ke folder proyek
cd "C:\Users\LENOVO\Downloads\projek  umkm"

# 2. Inisialisasi basis data dan data benih (seed)
npm run seed

# 3. Jalankan pengujian otomatis untuk memverifikasi sistem
npm test

# 4. Jalankan aplikasi dalam mode pengembangan (Client + Server berjalan bersamaan)
npm run dev
```

Aplikasi dapat diakses pada peramban web:
- **Website Publik & Profil Cafe**: `http://localhost:5173/`
- **Pemesanan Mandiri Pelanggan (QR Meja)**: `http://localhost:5173/order?table=01`
- **Layar Kasir Operasional (POS)**: `http://localhost:5173/cashier`
- **Panel Administrator**: `http://localhost:5173/admin`
- **Halaman Login Staf**: `http://localhost:5173/login`

### Kredensial Default Staf:
- **Owner / Administrator**: Username `admin`, Password `admin123`
- **Kasir Operasional**: Username `kasir`, Password `kasir123`

---

## 🧪 7. Hasil Pengujian Sistem (Automated Test Report)

Seluruh 15 skenario pengujian unit & integrasi teruji dan **100% PASS**:
1. `Auth: Admin and Cashier accounts exist and authenticate` (PASS)
2. `Auth: Generates and verifies valid JWT token with user role` (PASS)
3. `Auth: Rejects invalid or tempered JWT token` (PASS)
4. `OrderService: Calculates prices, tax, and creates order accurately from DB` (PASS)
5. `OrderService: Rejects order when stock is insufficient` (PASS)
6. `OrderService: Rejects order with invalid table number` (PASS)
7. `OrderService: Isolates order access using customer token` (PASS)
8. `PaymentService: Generates dynamic QRIS transaction with exact amount and order reference` (PASS)
9. `PaymentService: Processes Cash payment by cashier with exact change calculation` (PASS)
10. `PaymentService: Rejects Cash payment when cash received is insufficient` (PASS)
11. `Webhook: Valid mock webhook signature marks payment and order as PAID` (PASS)
12. `Webhook: Rejects notification with invalid signature` (PASS)
13. `Webhook: Idempotency prevents double processing of duplicate notifications` (PASS)
14. `Webhook: Rejects notification when amount is mismatched` (PASS)
15. `MidtransAdapter: Validates SHA512 signature per official documentation` (PASS)

---

## 📋 8. Daftar Pemeriksaan Sebelum Produksi (Pre-Production Checklist)

- [x] **Backend Security**: Header Helmet aktif, CORS terkonfigurasi, validasi data server-side.
- [x] **Harga & Nominal Aman**: Seluruh harga, pajak PB1, dan subtotal dihitung ulang di backend dari database. Frontend tidak dapat memanipulasi nominal.
- [x] **Kerahasiaan Kredensial**: Server Key Midtrans disimpan eksklusif pada environment variables & database server, tidak pernah terekspos ke frontend.
- [x] **Verifikasi Webhook**: Tanda tangan webhook SHA-512 divalidasi ketat terhadap Server Key resmi.
- [x] **Pencegahan Double Checkout**: Idempotency event diterapkan pada webhook berulang.
- [x] **Isolasi Data Pelanggan**: Detail dan struk pesanan dilindungi token unik per pesanan (`customer_token`).
- [x] **Proteksi Kasir**: Staf kasir tidak memiliki izin untuk memaksa transaksi QRIS menjadi lunas tanpa verifikasi gateway.
- [ ] **Aktivasi Merchant Midtrans**: Masukkan Server Key & Client Key produksi dari dashboard Midtrans saat akun merchant telah disetujui.
- [ ] **HTTPS / Sertifikat SSL**: Pastikan domain produksi menggunakan protokol HTTPS demi enkripsi data transaksi perbankan.

---
*Dikembangkan dengan standar keandalan tinggi untuk memajukan UMKM kuliner nusantara — Cafe Ruang Namu.*
