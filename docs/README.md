# File Search Simulator

Aplikasi web simulasi fungsi sistem operasi yang membantu pengguna **menemukan file dengan cepat dan mudah** berdasarkan **nama file** atau **jenis ekstensi** (PDF, DOCX, JPG, PNG, MP4).

> Project mata kuliah **Sistem Operasi** — Informatika, Universitas Siliwangi.

---

## Deskripsi

File Search Simulator meniru cara kerja fitur pencarian file pada sistem operasi. Data file disimpan dalam *virtual file system* (struktur direktori tiruan di JavaScript), lalu pengguna dapat mencari file lewat kolom pencarian dan filter ekstensi. Simulasi ini menunjukkan konsep **manajemen file**, **struktur direktori**, **metadata file**, dan **algoritma pencarian**.

## Fitur Utama

- Pencarian file berdasarkan **nama** (case-insensitive, mendukung pencarian sebagian kata)
- Filter berdasarkan **jenis ekstensi**: `.pdf`, `.docx`, `.jpg`, `.png`, `.mp4`
- Kombinasi pencarian nama + filter ekstensi
- Tampilan hasil berisi nama, ekstensi, ukuran, lokasi (path), dan tanggal modifikasi
- Pengurutan hasil (nama, ukuran, tanggal)
- Virtual file system sebagai data simulasi
- Tampilan responsif dan mudah digunakan

## Teknologi

| Bagian | Teknologi |
|--------|-----------|
| Struktur | HTML5 |
| Tampilan | CSS3 |
| Logika & simulasi | JavaScript (vanilla) |
| Data | Objek/array JavaScript atau file JSON |

## Struktur Folder

```
file-search-simulator/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js            # inisialisasi & event handler UI
│   ├── fileSystem.js     # virtual file system (data + struktur direktori)
│   └── search.js         # logika pencarian & filter
├── data/
│   └── files.json        # data file simulasi
├── README.md
├── CLAUDE.md
├── ARCHITECTURE.md
├── CONTRIBUTING.md
└── TASKS.md
```

## Cara Menjalankan

1. Clone atau unduh repositori ini.
2. Buka folder project.
3. Buka `index.html` di browser (atau gunakan ekstensi *Live Server* di VS Code).

Tidak perlu instalasi dependensi.

## Cara Penggunaan

1. Ketik nama file (atau sebagian nama) pada kolom pencarian.
2. Pilih jenis ekstensi pada filter (PDF, DOCX, JPG, PNG, MP4, atau Semua).
3. Hasil pencarian tampil otomatis di daftar hasil.
4. Urutkan hasil sesuai kebutuhan.

## Kaitan dengan Materi Sistem Operasi

- **File system**: representasi file dan direktori
- **Metadata file**: nama, ekstensi, ukuran, path, waktu modifikasi
- **Pencarian file**: linear search dan konsep indexing
- **Antarmuka pengguna**: abstraksi layanan OS bagi pengguna

## Dokumentasi Project

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — arsitektur dan desain sistem
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — panduan kontribusi dan standar kode
- [`TASKS.md`](TASKS.md) — daftar tugas dan progres
- [`CLAUDE.md`](CLAUDE.md) — konteks dan aturan kerja untuk asisten AI

## Tim / Pembuat

- Reisya Heryadi — NPM 257006111002 — Kelas A
- Informatika, Universitas Siliwangi

## Lisensi

Project ini dibuat untuk keperluan akademik.
