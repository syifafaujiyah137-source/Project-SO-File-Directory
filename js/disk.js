// disk.js
// Lapisan logika: simulasi alokasi blok disk (contiguous, linked, indexed).
// Tidak boleh mengakses DOM dari file ini.

const DISK_TOTAL_BLOCKS = 256;
const DISK_BLOCK_SIZE = 4 * 1024 * 1024; // 4 MB per blok (diskala agar file video tetap muat)
const DISK_MAX_EVENTS = 8;
const DEFAULT_ALLOC_METHOD = 'contiguous';

const ALLOC_METHODS = {
  contiguous: {
    label: 'Contiguous',
    description: 'File menempati blok yang berurutan. Cepat diakses, tetapi butuh lubang kosong yang cukup besar sehingga rawan external fragmentation.'
  },
  linked: {
    label: 'Linked',
    description: 'Setiap blok menunjuk ke blok berikutnya, sehingga blok boleh tersebar. Tidak ada external fragmentation, tetapi akses acak lambat karena harus menelusuri rantai.'
  },
  indexed: {
    label: 'Indexed',
    description: 'Satu index block menyimpan daftar semua blok data file. Blok boleh tersebar dan akses acak cepat, dengan biaya 1 blok tambahan per file.'
  }
};

let diskMethod = DEFAULT_ALLOC_METHOD;
let diskBlocks = [];          // diskBlocks[i] = null (kosong) atau { fileId, kind: 'data' | 'index' }
let diskAllocations = new Map(); // fileId -> { fileId, label, size, blocks: [], indexBlock: null | number }
let diskEvents = [];          // log operasi, terbaru di depan

/* ---------- Pembantu ---------- */

function addDiskEvent(text) {
  diskEvents.unshift(text);
  diskEvents = diskEvents.slice(0, DISK_MAX_EVENTS);
}

// Jumlah blok data untuk ukuran file (minimal 1 blok, sekecil apa pun file)
function calcDataBlocks(size) {
  return Math.max(1, Math.ceil(size / DISK_BLOCK_SIZE));
}

function fileLabel(file) {
  return file.name + '.' + file.extension;
}

// Mengubah daftar nomor blok menjadi teks ringkas, mis. [3, 8, 9] -> "#3, #8–#9"
function formatBlockRanges(list) {
  const sorted = [...list].sort((a, b) => a - b);
  const parts = [];
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) {
      j += 1;
    }
    parts.push(i === j ? '#' + sorted[i] : '#' + sorted[i] + '–#' + sorted[j]);
    i = j + 1;
  }
  return parts.join(', ');
}

// Daftar lubang kosong: [{ start, length }]
function findFreeRuns() {
  const runs = [];
  let start = -1;
  diskBlocks.forEach((block, i) => {
    if (block === null && start === -1) {
      start = i;
    }
    if (block !== null && start !== -1) {
      runs.push({ start, length: i - start });
      start = -1;
    }
  });
  if (start !== -1) {
    runs.push({ start, length: diskBlocks.length - start });
  }
  return runs;
}

// Semua nomor blok milik satu alokasi (data + index)
function positionsOf(record) {
  return record.indexBlock === null ? [...record.blocks] : [record.indexBlock, ...record.blocks];
}

// Menandai blok pada disk dan menyimpan catatan alokasinya
function commitAllocation(fileId, label, size, blocks, indexBlock) {
  blocks.forEach((n) => { diskBlocks[n] = { fileId, kind: 'data' }; });
  if (indexBlock !== null) {
    diskBlocks[indexBlock] = { fileId, kind: 'index' };
  }
  const record = { fileId, label, size, blocks, indexBlock };
  diskAllocations.set(fileId, record);
  return record;
}

/* ---------- Alokasi ---------- */

// Mengalokasikan blok untuk file. Mengembalikan { ok: true } atau { ok: false, error }.
// silent = true tidak mencatat log (dipakai saat disk diformat ulang).
function allocateFile(file, silent = false) {
  if (diskAllocations.has(file.id)) {
    return { ok: true };
  }
  const need = calcDataBlocks(file.size);
  const label = fileLabel(file);
  const runs = findFreeRuns();
  const free = runs.reduce((sum, run) => sum + run.length, 0);
  const largest = runs.reduce((max, run) => Math.max(max, run.length), 0);

  if (diskMethod === 'contiguous') {
    const run = runs.find((item) => item.length >= need); // first-fit
    if (!run) {
      const error = free >= need
        ? 'Ruang kosong total ' + free + ' blok, tetapi tidak berurutan: lubang terbesar hanya ' + largest +
          ' blok, padahal file butuh ' + need + ' blok. Inilah external fragmentation. Coba defragmentasi atau pakai metode Linked/Indexed.'
        : 'Disk penuh: file butuh ' + need + ' blok, sisa hanya ' + free + ' blok.';
      if (!silent) addDiskEvent('GAGAL alokasi ' + label + ': ' + need + ' blok berurutan tidak tersedia');
      return { ok: false, error };
    }
    const blocks = Array.from({ length: need }, (_, i) => run.start + i);
    commitAllocation(file.id, label, file.size, blocks, null);
    if (!silent) addDiskEvent('Alokasi ' + label + ' (first-fit): ' + need + ' blok → ' + formatBlockRanges(blocks));
    return { ok: true };
  }

  const extra = diskMethod === 'indexed' ? 1 : 0;
  if (free < need + extra) {
    if (!silent) addDiskEvent('GAGAL alokasi ' + label + ': disk penuh');
    return { ok: false, error: 'Disk penuh: file butuh ' + (need + extra) + ' blok, sisa hanya ' + free + ' blok.' };
  }
  const picked = [];
  diskBlocks.forEach((block, i) => {
    if (block === null && picked.length < need + extra) {
      picked.push(i);
    }
  });
  const indexBlock = extra ? picked[0] : null;
  const blocks = extra ? picked.slice(1) : picked;
  commitAllocation(file.id, label, file.size, blocks, indexBlock);
  if (!silent) {
    const where = formatBlockRanges(blocks);
    addDiskEvent(diskMethod === 'indexed'
      ? 'Alokasi ' + label + ': index block #' + indexBlock + ' + ' + need + ' blok data → ' + where
      : 'Alokasi ' + label + ': ' + need + ' blok berantai → ' + where);
  }
  return { ok: true };
}

