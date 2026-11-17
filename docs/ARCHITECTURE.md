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
│  (+ salinan data/files.js)              │
└─────────────────────────────────────────┘
```

| Lapisan | File | Tanggung jawab |
|---------|------|----------------|
| Presentation | `index.html`, `css/style.css`, `js/app.js` | Menampilkan UI, menangkap input, merender hasil |
| Logic | `js/search.js` | Mencocokkan nama, memfilter ekstensi, mengurutkan hasil |
| Data | `js/fileSystem.js`, `data/files.json`, `data/files.js` | Menyimpan dan menyediakan virtual file system |

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
  "name": "Laporan_Kuliah",
  "extension": "pdf",
  "size": 250880,
  "path": "D:\\Dokumen\\Kuliah\\Laporan_Kuliah.pdf",
  "modifiedAt": "2026-09-10T14:30:00",
  "hidden": false
}
```

| Atribut | Tipe | Keterangan |
|---------|------|------------|
| `id` | number | Pengenal unik |
| `name` | string | Nama file tanpa ekstensi |
| `extension` | string | `pdf`, `docx`, `jpg`, `png`, atau `mp4` (huruf kecil) |
| `size` | number | Ukuran dalam byte |
| `path` | string | Lokasi lengkap termasuk nama file, gaya Windows (`D:\Folder\file.ext`; di JSON ditulis `\\`) |
| `modifiedAt` | string | Waktu modifikasi (ISO 8601) |
| `hidden` | boolean | Atribut file tersembunyi (untuk pengaturan "Tampilkan file tersembunyi") |

Struktur virtual drive `D:\`: `Dokumen` (`Kuliah`, `Proyek`), `Gambar` (`Desain`, `Magang`), `Video`, dan `Proyek`.

### Sumber data dan salinan

- `data/files.json` adalah **sumber utama** data simulasi.
- `data/files.js` adalah salinan berbentuk `const FILES_FALLBACK = [...]`. Browser menolak `fetch()` saat `index.html` dibuka langsung (`file://`), jadi `loadFiles()` memakai salinan ini sebagai cadangan. Dengan cara ini aplikasi tetap bisa dibuka langsung tanpa server.
- Setelah mengubah `files.json`, buat ulang `files.js` dari folder `data/`:

```bash
{ echo "// Salinan files.json agar aplikasi bisa dibuka langsung lewat file://."; echo "// Dibuat otomatis dari files.json; jangan diedit manual."; printf 'const FILES_FALLBACK = '; node -e "process.stdout.write(JSON.stringify(JSON.parse(require('fs').readFileSync('files.json','utf8')),null,2))"; echo ";"; } > files.js
```

## 5. Komponen Modul

### 5.1 `fileSystem.js`
- `loadFiles()` — async; memuat `data/files.json` lewat `fetch`, memakai `FILES_FALLBACK` bila gagal, lalu memvalidasi dan menormalkan data (ekstensi huruf kecil, `hidden` selalu ada)
- `getAllFiles()` — mengembalikan seluruh daftar file
- `getFilesByDirectory(path, includeSubfolders = true)` — mengembalikan file pada direktori tertentu (tanpa beda huruf besar/kecil, opsional termasuk subfolder)
- `getDirectory(file)` — mengambil direktori dari path lengkap file

### 5.2 `search.js`
- `searchFiles(query, extension)` — fungsi utama pencarian
- `matchName(file, query)` — pencocokan nama (case-insensitive, sebagian)
- `matchExtension(file, extension)` — pencocokan ekstensi
- `sortFiles(files, key, order)` — pengurutan hasil

### 5.3 `app.js`
- Inisialisasi aplikasi (menunggu `loadFiles()` selesai) dan event listener
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
| Salinan data `files.js` sebagai cadangan `fetch` | Aplikasi tetap bisa dibuka langsung lewat `index.html` (`file://`) |
| Path gaya Windows (`D:\...`) | Sesuai desain UI |
| UI mengikuti desain mode gelap | Mode terang dikerjakan anggota lain |

## 8. Keterkaitan dengan Konsep Sistem Operasi

| Komponen aplikasi | Konsep OS |
|-------------------|-----------|
| Virtual file system | Struktur direktori dan file system |
| Atribut file | Metadata file (inode/FCB), termasuk atribut hidden |
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