# CLAUDE.md

File ini berisi konteks dan aturan kerja agar asisten AI (Claude) memberi bantuan yang konsisten pada project ini.

## Ringkasan Project

**File Search Simulator** adalah web simulasi fungsi sistem operasi untuk mencari file berdasarkan **nama** dan **jenis ekstensi** (PDF, DOCX, JPG, PNG, MP4). Project ini adalah tugas mata kuliah **Sistem Operasi** (Informatika, Universitas Siliwangi).

## Tech Stack

- HTML5, CSS3, JavaScript vanilla (tanpa framework dan tanpa build step)
- Data simulasi: array/objek JS atau `data/files.json`
- Dijalankan langsung di browser

## Struktur Penting

- `index.html` — halaman utama
- `css/style.css` — seluruh gaya
- `js/app.js` — UI dan event handler
- `js/fileSystem.js` — virtual file system
- `js/search.js` — logika pencarian dan filter
- `data/files.json` — data file simulasi

Detail lengkap ada di `ARCHITECTURE.md`.

## Aturan Kerja

1. **Baca dulu** `ARCHITECTURE.md` dan `TASKS.md` sebelum mengubah kode.
2. Pertahankan **pemisahan tanggung jawab**: logika pencarian tidak boleh bercampur dengan manipulasi DOM.
3. Gunakan **JavaScript vanilla**; jangan menambah library/framework tanpa persetujuan pengguna.
4. Jaga agar project bisa dibuka langsung lewat `index.html`.
5. Ikuti standar kode di `CONTRIBUTING.md`.
6. Perbarui `TASKS.md` setiap tugas selesai.
7. Jika ada keputusan arsitektur baru, catat di `ARCHITECTURE.md`.

## Gaya Kode

- Penamaan variabel dan fungsi: `camelCase`; konstanta: `UPPER_SNAKE_CASE`
- Indentasi 2 spasi, titik koma di akhir pernyataan
- Fungsi kecil dan satu tujuan; beri komentar singkat berbahasa Indonesia untuk logika penting
- Gunakan `const`/`let`, hindari `var`

## Aturan Domain

- Ekstensi yang didukung: `pdf`, `docx`, `jpg`, `png`, `mp4`
- Pencarian nama bersifat **case-insensitive** dan mendukung kecocokan sebagian
- Ekstensi dibandingkan dalam huruf kecil
- Metadata file wajib: `name`, `extension`, `size`, `path`, `modifiedAt`

## Bahasa

- Dokumentasi dan komentar kode: **Bahasa Indonesia**
- Nama variabel dan fungsi: **Bahasa Inggris**
- Pesan commit: Bahasa Indonesia, mengikuti format di `CONTRIBUTING.md`

## Yang Perlu Dihindari

- Mengubah struktur folder tanpa memperbarui `ARCHITECTURE.md`
- Menambah dependensi eksternal tanpa persetujuan
- Mencampur logika pencarian dengan kode tampilan
- Menghapus data simulasi tanpa konfirmasi

## Referensi Dokumen

- `README.md` — gambaran umum dan cara menjalankan
- `ARCHITECTURE.md` — desain sistem
- `CONTRIBUTING.md` — standar kontribusi
- `TASKS.md` — daftar tugas dan progres