// Membebaskan semua blok milik file (dipanggil saat file dihapus)
function freeFile(fileId) {
  const record = diskAllocations.get(fileId);
  if (!record) {
    return { ok: false, error: 'File tidak punya alokasi.' };
  }
  positionsOf(record).forEach((n) => { diskBlocks[n] = null; });
  diskAllocations.delete(fileId);
  addDiskEvent('Hapus ' + record.label + ': membebaskan ' + positionsOf(record).length + ' blok');
  return { ok: true };
}

// Memformat ulang disk lalu mengalokasikan semua file (urut id) dengan metode yang aktif
function initDisk(files, method = diskMethod) {
  diskMethod = ALLOC_METHODS[method] ? method : DEFAULT_ALLOC_METHOD;
  diskBlocks = new Array(DISK_TOTAL_BLOCKS).fill(null);
  diskAllocations = new Map();
  diskEvents = [];
  [...files].sort((a, b) => a.id - b.id).forEach((file) => allocateFile(file, true));
  addDiskEvent('Disk diformat ulang, metode ' + ALLOC_METHODS[diskMethod].label + ': ' + diskAllocations.size + ' file dialokasikan');
}

function setAllocationMethod(method, files) {
  if (!ALLOC_METHODS[method]) {
    return { ok: false, error: 'Metode tidak dikenal.' };
  }
  initDisk(files, method);
  return { ok: true };
}

// Defragmentasi: semua file dipadatkan berurutan dari blok 0 (urutan posisi lama dipertahankan)
function defragmentDisk() {
  const records = [...diskAllocations.values()].sort((a, b) => Math.min(...positionsOf(a)) - Math.min(...positionsOf(b)));
  const before = new Map(records.map((r) => [r.fileId, positionsOf(r).join(',')]));
  diskBlocks = new Array(DISK_TOTAL_BLOCKS).fill(null);
  diskAllocations = new Map();
  let cursor = 0;
  let moved = 0;
  records.forEach((r) => {
    const indexBlock = r.indexBlock === null ? null : cursor;
    const start = cursor + (indexBlock === null ? 0 : 1);
    const blocks = Array.from({ length: r.blocks.length }, (_, i) => start + i);
    const record = commitAllocation(r.fileId, r.label, r.size, blocks, indexBlock);
    cursor = start + blocks.length;
    if (positionsOf(record).join(',') !== before.get(r.fileId)) {
      moved += 1;
    }
  });
  addDiskEvent('Defragmentasi: ' + moved + ' file dipindahkan, semua blok kosong menyatu di ujung disk');
  return { ok: true, moved };
}

/* ---------- Pembacaan data ---------- */

function getAllocMethod() {
  return diskMethod;
}

function getBlockMap() {
  return diskBlocks.map((block) => (block ? { ...block } : null));
}

function getAllocation(fileId) {
  const record = diskAllocations.get(fileId);
  return record ? { ...record, blocks: [...record.blocks] } : null;
}

function getDiskEvents() {
  return [...diskEvents];
}

// Ringkasan lokasi blok untuk panel detail file, mis. "#12–#14 (3 blok)"
function describeAllocation(fileId) {
  const record = diskAllocations.get(fileId);
  if (!record) {
    return '-';
  }
  const text = formatBlockRanges(record.blocks) + ' (' + record.blocks.length + ' blok)';
  return record.indexBlock === null ? text : text + ' + index #' + record.indexBlock;
}

function getDiskStats() {
  const runs = findFreeRuns();
  const free = runs.reduce((sum, run) => sum + run.length, 0);
  const largest = runs.reduce((max, run) => Math.max(max, run.length), 0);
  let indexBlocks = 0;
  let internalWaste = 0;
  diskAllocations.forEach((r) => {
    indexBlocks += r.indexBlock === null ? 0 : 1;
    internalWaste += r.blocks.length * DISK_BLOCK_SIZE - r.size;
  });
  return {
    method: diskMethod,
    total: diskBlocks.length,
    free,
    used: diskBlocks.length - free,
    indexBlocks,
    holes: runs.length,
    largestHole: largest,
    externalFragPercent: free === 0 ? 0 : Math.round((1 - largest / free) * 100),
    internalWaste
  };
}