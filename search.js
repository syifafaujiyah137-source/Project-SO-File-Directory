// search.js
// Lapisan logika: pencarian, filter ekstensi, dan pengurutan.
// Tidak boleh mengakses DOM dari file ini.

// Mencocokkan nama file (case-insensitive, kecocokan sebagian)
function matchName(file, query) {
  // TODO (Fase 4): tangani spasi berlebih dan query kosong
  return file.name.toLowerCase().includes(query.toLowerCase());
}

// Mencocokkan ekstensi file; 'all' berarti semua ekstensi
function matchExtension(file, extension) {
  // TODO (Fase 4)
  return extension === 'all' || file.extension === extension.toLowerCase();
}

// Fungsi utama pencarian (linear search, O(n))
function searchFiles(query, extension) {
  // TODO (Fase 4): lengkapi penanganan kasus khusus
  return getAllFiles().filter(
    (file) => matchName(file, query) && matchExtension(file, extension)
  );
}

// Mengurutkan hasil berdasarkan key: 'name', 'size', atau 'modifiedAt'
function sortFiles(files, key, order = 'asc') {
  // TODO (Fase 4)
  return files;
}
