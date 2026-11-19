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
  location: '',             // kosong = semua folder; contoh: 'D:\\Dokumen'
  minSize: null,            // ukuran minimum dalam byte (null = tanpa batas)
  maxSize: null,            // ukuran maksimum dalam byte (null = tanpa batas)
  dateFrom: '',             // tanggal modifikasi dari, format 'YYYY-MM-DD' (kosong = tanpa batas)
  dateTo: ''                // tanggal modifikasi sampai (termasuk hari itu), format 'YYYY-MM-DD'
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

// Memecah query menjadi daftar kata pencarian (kosong bila query kosong)
function getQueryWords(query, ignoreCase = true) {
  const normalized = normalizeQuery(query);
  if (normalized === '') {
    return [];
  }
  return toSearchText(normalized, ignoreCase)
    .split(' ')
    .filter((word) => word !== '');
}

// Mencocokkan nama file (kecocokan sebagian).
// Query dipecah per kata; semua kata harus ada pada nama (urutan bebas).
// Query kosong cocok dengan semua file.
function matchName(file, query, ignoreCase = true) {
  const words = getQueryWords(query, ignoreCase);
  if (words.length === 0) {
    return true;
  }
  const name = toSearchText(file.name, ignoreCase);
  return words.every((word) => name.includes(word));
}

// Menyeragamkan filter ekstensi menjadi array huruf kecil tanpa titik.
// Mengembalikan [] bila filter berarti "semua" ('all' / kosong).
function normalizeExtensions(extension) {
  const wanted = (Array.isArray(extension) ? extension : [extension])
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim().toLowerCase().replace(/^\./, ''))
    .filter((item) => item !== '');

  return wanted.includes(EXTENSION_ALL) ? [] : [...new Set(wanted)];
}

// Mencocokkan ekstensi file.
// extension: 'all' / kosong = semua, 'pdf', atau array seperti ['jpg', 'png'].
function matchExtension(file, extension) {
  const wanted = normalizeExtensions(extension);
  return wanted.length === 0 || wanted.includes(file.extension);
}

// Mencocokkan ukuran file (byte). Batas yang bukan angka diabaikan; batas bersifat inklusif.
function matchSize(file, minSize, maxSize) {
  if (Number.isFinite(minSize) && file.size < minSize) {
    return false;
  }
  if (Number.isFinite(maxSize) && file.size > maxSize) {
    return false;
  }
  return true;
}

// Mengubah teks 'YYYY-MM-DD' menjadi waktu (ms) lokal; tidak valid -> null.
// endOfDay = true memberi akhir hari agar tanggal "sampai" ikut tercakup.
function parseDateInput(text, endOfDay) {
  if (typeof text !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return null;
  }
  const time = Date.parse(text + (endOfDay ? 'T23:59:59.999' : 'T00:00:00'));
  return Number.isNaN(time) ? null : time;
}

// Membuat rentang waktu dari dua tanggal. Bila terbalik (dari > sampai), keduanya ditukar.
function buildDateRange(dateFrom, dateTo) {
  let from = parseDateInput(dateFrom, false);
  let to = parseDateInput(dateTo, true);
  if (from !== null && to !== null && from > to) {
    from = parseDateInput(dateTo, false);
    to = parseDateInput(dateFrom, true);
  }
  return { from, to };
}

// Mencocokkan tanggal modifikasi file dengan rentang dari buildDateRange()
function matchDate(file, range) {
  const time = Date.parse(file.modifiedAt);
  if (range.from !== null && time < range.from) {
    return false;
  }
  if (range.to !== null && time > range.to) {
    return false;
  }
  return true;
}

// Memilih sumber kandidat: folder, indeks nama, indeks ekstensi, atau semua file (linear).
// Mengembalikan { files, method }; file tersembunyi sudah disaring bila perlu.
// Indeks nama hanya dipakai saat huruf besar/kecil diabaikan (indeks disimpan huruf kecil).
function getCandidateFiles(options, extension, words) {
  const wanted = normalizeExtensions(extension);
  let files;
  let method;
  if (options.location) {
    files = getFilesByDirectory(options.location, options.includeSubfolders);
    method = 'Folder';
  } else if (words.length > 0 && options.ignoreCase) {
    files = getFilesByNameWords(words);
    method = 'Indeks nama';
  } else if (wanted.length > 0) {
    files = getFilesByExtension(wanted);
    method = 'Indeks ekstensi';
  } else {
    files = getAllFiles();
    method = 'Linear';
  }
  return { files: options.showHidden ? files : files.filter((file) => !file.hidden), method };
}

// Waktu sekarang dalam ms (tanpa DOM)
function nowMs() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

// Pencarian dengan statistik: { files, stats: { method, examined, total, matched, elapsedMs } }
function searchFilesWithStats(query, extension = EXTENSION_ALL, options = {}) {
  const started = nowMs();
  const settings = { ...DEFAULT_SEARCH_OPTIONS, ...options };
  const dateRange = buildDateRange(settings.dateFrom, settings.dateTo);
  const words = getQueryWords(query, settings.ignoreCase);
  const candidates = getCandidateFiles(settings, extension, words);

  const files = candidates.files.filter(
    (file) =>
      matchName(file, query, settings.ignoreCase) &&
      matchExtension(file, extension) &&
      matchSize(file, settings.minSize, settings.maxSize) &&
      matchDate(file, dateRange)
  );

  return {
    files,
    stats: {
      method: candidates.method,
      examined: candidates.files.length,
      total: countFiles(settings.showHidden),
      matched: files.length,
      elapsedMs: nowMs() - started
    }
  };
}

// Fungsi utama pencarian: hanya mengembalikan daftar file
function searchFiles(query, extension = EXTENSION_ALL, options = {}) {
  return searchFilesWithStats(query, extension, options).files;
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