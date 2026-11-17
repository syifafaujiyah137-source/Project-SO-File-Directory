# ARCHITECTURE

Dokumen ini menjelaskan arsitektur **File Search Simulator**.

## 1. Tujuan Sistem

Mensimulasikan fungsi pencarian file pada sistem operasi: pengguna dapat menemukan file berdasarkan **nama** dan **ekstensi** (PDF, DOCX, JPG, PNG, MP4) secara cepat dan mudah.

## 2. Gambaran Arsitektur

Aplikasi berjalan sepenuhnya di sisi klien (browser) dengan tiga lapisan:

```
┌─────────────────────────────────────────┐
│  Presentation Layer (UI)                │
│  index.html · style.css · app.js        │
├─────────────────────────────────────────┤
│  Logic Layer                            │
│  search.js (pencarian, filter, sorting) │
├─────────────────────────────────────────┤
│  Data Layer                             │
│  fileSystem.js · data/files.json        │
└─────────────────────────────────────────┘
```

| Lapisan | File | Tanggung jawab |
|---------|------|----------------|
| Presentation | `index.html`, `css/style.css`, `js/app.js` | Menampilkan UI, menangkap input, merender hasil |
| Logic | `js/search.js` | Mencocokkan nama, memfilter ekstensi, mengurutkan hasil |
| Data | `js/fileSystem.js`, `data/files.json` | Menyimpan dan menyediakan virtual file system |

## 3. Alur Data

```
Input pengguna (nama + ekstensi)
        │
        ▼
   app.js (event handler)
        │  panggil searchFiles(query, extension)
        ▼
   search.js
        │  ambil semua file dari getAllFiles()
        ▼
   fileSystem.js  ──► daftar file (virtual)
        │
        ▼
   hasil terfilter & terurut
        │
        ▼
   app.js merender hasil ke DOM
```

## 4. Model Data

Setiap file direpresentasikan sebagai objek:

```json
{
  "id": 1,
  "name": "laporan-praktikum",
  "extension": "pdf",
  "size": 245760,
  "path": "/Documents/Kuliah/laporan-praktikum.pdf",
  "modifiedAt": "2026-11-10T09:30:00"
}
```

| Atribut | Tipe | Keterangan |
|---------|------|------------|
| `id` | number | Pengenal unik |
| `name` | string | Nama file tanpa ekstensi |
| `extension` | string | `pdf`, `docx`, `jpg`, `png`, atau `mp4` (huruf kecil) |
| `size` | number | Ukuran dalam byte |
| `path` | string | Lokasi lengkap pada virtual file system |
| `modifiedAt` | string | Waktu modifikasi (ISO 8601) |

## 5. Komponen Modul

### 5.1 `fileSystem.js`
- `getAllFiles()` — mengembalikan seluruh daftar file
- `getFilesByDirectory(path)` — mengembalikan file pada direktori tertentu
- `loadFiles()` — memuat data dari `data/files.json` atau data bawaan

### 5.2 `search.js`
- `searchFiles(query, extension)` — fungsi utama pencarian
- `matchName(file, query)` — pencocokan nama (case-insensitive, sebagian)
- `matchExtension(file, extension)` — pencocokan ekstensi
- `sortFiles(files, key, order)` — pengurutan hasil

### 5.3 `app.js`
- Inisialisasi aplikasi dan event listener
- `renderResults(files)` — menampilkan hasil ke DOM
- `formatSize(bytes)` dan `formatDate(iso)` — pemformat tampilan

## 6. Algoritma Pencarian

Versi awal memakai **linear search**: setiap file diperiksa satu per satu (kompleksitas O(n)).

```
untuk setiap file di daftar:
    jika nama mengandung query DAN (ekstensi sesuai ATAU filter = semua):
        tambahkan ke hasil
urutkan hasil
```

Pengembangan opsional: **indexing** (peta ekstensi → daftar file) agar filter ekstensi lebih cepat, sejalan dengan konsep indeks pada file system sungguhan.

## 7. Keputusan Desain

| Keputusan | Alasan |
|-----------|--------|
| JavaScript vanilla tanpa framework | Sederhana, mudah dijelaskan di laporan, tanpa build step |
| Virtual file system | Browser tidak boleh mengakses file sistem secara bebas; simulasi lebih aman dan mudah didemokan |
| Pemisahan UI, logika, dan data | Memudahkan pengujian dan perawatan |
| Data dalam JSON | Mudah diubah tanpa menyentuh kode |

## 8. Keterkaitan dengan Konsep Sistem Operasi

| Komponen aplikasi | Konsep OS |
|-------------------|-----------|
| Virtual file system | Struktur direktori dan file system |
| Atribut file | Metadata file (inode/FCB) |
| Pencarian file | Operasi pada file system, searching, indexing |
| UI pencarian | Abstraksi layanan OS bagi pengguna |

## 9. Batasan

- Berjalan di browser dan tidak mengakses file asli komputer pengguna
- Data bersifat simulasi
- Belum ada penyimpanan permanen (opsional: `localStorage`)

## 10. Rencana Pengembangan

- Pencarian dengan indexing
- Penelusuran folder (tree view)
- Pencarian berdasarkan ukuran dan tanggal
- Penyimpanan riwayat pencarian
