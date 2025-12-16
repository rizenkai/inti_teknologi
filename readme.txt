README.txt
===========

Document Management System (DMS)
===============================

## Deskripsi
Aplikasi ini merupakan Document Management System berbasis web dengan fitur role-based access (admin, staff, user, owner), upload/download dokumen, manajemen user, dan tema light/dark mode.

---

## Pengujian Bug
Berikut adalah catatan hasil pengujian dan bug yang ditemukan:

### v1.0.0 (Initial Release)
- **Pengujian:**
  - Login, dashboard, upload, download, dan user management diuji secara manual.
- **Bug Ditemukan:**
  - **CORS Error:** Gagal login dari device selain utama. Penyebab: konfigurasi CORS salah (origin: '*', credentials: true).
    - **Penanganan:** Konfigurasi CORS diperbaiki agar hanya mengizinkan domain frontend (Netlify) dan menangani preflight request.
  - **Proxy Error:** Frontend tetap mengarah ke localhost:5000 meski sudah diubah ke Railway. Penyebab: ada "proxy" di package.json.
    - **Penanganan:** Menghapus proxy di package.json.
  - **Upload File Hilang:** File upload hilang setelah redeploy Railway. Penyebab: Railway storage ephemeral.
    - **Penanganan:** Migrasi upload ke Cloudinary.
  - **Cloudinary PDF Tidak Bisa Diakses:** FilePath Cloudinary PDF menggunakan /image/upload/ sehingga tidak bisa diakses publik.
    - **Penanganan:** Ubah resource_type menjadi 'raw' agar filePath menjadi /raw/upload/.
  - **Dropdown Tidak Sinkron:** Dropdown Mutu/Tipe Bahan otomatis terisi saat Tipe Pengujian dipilih, user ingin manual.
    - **Penanganan:** Ubah logika agar user memilih manual.
  - **Tampilan Light Mode Kurang Konsisten:** Ada area yang tetap gelap saat light mode.
    - **Penanganan:** Perbaiki background, overlay, dan warna di semua komponen.

---

## Daftar Versi
- **v1.0.0**: Rilis awal, fitur dasar (login, dashboard, upload/download, user management, light/dark mode)
- **v1.1.0**: Perbaikan CORS, proxy, dan migrasi upload ke Cloudinary
- **v1.2.0**: Perbaikan Cloudinary resource_type dan dropdown manual
- **v1.3.0**: Peningkatan konsistensi tampilan light mode

---

## Catatan
- Pengujian dilakukan secara manual pada setiap rilis.
- Setiap bug dicatat dan dijelaskan penanganannya.
- Silakan cek changelog untuk detail perubahan tiap versi.
