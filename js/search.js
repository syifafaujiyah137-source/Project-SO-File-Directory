// search.js
// Lapisan logika: pencarian, filter ekstensi, dan pengurutan.
// Tidak boleh mengakses DOM dari file ini.

const EXTENSION_ALL = 'all';
const SORT_KEYS = ['name', 'size', 'modifiedAt'];

// Opsi pencarian bawaan (sesuai halaman Pengaturan pada desain)
const DEFAULT_SEARCH_OPTIONS = {
  ignoreCase: true,         // abaikan huruf besar/kecil
  includeSubfolders: true,  // cari sampai ke subfolder
  showHidden: false,        // sertakan file tersembunyi
  location: ''              // kosong = semua folder; contoh: 'D:\\Dokumen'
};

// Merapikan query: bukan string -> '', spasi berlebih dihapus
function normalizeQuery(query) {
  if (typeof query !== 'string') {
    return '';
  }
  return query.trim().replace(/\s+/g, ' ');
}

// Menyamakan pemisah nama file: '_' dan '-' dianggap spasi
function toSearchText(text, ignoreCase) {
  const spaced = text.replace(/[_-]+/g, ' ');
  return ignoreCase ? spaced.toLowerCase() : spaced;
}

// Mencocokkan nama file (kecocokan sebagian).
// Query dipecah per kata; semua kata harus ada pada nama (urutan bebas).
// Query kosong cocok dengan semua file.
function matchName(file, query, ignoreCase = true) {
  const normalized = normalizeQuery(query);
  if (normalized === '') {
    return true;
  }
  const name = toSearchText(file.name, ignoreCase);
  return toSearchText(normalized, ignoreCase)
    .split(' ')
    .filter((word) => word !== '')
    .every((word) => name.includes(word));
}

// Mencocokkan ekstensi file.
// extension: 'all' / kosong = semua, 'pdf', atau array seperti ['jpg', 'png'].
function matchExtension(file, extension) {
  const wanted = (Array.isArray(extension) ? extension : [extension])
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim().toLowerCase().replace(/^\./, ''))
    .filter((item) => item !== '');

  if (wanted.length === 0 || wanted.includes(EXTENSION_ALL)) {
    return true;
  }
  return wanted.includes(file.extension);
}

// Menentukan daftar file yang menjadi kandidat berdasarkan lokasi dan file tersembunyi
function getCandidateFiles(options) {
  const files = options.location
    ? getFilesByDirectory(options.location, options.includeSubfolders)
    : getAllFiles();
  return options.showHidden ? files : files.filter((file) => !file.hidden);
}

// Fungsi utama pencarian (linear search, O(n))
function searchFiles(query, extension = EXTENSION_ALL, options = {}) {
  const settings = { ...DEFAULT_SEARCH_OPTIONS, ...options };

  return getCandidateFiles(settings).filter(
    (file) =>
      matchName(file, query, settings.ignoreCase) &&
      matchExtension(file, extension)
  );
}

// Membandingkan dua file berdasarkan key; nama dipakai sebagai pembanding cadangan
function compareFiles(a, b, key) {
  let result = 0;
  if (key === 'size') {
    result = a.size - b.size;
  } else if (key === 'modifiedAt') {
    result = Date.parse(a.modifiedAt) - Date.parse(b.modifiedAt);
  }
  if (result !== 0) {
    return result;
  }
  return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
}

// Mengurutkan hasil berdasarkan key: 'name', 'size', atau 'modifiedAt'.
// order: 'asc' (naik) atau 'desc' (turun). Mengembalikan array baru.
function sortFiles(files, key = 'name', order = 'asc') {
  const sortKey = SORT_KEYS.includes(key) ? key : 'name';
  const direction = order === 'desc' ? -1 : 1;

  return [...files].sort((a, b) => compareFiles(a, b, sortKey) * direction);
}