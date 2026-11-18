// Visualisasi algoritma pencarian: linear search vs indexing ekstensi.
// Memakai fungsi dari search.js dan fileSystem.js; hanya menyentuh DOM milik halaman "Visualisasi".

const VZ_EXTENSIONS = [['all', 'Semua'], ['pdf', 'PDF'], ['docx', 'DOCX'], ['jpg', 'JPG'], ['png', 'PNG'], ['mp4', 'MP4']];

const VZ_CODE = {
  linear: 'untuk setiap file di daftar:          // O(n)\n    jika nama cocok DAN ekstensi cocok:\n        tambahkan ke hasil',
  index: 'kandidat = indeks[ekstensi]            // O(1), langsung lompat\nuntuk setiap file di kandidat:      // O(k), k <= n\n    jika nama cocok:\n        tambahkan ke hasil'
};

const vz = { algo: 'linear', steps: [], files: [], cells: [], pos: 0, now: -1, checked: 0, hits: 0, timer: null, bound: false };

function vzEl(id) {
  return document.getElementById(id);
}

// Menyusun daftar langkah (tanpa menyentuh tampilan) agar mudah diuji
function vzBuildSteps(files, query, ext, algo) {
  const steps = [];
  const useIndex = algo === 'index' && ext !== 'all';
  const q = normalizeQuery(query);
  let pool = files;

  if (useIndex) {
    const bucket = new Set(getFilesByExtension([ext]).filter((file) => files.includes(file)));
    pool = files.filter((file) => bucket.has(file));
    steps.push({
      type: 'lookup',
      bucket,
      text: 'Membuka indeks ekstensi ".' + ext + '": langsung ditemukan ' + pool.length + ' kandidat. ' +
        (files.length - pool.length) + ' file lain dilewati tanpa diperiksa.'
    });
  }

  pool.forEach((file, i) => {
    const nameOk = matchName(file, query);
    const extOk = useIndex ? true : matchExtension(file, ext);
    const hit = nameOk && extOk;
    const label = file.name + '.' + file.extension;
    const nameText = q === '' ? 'nama: query kosong (cocok)' : 'nama cocok "' + q + '"? ' + (nameOk ? 'Ya' : 'Tidak');
    const extText = useIndex ? '' : '; ekstensi ' + (ext === 'all' ? 'tidak difilter' : '.' + ext + '? ' + (extOk ? 'Ya' : 'Tidak'));
    steps.push({
      type: 'check',
      file,
      hit,
      text: '[' + (i + 1) + '/' + pool.length + '] Memeriksa ' + label + ' - ' + nameText + extText + ' → ' + (hit ? 'MASUK hasil' : 'dilewati')
    });
  });
  return steps;
}

function vzPaint() {
  const marks = { hit: '✓', miss: '✗', skip: '–', cand: '•', idle: '' };
  vz.cells.forEach((cell, i) => {
    cell.el.className = 'vz-cell is-' + cell.state + (i === vz.now ? ' is-now' : '');
    cell.mark.textContent = i === vz.now ? '▶' : marks[cell.state];
  });
}

function vzLog(text) {
  vzEl('vz-log').textContent = text;
}

function vzStats() {
  const skipped = vz.cells.filter((c) => c.state === 'skip').length;
  vzEl('vz-checked').textContent = vz.checked + ' / ' + vz.files.length;
  vzEl('vz-hits').textContent = String(vz.hits);
  vzEl('vz-skipped').textContent = String(skipped);
}

function vzCompare() {
  const ext = vzEl('vz-ext').value;
  const total = vz.files.length;
  if (ext === 'all') {
    vzEl('vz-compare').textContent = 'Tanpa filter ekstensi, indeks tidak bisa dipakai: kedua metode memeriksa ' + total + ' file.';
    return;
  }
  const k = getFilesByExtension([ext]).filter((file) => vz.files.includes(file)).length;
  const saved = total === 0 ? 0 : Math.round((1 - k / total) * 100);
  vzEl('vz-compare').textContent = 'Jumlah file yang harus diperiksa — Linear: ' + total + ' · Indeks: ' + k + ' (hemat ' + saved + '%).';
}

