// fileSystem.js
// Lapisan data: menyimpan dan menyediakan virtual file system.
// Tidak boleh mengakses DOM dari file ini.

const SUPPORTED_EXTENSIONS = ['pdf', 'docx', 'jpg', 'png', 'mp4'];
const FILES_URL = 'data/files.json';
const PATH_SEPARATOR = '\\';
const REQUIRED_FIELDS = ['name', 'extension', 'size', 'path', 'modifiedAt'];

// Daftar file simulasi (diisi oleh loadFiles)
let fileList = [];

// Memeriksa apakah objek file memiliki metadata wajib dan ekstensi yang didukung
function isValidFile(file) {
  const hasAllFields = REQUIRED_FIELDS.every((field) => file[field] !== undefined);
  return hasAllFields && SUPPORTED_EXTENSIONS.includes(String(file.extension).toLowerCase());
}

// Menyeragamkan data: ekstensi huruf kecil dan atribut hidden selalu ada
function normalizeFile(file) {
  return {
    ...file,
    extension: String(file.extension).toLowerCase(),
    hidden: file.hidden === true
  };
}

// Mengambil data dari data/files.json.
// Saat index.html dibuka langsung (file://), fetch ditolak browser,
// sehingga dipakai salinan data di data/files.js (FILES_FALLBACK).
async function fetchFileData() {
  try {
    const response = await fetch(FILES_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (typeof FILES_FALLBACK !== 'undefined') {
      return FILES_FALLBACK;
    }
    console.error('Gagal memuat data file simulasi:', error);
    return [];
  }
}

// Memuat data file simulasi ke dalam fileList
async function loadFiles() {
  const data = await fetchFileData();
  fileList = data.filter(isValidFile).map(normalizeFile);
  return fileList;
}

// Mengembalikan seluruh daftar file
function getAllFiles() {
  return fileList;
}

// Mengambil direktori dari path lengkap file, contoh:
// 'D:\Dokumen\Kuliah\Laporan_Kuliah.pdf' -> 'D:\Dokumen\Kuliah'
function getDirectory(file) {
  return file.path.slice(0, file.path.lastIndexOf(PATH_SEPARATOR));
}

// Mengembalikan file pada direktori tertentu.
// includeSubfolders = true juga menyertakan isi subfolder (perbandingan tanpa beda huruf besar/kecil).
function getFilesByDirectory(path, includeSubfolders = true) {
  const target = path.replace(/[\\/]+$/, '').toLowerCase();

  return fileList.filter((file) => {
    const directory = getDirectory(file).toLowerCase();
    if (directory === target) {
      return true;
    }
    return includeSubfolders && directory.startsWith(target + PATH_SEPARATOR);
  });
}