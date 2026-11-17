// Salinan files.json agar aplikasi bisa dibuka langsung lewat file://.
// Dibuat otomatis dari files.json; jangan diedit manual.
const FILES_FALLBACK = [
  {
    "id": 1,
    "name": "Laporan_Kuliah",
    "extension": "pdf",
    "size": 250880,
    "path": "D:\\Dokumen\\Kuliah\\Laporan_Kuliah.pdf",
    "modifiedAt": "2026-09-10T14:30:00",
    "hidden": false
  },
  {
    "id": 2,
    "name": "Catatan_SistemOperasi",
    "extension": "docx",
    "size": 48200,
    "path": "D:\\Dokumen\\Kuliah\\Catatan_SistemOperasi.docx",
    "modifiedAt": "2026-11-12T10:15:00",
    "hidden": false
  },
  {
    "id": 3,
    "name": "Tugas_FileSystem",
    "extension": "pdf",
    "size": 512340,
    "path": "D:\\Dokumen\\Kuliah\\Tugas_FileSystem.pdf",
    "modifiedAt": "2026-11-12T08:45:00",
    "hidden": false
  },
  {
    "id": 4,
    "name": "Modul_Praktikum_SO",
    "extension": "pdf",
    "size": 1843200,
    "path": "D:\\Dokumen\\Kuliah\\Modul_Praktikum_SO.pdf",
    "modifiedAt": "2026-10-02T13:00:00",
    "hidden": false
  },
  {
    "id": 5,
    "name": "Soal_UTS_SistemOperasi",
    "extension": "pdf",
    "size": 327680,
    "path": "D:\\Dokumen\\Kuliah\\Soal_UTS_SistemOperasi.pdf",
    "modifiedAt": "2026-10-20T09:00:00",
    "hidden": false
  },
  {
    "id": 6,
    "name": "Ringkasan_Materi",
    "extension": "docx",
    "size": 61440,
    "path": "D:\\Dokumen\\Kuliah\\Ringkasan_Materi.docx",
    "modifiedAt": "2026-10-25T19:20:00",
    "hidden": false
  },
  {
    "id": 7,
    "name": "Jadwal_Praktikum",
    "extension": "pdf",
    "size": 102400,
    "path": "D:\\Dokumen\\Jadwal_Praktikum.pdf",
    "modifiedAt": "2026-11-08T07:30:00",
    "hidden": false
  },
  {
    "id": 8,
    "name": "CV_Reisya",
    "extension": "docx",
    "size": 74752,
    "path": "D:\\Dokumen\\CV_Reisya.docx",
    "modifiedAt": "2026-08-15T21:10:00",
    "hidden": false
  },
  {
    "id": 9,
    "name": "Surat_Izin_Magang",
    "extension": "docx",
    "size": 36864,
    "path": "D:\\Dokumen\\Surat_Izin_Magang.docx",
    "modifiedAt": "2026-07-30T11:00:00",
    "hidden": false
  },
  {
    "id": 10,
    "name": "Panduan_Laporan",
    "extension": "pdf",
    "size": 889000,
    "path": "D:\\Dokumen\\Panduan_Laporan.pdf",
    "modifiedAt": "2026-09-01T10:00:00",
    "hidden": false
  },
  {
    "id": 11,
    "name": "Laporan_Proyek",
    "extension": "docx",
    "size": 143360,
    "path": "D:\\Dokumen\\Proyek\\Laporan_Proyek.docx",
    "modifiedAt": "2026-09-08T16:45:00",
    "hidden": false
  },
  {
    "id": 12,
    "name": "Proposal_Proyek",
    "extension": "docx",
    "size": 98304,
    "path": "D:\\Dokumen\\Proyek\\Proposal_Proyek.docx",
    "modifiedAt": "2026-08-28T09:30:00",
    "hidden": false
  },
  {
    "id": 13,
    "name": "Dokumentasi_API",
    "extension": "pdf",
    "size": 456704,
    "path": "D:\\Dokumen\\Proyek\\Dokumentasi_API.pdf",
    "modifiedAt": "2026-09-18T15:00:00",
    "hidden": false
  },
  {
    "id": 14,
    "name": "Laporan_Magang",
    "extension": "jpg",
    "size": 2411520,
    "path": "D:\\Gambar\\Laporan_Magang.jpg",
    "modifiedAt": "2026-09-05T12:00:00",
    "hidden": false
  },
  {
    "id": 15,
    "name": "Foto_Praktikum",
    "extension": "png",
    "size": 1892352,
    "path": "D:\\Gambar\\Foto_Praktikum.png",
    "modifiedAt": "2026-11-10T14:00:00",
    "hidden": false
  },
  {
    "id": 16,
    "name": "Foto_Profil",
    "extension": "jpg",
    "size": 524288,
    "path": "D:\\Gambar\\Foto_Profil.jpg",
    "modifiedAt": "2026-06-12T08:00:00",
    "hidden": false
  },
  {
    "id": 17,
    "name": "Screenshot_Aplikasi",
    "extension": "png",
    "size": 748544,
    "path": "D:\\Gambar\\Screenshot_Aplikasi.png",
    "modifiedAt": "2026-11-03T20:15:00",
    "hidden": false
  },
  {
    "id": 18,
    "name": "Poster_Kegiatan",
    "extension": "jpg",
    "size": 3145728,
    "path": "D:\\Gambar\\Poster_Kegiatan.jpg",
    "modifiedAt": "2026-10-11T10:40:00",
    "hidden": false
  },
  {
    "id": 19,
    "name": "Laporan_Desain",
    "extension": "png",
    "size": 1228800,
    "path": "D:\\Gambar\\Desain\\Laporan_Desain.png",
    "modifiedAt": "2026-09-01T09:10:00",
    "hidden": false
  },
  {
    "id": 20,
    "name": "Logo_Simulator",
    "extension": "png",
    "size": 196608,
    "path": "D:\\Gambar\\Desain\\Logo_Simulator.png",
    "modifiedAt": "2026-11-05T13:25:00",
    "hidden": false
  },
  {
    "id": 21,
    "name": "Mockup_Beranda",
    "extension": "png",
    "size": 2097152,
    "path": "D:\\Gambar\\Desain\\Mockup_Beranda.png",
    "modifiedAt": "2026-11-14T17:00:00",
    "hidden": false
  },
  {
    "id": 22,
    "name": "Mockup_Pencarian",
    "extension": "png",
    "size": 2306867,
    "path": "D:\\Gambar\\Desain\\Mockup_Pencarian.png",
    "modifiedAt": "2026-11-14T17:30:00",
    "hidden": false
  },
  {
    "id": 23,
    "name": "Foto_Kantor",
    "extension": "jpg",
    "size": 1677721,
    "path": "D:\\Gambar\\Magang\\Foto_Kantor.jpg",
    "modifiedAt": "2026-08-20T09:00:00",
    "hidden": false
  },
  {
    "id": 24,
    "name": "Foto_Tim",
    "extension": "jpg",
    "size": 2008186,
    "path": "D:\\Gambar\\Magang\\Foto_Tim.jpg",
    "modifiedAt": "2026-08-22T15:30:00",
    "hidden": false
  },
  {
    "id": 25,
    "name": "Laporan_Presentasi",
    "extension": "mp4",
    "size": 52428800,
    "path": "D:\\Video\\Laporan_Presentasi.mp4",
    "modifiedAt": "2026-09-02T10:00:00",
    "hidden": false
  },
  {
    "id": 26,
    "name": "Rekaman_Presentasi",
    "extension": "mp4",
    "size": 73400320,
    "path": "D:\\Video\\Rekaman_Presentasi.mp4",
    "modifiedAt": "2026-11-09T11:00:00",
    "hidden": false
  },
  {
    "id": 27,
    "name": "Tutorial_Git",
    "extension": "mp4",
    "size": 125829120,
    "path": "D:\\Video\\Tutorial_Git.mp4",
    "modifiedAt": "2026-10-05T19:00:00",
    "hidden": false
  },
  {
    "id": 28,
    "name": "Demo_Aplikasi",
    "extension": "mp4",
    "size": 89128960,
    "path": "D:\\Video\\Demo_Aplikasi.mp4",
    "modifiedAt": "2026-11-15T21:00:00",
    "hidden": false
  },
  {
    "id": 29,
    "name": "Kuliah_Sistem_Operasi",
    "extension": "mp4",
    "size": 209715200,
    "path": "D:\\Video\\Kuliah_Sistem_Operasi.mp4",
    "modifiedAt": "2026-10-14T08:00:00",
    "hidden": false
  },
  {
    "id": 30,
    "name": "Rencana_Proyek",
    "extension": "docx",
    "size": 57344,
    "path": "D:\\Proyek\\Rencana_Proyek.docx",
    "modifiedAt": "2026-09-12T10:00:00",
    "hidden": false
  },
  {
    "id": 31,
    "name": "Struktur_Folder",
    "extension": "pdf",
    "size": 81920,
    "path": "D:\\Proyek\\Struktur_Folder.pdf",
    "modifiedAt": "2026-10-30T14:10:00",
    "hidden": false
  },
  {
    "id": 32,
    "name": "Notulen_Rapat",
    "extension": "docx",
    "size": 40960,
    "path": "D:\\Proyek\\Notulen_Rapat.docx",
    "modifiedAt": "2026-11-02T16:00:00",
    "hidden": false
  },
  {
    "id": 33,
    "name": "Draft_Laporan_Lama",
    "extension": "pdf",
    "size": 196000,
    "path": "D:\\Dokumen\\Kuliah\\Draft_Laporan_Lama.pdf",
    "modifiedAt": "2026-05-18T09:45:00",
    "hidden": true
  },
  {
    "id": 34,
    "name": "Cadangan_Foto",
    "extension": "jpg",
    "size": 4194304,
    "path": "D:\\Gambar\\Cadangan_Foto.jpg",
    "modifiedAt": "2026-04-03T18:00:00",
    "hidden": true
  }
];