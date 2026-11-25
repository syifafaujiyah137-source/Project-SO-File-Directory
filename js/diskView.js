// diskView.js
// Tampilan halaman "Disk": peta blok, statistik, detail alokasi, dan log operasi.
// Logika alokasi ada di disk.js; di sini hanya menggambar dan menangani event halaman ini.
// Memakai helper dari app.js: $, make, formatSize, openCreateDialog, openDeleteDialog.

const DK_CHAIN_LIMIT = 10; // jumlah blok maksimal yang ditulis pada rantai/isi index

const dk = { selectedId: null, bound: false };

// Nomor blok -> teks "#n"
function dkNum(n) {
  return '#' + n;
}

function dkFileMap() {
  return new Map(getAllFiles().map((f) => [f.id, f]));
}

function dkName(file, fallback) {
  return file ? file.name + '.' + file.extension : fallback;
}

// Memotong daftar panjang: tampilkan awal saja lalu "… (+n lagi)"
function dkShort(list, join) {
  const shown = list.slice(0, DK_CHAIN_LIMIT).map(dkNum).join(join);
  return list.length > DK_CHAIN_LIMIT ? shown + join + '… (+' + (list.length - DK_CHAIN_LIMIT) + ' lagi)' : shown;
}

function dkRenderMethods() {
  const box = $('dk-methods');
  box.replaceChildren();
  Object.entries(ALLOC_METHODS).forEach(([key, info]) => {
    const chip = make('button', 'chip', info.label);
    chip.type = 'button';
    chip.setAttribute('aria-pressed', String(key === getAllocMethod()));
    chip.addEventListener('click', () => {
      if (key === getAllocMethod()) return;
      setAllocationMethod(key, getAllFiles());
      showToast('Metode ' + info.label + ': disk diformat ulang dan semua file dialokasikan ulang');
      dkRender();
    });
    box.append(chip);
  });
  $('dk-desc').textContent = ALLOC_METHODS[getAllocMethod()].description;
}

function dkRenderStats() {
  const s = getDiskStats();
  const box = $('dk-stats');
  box.replaceChildren();
  [
    ['Blok terpakai', s.used + ' / ' + s.total],
    ['Blok kosong', String(s.free)],
    ['Lubang kosong', s.holes + ' (terbesar ' + s.largestHole + ' blok)'],
    ['Fragmentasi eksternal', s.externalFragPercent + '%'],
    ['Pemborosan internal', formatSize(s.internalWaste)]
  ].forEach(([label, value]) => {
    const card = make('div', 'stat');
    card.append(make('small', '', label), make('b', '', value));
    box.append(card);
  });
}

function dkRenderGrid() {
  const grid = $('dk-grid');
  grid.replaceChildren();
  const files = dkFileMap();
  getBlockMap().forEach((block, i) => {
    const cell = make('button', 'dk-block', String(i));
    cell.type = 'button';
    if (!block) {
      cell.classList.add('is-free');
      cell.disabled = true;
      cell.title = 'Blok #' + i + ': kosong';
      cell.setAttribute('aria-label', 'Blok ' + i + ' kosong');
    } else {
      const file = files.get(block.fileId);
      cell.classList.add(block.kind === 'index' ? 'is-index' : 'ext-' + (file ? file.extension : 'pdf'));
      if (dk.selectedId !== null) {
        cell.classList.add(block.fileId === dk.selectedId ? 'is-sel' : 'is-dim');
      }
      const role = block.kind === 'index' ? 'index block' : 'data';
      cell.title = 'Blok #' + i + ': ' + dkName(file, 'file') + ' (' + role + ')';
      cell.setAttribute('aria-label', cell.title);
      cell.addEventListener('click', () => dkSelect(block.fileId));
    }
    grid.append(cell);
  });
}

// Baris "label: nilai" pada panel detail
function dkInfoRow(dl, label, value) {
  dl.append(make('dt', '', label), make('dd', '', value));
}

function dkRenderInfo() {
  const box = $('dk-info');
  box.replaceChildren();
  const alloc = dk.selectedId === null ? null : getAllocation(dk.selectedId);
  if (!alloc) {
    box.append(make('p', 'detail-empty', 'Klik sebuah blok atau file untuk melihat detail alokasinya.'));
    return;
  }
  const file = dkFileMap().get(alloc.fileId);
  const method = getAllocMethod();
  const dl = make('dl');
  dkInfoRow(dl, 'Nama', dkName(file, alloc.label));
  dkInfoRow(dl, 'Ukuran', formatSize(alloc.size) + ' → ' + alloc.blocks.length + ' blok data (@ ' + formatSize(DISK_BLOCK_SIZE) + ')');
  if (method === 'contiguous') {
    dkInfoRow(dl, 'Entri direktori', 'start = ' + dkNum(alloc.blocks[0]) + ', length = ' + alloc.blocks.length);
    dkInfoRow(dl, 'Blok', formatBlockRanges(alloc.blocks));
  } else if (method === 'linked') {
    dkInfoRow(dl, 'Entri direktori', 'start = ' + dkNum(alloc.blocks[0]) + ', end = ' + dkNum(alloc.blocks[alloc.blocks.length - 1]));
    dkInfoRow(dl, 'Rantai pointer', dkShort(alloc.blocks, ' → ') + ' → NULL');
  } else {
    dkInfoRow(dl, 'Entri direktori', 'index block = ' + dkNum(alloc.indexBlock));
    dkInfoRow(dl, 'Isi index block', '[' + dkShort(alloc.blocks, ', ') + ']');
  }
  dkInfoRow(dl, 'Pemborosan internal', formatSize(alloc.blocks.length * DISK_BLOCK_SIZE - alloc.size));
  box.append(dl);
}

function dkRenderFiles() {
  const box = $('dk-files');
  box.replaceChildren();
  [...getAllFiles()].sort((a, b) => a.id - b.id).forEach((file) => {
    const alloc = getAllocation(file.id);
    const btn = make('button', 'dk-file');
    btn.type = 'button';
    btn.setAttribute('aria-pressed', String(file.id === dk.selectedId));
    btn.append(iconNode(file.extension), make('span', 'dk-file-name', file.name + '.' + file.extension),
      make('span', 'dk-file-count', alloc ? alloc.blocks.length + ' blok' : '-'));
    btn.addEventListener('click', () => dkSelect(file.id));
    box.append(btn);
  });
}

function dkRenderLog() {
  const list = $('dk-log');
  list.replaceChildren();
  getDiskEvents().forEach((text) => list.append(make('li', '', text)));
}

function dkSelect(fileId) {
  dk.selectedId = dk.selectedId === fileId ? null : fileId;
  dkRender();
}

function dkRender() {
  if (dk.selectedId !== null && !getAllocation(dk.selectedId)) dk.selectedId = null;
  dkRenderMethods();
  dkRenderStats();
  dkRenderGrid();
  dkRenderInfo();
  dkRenderFiles();
  dkRenderLog();
  $('dk-delete').disabled = dk.selectedId === null;
}

function dkBind() {
  $('dk-new').addEventListener('click', openCreateDialog);
  $('dk-delete').addEventListener('click', () => {
    const file = dkFileMap().get(dk.selectedId);
    if (file) openDeleteDialog(file);
  });
  $('dk-defrag').addEventListener('click', () => {
    const result = defragmentDisk();
    showToast('Defragmentasi selesai: ' + result.moved + ' file dipindahkan');
    dkRender();
  });
}

// Dipanggil showView('disk') dan refreshView() di app.js
function renderDisk() {
  if (!dk.bound) {
    dkBind();
    dk.bound = true;
  }
  dkRender();
}