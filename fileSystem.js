// fileSystem.js
// Lapisan data: menyimpan dan menyediakan virtual file system.
// Tidak boleh mengakses DOM dari file ini.

const SUPPORTED_EXTENSIONS = ['pdf', 'docx', 'jpg', 'png', 'mp4'];

// Daftar file simulasi (diisi pada Fase 3)
let fileList = [];

// Memuat data file simulasi (diimplementasikan pada Fase 3)
function loadFiles() {
  // TODO: muat data dari data/files.json atau data bawaan
  fileList = [];
}

// Mengembalikan seluruh daftar file
function getAllFiles() {
  return fileList;
}

// Mengembalikan file pada direktori tertentu (diimplementasikan pada Fase 3)
function getFilesByDirectory(path) {
  // TODO: filter file berdasarkan path direktori
  return fileList.filter((file) => file.path.startsWith(path));
}
