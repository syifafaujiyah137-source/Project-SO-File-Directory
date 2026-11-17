# Panduan Kontribusi

Terima kasih sudah ikut mengembangkan **File Search Simulator**. Ikuti panduan ini agar project tetap rapi dan konsisten.

## Persiapan

1. Clone repositori:
   ```bash
   git clone <url-repositori>
   cd file-search-simulator
   ```
2. Buka `index.html` di browser, atau pakai *Live Server* di VS Code.
3. Baca `README.md`, `ARCHITECTURE.md`, dan `TASKS.md` terlebih dahulu.

## Alur Kerja

1. Pilih tugas dari `TASKS.md`.
2. Buat branch baru dari `main`:
   ```bash
   git checkout -b fitur/nama-fitur
   ```
3. Kerjakan perubahan dengan commit kecil dan jelas.
4. Uji manual di browser (lihat bagian Pengujian).
5. Perbarui `TASKS.md` bila tugas selesai.
6. Push branch dan buat Pull Request ke `main`.

## Penamaan Branch

| Prefix | Kegunaan | Contoh |
|--------|----------|--------|
| `fitur/` | Fitur baru | `fitur/filter-ekstensi` |
| `perbaikan/` | Perbaikan bug | `perbaikan/hasil-kosong` |
| `dokumen/` | Dokumentasi | `dokumen/update-readme` |
| `refaktor/` | Perapian kode | `refaktor/pisah-modul-search` |

## Format Pesan Commit

```
<tipe>: <deskripsi singkat>
```

Tipe: `fitur`, `perbaikan`, `dokumen`, `gaya`, `refaktor`, `uji`.

Contoh:
- `fitur: tambah filter ekstensi mp4`
- `perbaikan: pencarian nama tidak case-insensitive`
- `dokumen: lengkapi ARCHITECTURE.md`

## Standar Kode

### Umum
- Indentasi 2 spasi dan titik koma di akhir pernyataan
- Gunakan `const` dan `let`, jangan `var`
- Satu fungsi satu tujuan, usahakan di bawah 30 baris
- Komentar berbahasa Indonesia untuk logika yang tidak jelas

### Penamaan
- Variabel dan fungsi: `camelCase` (`searchFiles`)
- Konstanta: `UPPER_SNAKE_CASE` (`SUPPORTED_EXTENSIONS`)
- File: huruf kecil, kata dipisah `-` atau `camelCase` sesuai struktur yang ada
- Class CSS: huruf kecil dengan tanda `-` (`result-item`)

### Pemisahan Tanggung Jawab
- `app.js` hanya mengurus UI dan event
- `search.js` hanya mengurus logika pencarian
- `fileSystem.js` hanya mengurus data file
- Jangan mengakses DOM dari `search.js` atau `fileSystem.js`

### HTML dan CSS
- Gunakan elemen semantik (`header`, `main`, `section`)
- Tambahkan atribut `alt` pada gambar dan `label` pada input
- Semua gaya berada di `css/style.css`; hindari *inline style*
- Pastikan tampilan responsif

## Pengujian

Uji manual sebelum Pull Request:

- [ ] Pencarian nama (huruf besar/kecil, sebagian kata)
- [ ] Filter tiap ekstensi: PDF, DOCX, JPG, PNG, MP4
- [ ] Kombinasi nama + ekstensi
- [ ] Pencarian tanpa hasil menampilkan pesan yang sesuai
- [ ] Kolom pencarian kosong menampilkan semua file
- [ ] Tampilan di layar kecil dan besar
- [ ] Tidak ada error di console browser

## Pull Request

Sertakan pada deskripsi:
- Ringkasan perubahan
- Tugas terkait di `TASKS.md`
- Hasil pengujian
- Tangkapan layar (jika mengubah tampilan)

## Aturan Tambahan

- Jangan menambah library atau framework tanpa diskusi.
- Jangan mengubah struktur folder tanpa memperbarui `ARCHITECTURE.md`.
- Jangan mengunggah file besar atau data pribadi ke repositori.
- Hormati pembagian tugas anggota tim.
