# TASKS

Daftar tugas dan progres **File Search Simulator**.

**Legenda:** `[ ]` belum · `[~]` sedang dikerjakan · `[x]` selesai

---

## Fase 1 — Dokumentasi & Perencanaan

- [x] Menentukan topik dan ruang lingkup project
- [x] Membuat `README.md`
- [x] Membuat `CLAUDE.md`
- [x] Membuat `ARCHITECTURE.md`
- [x] Membuat `CONTRIBUTING.md`
- [x] Membuat `TASKS.md`
- [ ] Menentukan pembagian tugas anggota (jika berkelompok)

## Fase 2 — Setup Project

- [x] Membuat struktur folder (`css/`, `js/`, `data/`)
- [x] Membuat `index.html` kerangka dasar
- [x] Membuat `css/style.css` kosong dan menautkannya
- [x] Membuat `js/app.js`, `js/fileSystem.js`, `js/search.js` dan menautkannya
- [ ] Inisialisasi repositori Git

## Fase 3 — Data / Virtual File System

- [x] Menyusun `data/files.json` (minimal 30 file contoh) — 34 file
- [x] Mencakup semua ekstensi: PDF, DOCX, JPG, PNG, MP4
- [x] Menambahkan metadata: `name`, `extension`, `size`, `path`, `modifiedAt` (+ `id`, `hidden`)
- [x] Membuat `loadFiles()` dan `getAllFiles()` di `fileSystem.js`
- [x] Membuat `getFilesByDirectory(path)`

## Fase 4 — Logika Pencarian

- [x] `matchName()` (case-insensitive, sebagian kata)
- [x] `matchExtension()` (ekstensi tunggal atau gabungan, mis. JPG/PNG)
- [x] `searchFiles(query, extension, options)` (opsi: abaikan huruf besar/kecil, subfolder, file tersembunyi, lokasi)
- [x] `sortFiles()` (nama, ukuran, tanggal; naik/turun)
- [x] Menangani kasus: query kosong, tanpa hasil, spasi berlebih

## Fase 5 — Antarmuka (UI)

Mengikuti desain **mode gelap** (`Desain_SO_MODE_HYTAM.pdf`); mode terang dikerjakan anggota lain.

- [x] Kolom pencarian nama
- [x] Filter ekstensi (Semua, PDF, Docs, JPG/PNG, MP4 — JPG dan PNG digabung sesuai desain)
- [x] Daftar hasil (nama, ekstensi, ukuran, path, tanggal)
- [x] Ikon/penanda jenis file
- [x] Pesan "file tidak ditemukan"
- [x] Jumlah hasil pencarian
- [x] Opsi pengurutan hasil
- [x] Tampilan responsif
- [x] `formatSize()` dan `formatDate()`
- [x] Halaman Beranda, File Saya, Terbaru, dan Pengaturan sesuai desain
- [x] Panel detail file dan tombol "Buka File" (simulasi)

## Fase 6 — Pengujian

- [x] Uji pencarian nama
- [x] Uji filter tiap ekstensi
- [x] Uji kombinasi nama + ekstensi
- [x] Uji kasus ekstrem (query kosong, karakter khusus)
- [~] Uji di beberapa browser (Chrome, Firefox, Edge) — Chromium sudah lulus; Firefox dan Edge belum
- [x] Uji di layar kecil dan besar
- [x] Perbaiki bug yang ditemukan (belum ada bug pada pengujian otomatis)

## Fase 7 — Pengembangan Tambahan (Opsional)

- [x] Indexing berdasarkan ekstensi (`buildExtensionIndex()`, `getFilesByExtension()`)
- [ ] Tampilan pohon folder (tree view)
- [ ] Pencarian berdasarkan ukuran dan tanggal
- [x] Riwayat pencarian (`localStorage`)
- [ ] Mode gelap

## Fase 8 — Laporan & Pengumpulan

- [ ] Menjelaskan kaitan project dengan materi Sistem Operasi
- [ ] Menyusun laporan sesuai template
- [ ] Menyiapkan tangkapan layar aplikasi
- [ ] Menyiapkan presentasi/demo (jika diminta)
- [ ] Final check dan pengumpulan

---

## Catatan

- Perbarui file ini setiap tugas selesai.
- Tugas baru ditambahkan pada fase yang sesuai.
- Tambahkan tanggal atau nama pengerja bila bekerja berkelompok.
- Setelah mengubah `data/files.json`, buat ulang `data/files.js` (lihat `ARCHITECTURE.md` bagian 4).