function vzSetPlaying(playing) {
  vzEl('vz-play').textContent = playing ? 'Jeda' : 'Mulai';
}

function vzStop() {
  if (vz.timer) {
    clearInterval(vz.timer);
    vz.timer = null;
  }
  vzSetPlaying(false);
}

// Menjalankan satu langkah; mengembalikan false bila sudah selesai
function vzNext() {
  if (vz.pos >= vz.steps.length) {
    vzStop();
    return false;
  }
  const step = vz.steps[vz.pos++];
  if (step.type === 'lookup') {
    vz.cells.forEach((cell) => { cell.state = step.bucket.has(cell.file) ? 'cand' : 'skip'; });
    vz.now = -1;
  } else {
    const i = vz.files.indexOf(step.file);
    vz.cells[i].state = step.hit ? 'hit' : 'miss';
    vz.now = i;
    vz.checked += 1;
    if (step.hit) vz.hits += 1;
  }
  vzPaint();
  vzStats();
  vzLog(step.text);
  if (vz.pos >= vz.steps.length) {
    vzStop();
    vzLog('Selesai: ' + vz.hits + ' file ditemukan setelah memeriksa ' + vz.checked + ' dari ' + vz.files.length + ' file.');
  }
  return true;
}

function vzReset() {
  vzStop();
  vz.files = visibleFiles();
  vz.steps = vzBuildSteps(vz.files, vzEl('vz-query').value, vzEl('vz-ext').value, vz.algo);
  vz.pos = 0;
  vz.now = -1;
  vz.checked = 0;
  vz.hits = 0;

  const grid = vzEl('vz-grid');
  grid.textContent = '';
  vz.cells = vz.files.map((file) => {
    const el = document.createElement('div');
    const name = document.createElement('span');
    const mark = document.createElement('span');
    name.className = 'vz-name';
    name.textContent = file.name + '.' + file.extension;
    mark.className = 'vz-mark';
    mark.setAttribute('aria-hidden', 'true');
    el.append(iconNode(file.extension, 'ico'), name, mark);
    grid.appendChild(el);
    return { file, state: 'idle', el, mark };
  });

  vzEl('vz-code').textContent = VZ_CODE[vz.algo];
  vzPaint();
  vzStats();
  vzCompare();
  vzLog('Tekan "Mulai" untuk menjalankan otomatis, atau "Langkah" untuk maju satu per satu.');
}

function vzPlay() {
  if (vz.timer) {
    vzStop();
    return;
  }
  if (vz.pos >= vz.steps.length) vzReset();
  vzSetPlaying(true);
  const delay = 1100 - Number(vzEl('vz-speed').value) * 100;
  vz.timer = setInterval(() => {
    if (state.view !== 'visual') vzStop();
    else vzNext();
  }, delay);
}

function vzBind() {
  const select = vzEl('vz-ext');
  VZ_EXTENSIONS.forEach(([value, label]) => select.add(new Option(label, value)));
  select.value = 'pdf';
  vzEl('vz-query').addEventListener('input', vzReset);
  select.addEventListener('change', vzReset);
  ['linear', 'index'].forEach((algo) => {
    vzEl('vz-algo-' + algo).addEventListener('click', () => {
      vz.algo = algo;
      vzEl('vz-algo-linear').setAttribute('aria-pressed', String(algo === 'linear'));
      vzEl('vz-algo-index').setAttribute('aria-pressed', String(algo === 'index'));
      vzReset();
    });
  });
  vzEl('vz-play').addEventListener('click', vzPlay);
  vzEl('vz-step').addEventListener('click', () => { vzStop(); vzNext(); });
  vzEl('vz-reset').addEventListener('click', vzReset);
  vzEl('vz-speed').addEventListener('input', () => { if (vz.timer) { vzStop(); vzPlay(); } });
}

// Dipanggil showView('visual') di app.js
function renderVisual() {
  if (!vz.bound) {
    vzBind();
    vz.bound = true;
  }
  vzReset();
}
