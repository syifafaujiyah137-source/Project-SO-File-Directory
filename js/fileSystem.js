// fileSystem.js
// Lapisan data: menyimpan dan menyediakan virtual file system.
// Tidak boleh mengakses DOM dari file ini.

const SUPPORTED_EXTENSIONS = ['pdf', 'docx', 'jpg', 'png', 'mp4'];
const FILES_URL = 'data/files.json';
const PATH_SEPARATOR = '\\';
const REQUIRED_FIELDS = ['name', 'extension', 'size', 'path', 'modifiedAt'];

// Daftar file simulasi (diisi oleh loadFiles)
let fileList = [];

// Indeks ekstensi: peta ekstensi -> daftar file (dibangun oleh buildExtensionIndex)
let extensionIndex = new Map();

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
  // Dibuka langsung dari file://: lewati fetch agar console bersih dari error
  const isLocalFile = typeof location !== 'undefined' && location.protocol === 'file:';
  if (isLocalFile && typeof FILES_FALLBACK !== 'undefined') {
    return FILES_FALLBACK;
  }

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

// Membangun indeks ekstensi sekali saja (O(n)) agar filter ekstensi
// tidak perlu memeriksa seluruh file pada setiap pencarian
function buildExtensionIndex() {
  extensionIndex = new Map();
  fileList.forEach((file) => {
    if (!extensionIndex.has(file.extension)) {
      extensionIndex.set(file.extension, []);
    }
    extensionIndex.get(file.extension).push(file);
  });
}

// Memuat data file simulasi ke dalam fileList lalu membangun indeksnya
async function loadFiles() {
  const data = await fetchFileData();
  fileList = data.filter(isValidFile).map(normalizeFile);
  buildExtensionIndex();
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

// Mengembalikan file dengan ekstensi tertentu lewat indeks.
// extensions: array ekstensi huruf kecil, contoh ['jpg', 'png'].
function getFilesByExtension(extensions) {
  return extensions.flatMap((extension) => extensionIndex.get(extension) || []);
}

// Membuat satu simpul folder untuk pohon direktori
function createFolderNode(name, path) {
  return { name, path, fileCount: 0, totalCount: 0, children: [] };
}

// Mengurutkan anak folder berdasarkan nama, secara rekursif
function sortFolderTree(node) {
  node.children.sort((a, b) => a.name.localeCompare(b.name, 'id', { sensitivity: 'base' }));
  node.children.forEach(sortFolderTree);
}

// Membangun pohon folder dari path semua file.
// Setiap simpul: { name, path, fileCount (langsung di folder itu),
// totalCount (termasuk subfolder), children }.
// includeHidden = false menyembunyikan file hidden dari hitungan.
function getFolderTree(includeHidden = false) {
  const files = includeHidden ? fileList : fileList.filter((file) => !file.hidden);
  const drive = files.length > 0 ? getDirectory(files[0]).split(PATH_SEPARATOR)[0] : 'D:';
  const root = createFolderNode(drive, drive + PATH_SEPARATOR);

  files.forEach((file) => {
    const folders = getDirectory(file).split(PATH_SEPARATOR).slice(1).filter((name) => name !== '');
    let node = root;
    node.totalCount += 1;
    folders.forEach((name) => {
      let child = node.children.find((item) => item.name.toLowerCase() === name.toLowerCase());
      if (!child) {
        const childPath = node === root ? root.path + name : node.path + PATH_SEPARATOR + name;
        child = createFolderNode(name, childPath);
        node.children.push(child);
      }
      child.totalCount += 1;
      node = child;
    });
    node.fileCount += 1;
  });

  sortFolderTree(root);
  return root;
}