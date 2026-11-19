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

// Indeks nama (inverted index): kata pada nama file (huruf kecil) -> daftar file
let nameIndex = new Map();

// Jumlah file hidden, dihitung saat indeks dibangun (agar total tidak perlu dihitung ulang)
let hiddenCount = 0;

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

// Memecah nama file menjadi kata unik huruf kecil; '_' dan '-' dianggap spasi.
// Aturan ini harus sama dengan toSearchText() di search.js.
function tokenizeName(name) {
  const words = String(name).replace(/[_-]+/g, ' ').toLowerCase().split(/\s+/);
  return [...new Set(words.filter((word) => word !== ''))];
}

// Membangun indeks nama sekali saja: setiap kata menunjuk ke file yang memuatnya
function buildNameIndex() {
  nameIndex = new Map();
  fileList.forEach((file) => {
    tokenizeName(file.name).forEach((word) => {
      if (!nameIndex.has(word)) {
        nameIndex.set(word, []);
      }
      nameIndex.get(word).push(file);
    });
  });
}

// Membangun ulang semua indeks; wajib dipanggil setiap data file berubah
function rebuildIndexes() {
  buildExtensionIndex();
  buildNameIndex();
  hiddenCount = fileList.filter((file) => file.hidden).length;
}

// Memuat data file simulasi ke dalam fileList lalu membangun indeksnya
async function loadFiles() {
  const data = await fetchFileData();
  fileList = data.filter(isValidFile).map(normalizeFile);
  rebuildIndexes();
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

// Mengembalikan file yang namanya memuat SEMUA kata (kecocokan sebagian, huruf kecil).
// Hanya memindai kosakata indeks, bukan seluruh file, sehingga hasilnya sama
// dengan pencocokan linear. words tidak boleh kosong.
function getFilesByNameWords(words) {
  let result = null;
  words.forEach((word) => {
    const matches = new Set();
    nameIndex.forEach((files, token) => {
      if (token.includes(word)) {
        files.forEach((file) => matches.add(file));
      }
    });
    result = result === null ? matches : new Set([...result].filter((file) => matches.has(file)));
  });
  return result === null ? [] : [...result];
}

// Jumlah file; includeHidden = false tidak menghitung file tersembunyi
function countFiles(includeHidden = true) {
  return includeHidden ? fileList.length : fileList.length - hiddenCount;
}

// Daftar path semua folder (termasuk root), urut seperti pohon folder
function getFolderPaths() {
  const paths = [];
  const walk = (node) => {
    paths.push(node.path);
    node.children.forEach(walk);
  };
  walk(getFolderTree(true));
  return paths;
}

/* ---------- Operasi file (hanya di memori; files.json tidak berubah) ---------- */

const INVALID_NAME_CHARS = /[\\/:*?"<>|]/;
const MAX_NAME_LENGTH = 100;

// Waktu lokal saat ini dalam format ISO 8601 tanpa zona, sama dengan data simulasi
function nowIso() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

// Memeriksa nama file (tanpa ekstensi); mengembalikan pesan galat atau '' bila valid
function validateFileName(name) {
  if (name === '') {
    return 'Nama file tidak boleh kosong.';
  }
  if (INVALID_NAME_CHARS.test(name)) {
    return 'Nama file tidak boleh mengandung karakter \\ / : * ? " < > |';
  }
  if (name.length > MAX_NAME_LENGTH) {
    return `Nama file terlalu panjang (maksimal ${MAX_NAME_LENGTH} karakter).`;
  }
  if (name.endsWith('.')) {
    return 'Nama file tidak boleh diakhiri titik.';
  }
  return '';
}

// Mencari path folder yang ada (tanpa beda huruf besar/kecil); null bila tidak ada
function findFolderPath(directory) {
  const target = String(directory).replace(/[\\/]+$/, '').toLowerCase();
  return getFolderPaths().find((path) => path.replace(/[\\/]+$/, '').toLowerCase() === target) || null;
}

// Apakah sudah ada file bernama sama di folder yang sama (kecuali file dengan id tertentu)
function hasDuplicate(directory, name, extension, ignoreId) {
  const dir = directory.toLowerCase();
  return fileList.some((file) =>
    file.id !== ignoreId &&
    getDirectory(file).toLowerCase() === dir &&
    file.name.toLowerCase() === name.toLowerCase() &&
    file.extension === extension
  );
}

// Membuat file baru. Mengembalikan { ok: true, file } atau { ok: false, error }.
function createFile({ name, extension, directory, size = 0 }) {
  const cleanName = String(name === undefined || name === null ? '' : name).trim();
  const ext = String(extension === undefined || extension === null ? '' : extension).trim().toLowerCase().replace(/^\./, '');
  const nameError = validateFileName(cleanName);
  if (nameError) {
    return { ok: false, error: nameError };
  }
  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    return { ok: false, error: `Ekstensi tidak didukung. Pilih: ${SUPPORTED_EXTENSIONS.join(', ')}.` };
  }
  const folder = findFolderPath(directory === undefined || directory === null ? '' : directory);
  if (folder === null) {
    return { ok: false, error: 'Folder tujuan tidak ditemukan.' };
  }
  if (typeof size !== 'number' || !Number.isFinite(size) || size < 0) {
    return { ok: false, error: 'Ukuran harus berupa angka 0 atau lebih.' };
  }
  const dir = folder.replace(/[\\/]+$/, '');
  if (hasDuplicate(dir, cleanName, ext, null)) {
    return { ok: false, error: 'Sudah ada file dengan nama itu di folder yang sama.' };
  }
  const file = {
    id: Math.max(0, ...fileList.map((item) => item.id)) + 1,
    name: cleanName,
    extension: ext,
    size: Math.round(size),
    path: dir + PATH_SEPARATOR + cleanName + '.' + ext,
    modifiedAt: nowIso(),
    hidden: false
  };
  fileList.push(file);
  rebuildIndexes();
  return { ok: true, file };
}

// Mengganti nama file (ekstensi tetap). Mengembalikan { ok, file } atau { ok: false, error }.
function renameFile(id, newName) {
  const file = fileList.find((item) => item.id === id);
  if (!file) {
    return { ok: false, error: 'File tidak ditemukan.' };
  }
  const cleanName = String(newName === undefined || newName === null ? '' : newName).trim();
  const nameError = validateFileName(cleanName);
  if (nameError) {
    return { ok: false, error: nameError };
  }
  const dir = getDirectory(file);
  if (hasDuplicate(dir, cleanName, file.extension, file.id)) {
    return { ok: false, error: 'Sudah ada file dengan nama itu di folder yang sama.' };
  }
  file.name = cleanName;
  file.path = dir + PATH_SEPARATOR + cleanName + '.' + file.extension;
  file.modifiedAt = nowIso();
  rebuildIndexes();
  return { ok: true, file };
}

// Menghapus file dari simulasi. Mengembalikan { ok, file } atau { ok: false, error }.
function deleteFile(id) {
  const position = fileList.findIndex((item) => item.id === id);
  if (position === -1) {
    return { ok: false, error: 'File tidak ditemukan.' };
  }
  const [file] = fileList.splice(position, 1);
  rebuildIndexes();
  return { ok: true, file };
}