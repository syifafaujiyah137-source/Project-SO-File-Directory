// app.js — hanya mengurus UI dan event (tanpa logika pencarian).
// Bergantung pada: loadFiles, getAllFiles, getFilesByDirectory, getDirectory (fileSystem.js)
//                  searchFiles, sortFiles (search.js)
//                  initDisk, allocateFile, freeFile, describeAllocation (disk.js)
//                  renderVisual (visualizer.js), renderDisk (diskView.js)

const STORAGE_KEY = 'fileSearchSimulator';
const ROOT_PATH = 'D:\\';
const MAX_HISTORY = 6;
const RECENT_LIMIT = 3;

// Filter sesuai desain: JPG dan PNG digabung dalam satu chip
const FILTERS = [
  { label: 'Semua', value: 'all', icon: null },
  { label: 'PDF', value: 'pdf', icon: 'pdf' },
  { label: 'Docs', value: 'docx', icon: 'docx' },
  { label: 'JPG/PNG', value: ['jpg', 'png'], icon: 'jpg' },
  { label: 'MP4', value: 'mp4', icon: 'mp4' }
];

const SORTS = [
  { label: 'Urutkan: Terbaru', key: 'modifiedAt', order: 'desc' },
  { label: 'Urutkan: Terlama', key: 'modifiedAt', order: 'asc' },
  { label: 'Urutkan: Nama A-Z', key: 'name', order: 'asc' },
  { label: 'Urutkan: Nama Z-A', key: 'name', order: 'desc' },
  { label: 'Urutkan: Terbesar', key: 'size', order: 'desc' },
  { label: 'Urutkan: Terkecil', key: 'size', order: 'asc' }
];

// Pilihan ukuran file (byte); batas bersifat inklusif
const MB = 1024 * 1024;
const SIZE_RANGES = [
  { label: 'Semua ukuran', min: null, max: null },
  { label: 'Kecil (< 1 MB)', min: null, max: MB - 1 },
  { label: 'Sedang (1-10 MB)', min: MB, max: 10 * MB },
  { label: 'Besar (> 10 MB)', min: 10 * MB + 1, max: null }
];

// Skala ukuran font; dipakai lewat variabel CSS --fs
const FONT_SIZES = [
  { value: 'small', label: 'Kecil', scale: 0.9 },
  { value: 'normal', label: 'Normal', scale: 1 },
  { value: 'large', label: 'Besar', scale: 1.15 },
  { value: 'xlarge', label: 'Sangat besar', scale: 1.3 }
];

const TYPE_LABELS = { pdf: 'PDF', docx: 'Docs', jpg: 'JPG', png: 'PNG', mp4: 'MP4' };

// Ikon statis (aman untuk innerHTML karena bukan data pengguna)
const ICONS = {
  pdf: '<svg viewBox="0 0 24 24"><path d="M5 20c3-2 5-6 6-11 .6-3-1.5-3-1.5-1 0 4 4 8 9 9 2 .3 2.5-1.5 0-1.8-4-.5-9 .5-13.5 4.8z" style="fill:none;stroke:#e8383d;stroke-width:1.8;stroke-linejoin:round"/></svg>',
  docx: '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2.5" fill="#4a9cf5"/><path d="M8.5 9h7M8.5 12.5h7M8.5 16h4" style="stroke:#fff;stroke-width:1.6;stroke-linecap:round"/></svg>',
  jpg: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3" fill="#f58a1f"/><path d="M5 18l5-6 3 3.5 2-2.5 4 5z" fill="#fff"/><circle cx="16.5" cy="9" r="1.6" fill="#fff"/></svg>',
  mp4: '<svg viewBox="0 0 24 24"><path d="M4 9V6a2 2 0 0 1 2-2h3M15 4h3a2 2 0 0 1 2 2v3M20 15v3a2 2 0 0 1-2 2h-3M9 20H6a2 2 0 0 1-2-2v-3" style="fill:none;stroke:#b455c4;stroke-width:1.8;stroke-linecap:round"/><path d="M10 9.5v5l4.5-2.5z" fill="#b455c4"/></svg>',
  folder: '<svg viewBox="0 0 24 24"><path d="M3 6h7l2 2h9v11H3z"/></svg>'
};
ICONS.png = ICONS.jpg;

const state = {
  view: 'home',
  query: '',
  filterIndex: 0,
  sortIndex: 0,
  selectedId: null,
  stats: null,                   // statistik pencarian terakhir
  advanced: { sizeIndex: 0, dateFrom: '', dateTo: '' }, // filter per pencarian, tidak disimpan
  folder: ROOT_PATH,
  filesView: 'cards',            // 'cards' atau 'tree' (tidak disimpan)
  expanded: new Set([ROOT_PATH.toLowerCase()]), // folder yang terbuka pada pohon
  settings: { ignoreCase: true, includeSubfolders: true, showHidden: false, location: '' },
  appearance: { darkMode: true, fontSize: 'normal' },
  history: [],
  openedIds: [],
  searchCount: { date: '', count: 0 }
};

let recordTimer = null;
let toastTimer = null;

/* ---------- Penyimpanan (localStorage, opsional) ---------- */

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    Object.assign(state.settings, saved.settings);
    if (Array.isArray(saved.history)) state.history = saved.history;
    if (Array.isArray(saved.openedIds)) state.openedIds = saved.openedIds;
    if (saved.searchCount) state.searchCount = saved.searchCount;
    Object.assign(state.appearance, saved.appearance);
  } catch (e) {
    // localStorage tidak tersedia atau data rusak: pakai nilai bawaan
  }
}

function saveState() {
  try {
    const { settings, appearance, history, openedIds, searchCount } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings, appearance, history, openedIds, searchCount }));
  } catch (e) {
    // abaikan; aplikasi tetap berjalan tanpa penyimpanan
  }
}

/* ---------- Tampilan (tema dan ukuran font) ---------- */

function applyAppearance() {
  const { darkMode, fontSize } = state.appearance;
  const size = FONT_SIZES.find((f) => f.value === fontSize) || FONT_SIZES[1];
  document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
  document.documentElement.style.setProperty('--fs', String(size.scale));
  const icon = document.getElementById('theme-icon');
  const text = document.getElementById('theme-description');
  if (icon) icon.textContent = darkMode ? '🌙' : '☀️';
  if (text) text.textContent = darkMode ? 'Mode gelap sedang digunakan' : 'Mode terang sedang digunakan';
}

/* ---------- Pemformat ---------- */

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

function formatMs(ms) {
  return (ms < 0.01 ? '<0,01' : ms.toFixed(2).replace('.', ',')) + ' ms';
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatDate(iso, withTime = false) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  const date = pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
  return withTime ? date + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) : date;
}

/* ---------- Helper DOM ---------- */

const $ = (id) => document.getElementById(id);

function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function iconNode(ext, className = 'ico') {
  const wrap = make('span', className);
  wrap.innerHTML = ICONS[ext] || ICONS.pdf;
  return wrap;
}

function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2800);
}

/* ---------- Data turunan (bukan logika pencarian) ---------- */

function visibleFiles(files = getAllFiles()) {
  return state.settings.showHidden ? files : files.filter((f) => !f.hidden);
}

function newestFirst(files) {
  return sortFiles(files, 'modifiedAt', 'desc');
}

// Nama folder tingkat atas pada drive, mis. "Dokumen", "Gambar"
function topFolders() {
  const names = new Set();
  visibleFiles().forEach((f) => {
    const parts = f.path.split('\\');
    if (parts.length > 2) names.add(parts[1]);
  });
  return [...names].sort((a, b) => a.localeCompare(b, 'id'));
}

function searchOptions() {
  const size = SIZE_RANGES[state.advanced.sizeIndex];
  return {
    ...state.settings,
    minSize: size.min,
    maxSize: size.max,
    dateFrom: state.advanced.dateFrom,
    dateTo: state.advanced.dateTo
  };
}

// Jumlah filter lanjutan yang sedang aktif (ukuran, tanggal dari, tanggal sampai)
function advancedCount() {
  const { sizeIndex, dateFrom, dateTo } = state.advanced;
  return (sizeIndex > 0 ? 1 : 0) + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);
}

function resetAdvanced() {
  state.advanced = { sizeIndex: 0, dateFrom: '', dateTo: '' };
}

function currentResults() {
  const filter = FILTERS[state.filterIndex];
  const sort = SORTS[state.sortIndex];
  const found = searchFilesWithStats(state.query, filter.value, searchOptions());
  state.stats = found.stats;
  return sortFiles(found.files, sort.key, sort.order);
}

/* ---------- Riwayat pencarian ---------- */

function today() {
  return new Date().toISOString().slice(0, 10);
}

function recordSearch(query) {
  const q = query.trim();
  if (!q) return;
  state.history = [q, ...state.history.filter((h) => h.toLowerCase() !== q.toLowerCase())].slice(0, MAX_HISTORY);
  if (state.searchCount.date !== today()) state.searchCount = { date: today(), count: 0 };
  state.searchCount.count += 1;
  saveState();
}

function recordSoon(query) {
  clearTimeout(recordTimer);
  recordTimer = setTimeout(() => recordSearch(query), 900);
}

/* ---------- Komponen ---------- */

function fileRow(file, { selected = false, onSelect }) {
  const row = make('button', 'row');
  row.type = 'button';
  row.setAttribute('aria-pressed', String(selected));
  row.append(iconNode(file.extension));
  const info = make('span');
  info.append(make('span', 'row-name', file.name + '.' + file.extension), make('span', 'row-path', getDirectory(file)));
  row.append(info, make('span', 'row-type', TYPE_LABELS[file.extension] || file.extension.toUpperCase()), make('span', 'row-date', formatDate(file.modifiedAt)));
  row.addEventListener('click', () => onSelect(file));
  return row;
}

// Dari halaman selain Cari: buka halaman Cari dengan file terpilih
function goToFile(file) {
  state.query = file.name;
  state.filterIndex = 0;
  state.selectedId = file.id;
  showView('search');
}

function fillList(container, files, emptyText) {
  container.replaceChildren();
  if (!files.length) {
    container.append(make('p', 'empty-note', emptyText));
    return;
  }
  files.forEach((f) => container.append(fileRow(f, { onSelect: goToFile })));
}

/* ---------- Render halaman ---------- */

function renderHome() {
  const files = visibleFiles();
  const types = new Set(files.map((f) => f.extension));
  const count = state.searchCount.date === today() ? state.searchCount.count : 0;
  const stats = $('stats');
  stats.replaceChildren();
  [['Total File', files.length], ['Pencarian Hari Ini', count], ['Jenis File', types.size + ' ekstensi']].forEach(([label, value]) => {
    const card = make('div', 'stat');
    card.append(make('small', '', label), make('b', '', String(value)));
    stats.append(card);
  });

  // File yang pernah dibuka lebih dulu; sisanya diisi file terbaru
  const opened = state.openedIds.map((id) => files.find((f) => f.id === id)).filter(Boolean);
  const filler = newestFirst(files).filter((f) => !opened.includes(f));
  fillList($('home-recent'), [...opened, ...filler].slice(0, RECENT_LIMIT), 'Belum ada file.');

  const history = $('home-history');
  history.replaceChildren();
  if (!state.history.length) history.append(make('p', 'empty-note', 'Belum ada pencarian.'));
  state.history.forEach((q) => {
    const chip = make('button', 'chip', q);
    chip.type = 'button';
    chip.addEventListener('click', () => { state.query = q; recordSearch(q); showView('search'); });
    history.append(chip);
  });
}

function renderFilters() {
  const box = $('filters');
  box.replaceChildren();
  FILTERS.forEach((f, i) => {
    const chip = make('button', 'chip');
    chip.type = 'button';
    chip.setAttribute('aria-pressed', String(i === state.filterIndex));
    if (f.icon) chip.append(iconNode(f.icon));
    chip.append(f.label);
    chip.addEventListener('click', () => { state.filterIndex = i; renderSearch(); });
    box.append(chip);
  });
}

function renderDetail(file) {
  const box = $('detail');
  box.replaceChildren();
  if (!file) {
    box.append(make('p', 'detail-empty', 'Pilih file untuk melihat detailnya'));
    return;
  }
  const dl = make('dl');
  // Baris "Blok" menampilkan lokasi file pada disk simulasi (disk.js)
  [['Jenis', TYPE_LABELS[file.extension]], ['Lokasi', getDirectory(file)], ['Ukuran', formatSize(file.size)], ['Blok', describeAllocation(file.id)], ['Tanggal', formatDate(file.modifiedAt, true)]]
    .forEach(([k, v]) => dl.append(make('dt', '', k), make('dd', '', v)));
  const open = make('button', 'btn', 'Buka File');
  open.type = 'button';
  open.addEventListener('click', () => openFile(file));
  const actions = make('div', 'detail-actions');
  const rename = make('button', 'btn btn-secondary', 'Ganti Nama');
  const remove = make('button', 'btn btn-danger', 'Hapus');
  rename.type = remove.type = 'button';
  rename.addEventListener('click', () => openRenameDialog(file));
  remove.addEventListener('click', () => openDeleteDialog(file));
  actions.append(rename, remove);
  box.append(iconNode(file.extension, 'detail-ico'), make('h3', '', file.name + '.' + file.extension), dl, open, actions);
}

function renderAdvanced() {
  const count = advancedCount();
  const toggle = $('adv-toggle');
  toggle.textContent = count ? 'Filter lanjutan (' + count + ')' : 'Filter lanjutan';
  toggle.classList.toggle('active', count > 0 && toggle.getAttribute('aria-expanded') !== 'true');
  $('adv-size').value = String(state.advanced.sizeIndex);
  if ($('adv-from').value !== state.advanced.dateFrom) $('adv-from').value = state.advanced.dateFrom;
  if ($('adv-to').value !== state.advanced.dateTo) $('adv-to').value = state.advanced.dateTo;
}

function renderSearch() {
  const input = $('search-input');
  if (input.value !== state.query) input.value = state.query;
  $('search-clear').hidden = !state.query;
  renderFilters();
  renderAdvanced();

  const results = currentResults();
  if (!results.some((f) => f.id === state.selectedId)) {
    state.selectedId = results.length ? results[0].id : null;
  }
  $('result-count').textContent = 'Hasil Pencarian: ' + results.length + ' file ditemukan';
  const s = state.stats;
  $('search-stats').textContent = 'Metode: ' + s.method + ' · memeriksa ' + s.examined + ' dari ' + s.total + ' file · ' + formatMs(s.elapsedMs);

  const list = $('results');
  list.replaceChildren();
  results.forEach((f) => list.append(fileRow(f, {
    selected: f.id === state.selectedId,
    onSelect: (file) => { state.selectedId = file.id; renderSearch(); }
  })));

  const empty = !results.length;
  list.hidden = empty;
  $('empty').hidden = !empty;
  if (empty) {
    $('empty-text').textContent = state.query
      ? 'Tidak ada file yang cocok dengan "' + state.query + '". Coba kata kunci lain atau ubah filter jenis ekstensi.'
      : 'Tidak ada file yang cocok dengan filter yang dipilih. Coba ubah atau hapus filter.';
  }
  renderDetail(results.find((f) => f.id === state.selectedId));
}

// Membuka semua folder induk dari path agar folder terpilih terlihat di pohon
function expandTo(path) {
  const parts = path.split('\\').filter((p) => p !== '');
  let current = parts[0];
  state.expanded.add((current + '\\').toLowerCase());
  parts.slice(1).forEach((name) => {
    current += '\\' + name;
    state.expanded.add(current.toLowerCase());
  });
}

function sameFolder(a, b) {
  return a.replace(/\\+$/, '').toLowerCase() === b.replace(/\\+$/, '').toLowerCase();
}

function selectFolder(path) {
  state.folder = path;
  expandTo(path);
  renderFiles();
}

function treeNode(node) {
  const key = node.path.toLowerCase();
  const open = state.expanded.has(key);
  const hasChildren = node.children.length > 0;
  const item = make('li');
  const row = make('div', 'tree-row');

  const toggle = make('button', 'tree-toggle');
  toggle.type = 'button';
  if (hasChildren) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', (open ? 'Tutup ' : 'Buka ') + node.name);
    toggle.addEventListener('click', () => {
      if (open) state.expanded.delete(key); else state.expanded.add(key);
      renderFiles();
    });
  } else {
    toggle.disabled = true;
    toggle.setAttribute('aria-hidden', 'true');
  }

  const label = make('button', 'tree-label');
  label.type = 'button';
  label.setAttribute('aria-pressed', String(sameFolder(state.folder, node.path)));
  const icon = make('span');
  icon.innerHTML = ICONS.folder;
  label.append(icon, make('span', '', node.name), make('small', '', node.totalCount + ' file'));
  label.addEventListener('click', () => selectFolder(node.path));

  row.append(toggle, label);
  item.append(row);
  if (hasChildren && open) {
    const list = make('ul', 'tree-children');
    node.children.forEach((child) => list.append(treeNode(child)));
    item.append(list);
  }
  return item;
}

function renderTree() {
  const tree = $('tree');
  tree.replaceChildren();
  const list = make('ul');
  list.append(treeNode(getFolderTree(state.settings.showHidden)));
  tree.append(list);
}

function renderFiles() {
  const isTree = state.filesView === 'tree';
  $('vs-cards').setAttribute('aria-pressed', String(!isTree));
  $('vs-tree').setAttribute('aria-pressed', String(isTree));
  $('folders').hidden = isTree;
  $('tree').hidden = !isTree;
  if (isTree) renderTree();
  const folders = $('folders');
  folders.replaceChildren();
  topFolders().forEach((name) => {
    const path = ROOT_PATH + name;
    const total = visibleFiles(getFilesByDirectory(path, true)).length;
    const card = make('button', 'folder');
    card.type = 'button';
    card.setAttribute('aria-pressed', String(state.folder.toLowerCase() === path.toLowerCase()));
    const ico = make('span', 'folder-ico');
    ico.innerHTML = ICONS.folder;
    const info = make('span');
    info.append(make('b', '', name), make('small', '', total + ' file'));
    card.append(ico, info);
    card.addEventListener('click', () => selectFolder(path));
    folders.append(card);
  });

  $('location-text').textContent = state.folder;
  $('location-up').hidden = state.folder === ROOT_PATH;
  const files = state.folder === ROOT_PATH ? getAllFiles() : getFilesByDirectory(state.folder, true);
  fillList($('files-list'), newestFirst(visibleFiles(files)), 'Folder ini kosong.');
}

// Pengelompokan relatif terhadap file terbaru di drive simulasi,
// karena tanggal pada data simulasi tetap (tidak mengikuti tanggal hari ini).
function recentGroup(date, reference) {
  const startOfDay = new Date(reference);
  startOfDay.setHours(0, 0, 0, 0);
  if (date >= startOfDay) return 'Hari ini';
  if (date >= new Date(startOfDay.getTime() - 6 * 86400000)) return 'Minggu ini';
  return 'Lebih lama';
}

function renderRecent() {
  const box = $('recent-groups');
  box.replaceChildren();
  const files = newestFirst(visibleFiles()).slice(0, 15);
  if (!files.length) {
    box.append(make('p', 'empty-note', 'Belum ada file.'));
    return;
  }
  const reference = new Date(files[0].modifiedAt);
  const groups = {};
  files.forEach((f) => {
    const name = recentGroup(new Date(f.modifiedAt), reference);
    (groups[name] = groups[name] || []).push(f);
  });
  ['Hari ini', 'Minggu ini', 'Lebih lama'].filter((n) => groups[n]).forEach((name) => {
    const list = make('div', 'list');
    groups[name].forEach((f) => list.append(fileRow(f, { onSelect: goToFile })));
    box.append(make('h2', '', name), list);
  });
}

function renderSettings() {
  ['ignoreCase', 'includeSubfolders', 'showHidden'].forEach((key) => {
    $('set-' + key).checked = state.settings[key];
  });
  const select = $('set-location');
  select.replaceChildren();
  select.append(new Option('D:\\ (Semua folder)', ''));
  topFolders().forEach((name) => select.append(new Option(ROOT_PATH + name, ROOT_PATH + name)));
  select.value = state.settings.location;
  const fontSelect = $('set-fontSize');
  if (!fontSelect.options.length) FONT_SIZES.forEach((f) => fontSelect.append(new Option(f.label, f.value)));
  fontSelect.value = state.appearance.fontSize;
  $('set-darkMode').checked = state.appearance.darkMode;
  applyAppearance();
}

// renderVisual ada di visualizer.js, renderDisk ada di diskView.js
const RENDERERS = { home: renderHome, search: renderSearch, files: renderFiles, recent: renderRecent, visual: renderVisual, disk: renderDisk, settings: renderSettings };

function showView(name) {
  state.view = name;
  document.querySelectorAll('.view').forEach((v) => { v.hidden = v.id !== 'view-' + name; });
  document.querySelectorAll('.nav-item').forEach((b) => {
    if (b.dataset.view === name) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  RENDERERS[name]();
  $('view-' + name).scrollIntoView({ block: 'start' });
  if (name === 'search') $('search-input').focus({ preventScroll: true });
}

/* ---------- Dialog dan operasi file ---------- */

function buildField(spec) {
  const label = make('label', 'field');
  label.append(make('span', '', spec.label));
  let input;
  if (spec.options) {
    input = make('select');
    spec.options.forEach((o) => input.append(new Option(o.label, o.value)));
  } else {
    input = make('input');
    input.type = spec.type || 'text';
    if (spec.min !== undefined) input.min = spec.min;
  }
  input.value = spec.value;
  label.append(input);
  return { label, input };
}

// Dialog serupa untuk buat, ganti nama, dan hapus. onSubmit mengembalikan pesan galat atau ''.
function openDialog({ title, message, fields = [], confirmLabel, danger = false, onSubmit }) {
  const dialog = $('dialog');
  const form = make('form', 'dialog-form');
  const heading = make('h3', '', title);
  heading.id = 'dialog-title';
  form.append(heading);
  if (message) form.append(make('p', 'dialog-msg', message));
  const inputs = {};
  fields.forEach((spec) => {
    const built = buildField(spec);
    inputs[spec.key] = built.input;
    form.append(built.label);
  });
  const error = make('p', 'dialog-error');
  error.setAttribute('role', 'alert');
  error.hidden = true;
  const cancel = make('button', 'btn btn-secondary', 'Batal');
  cancel.type = 'button';
  cancel.addEventListener('click', () => dialog.close());
  const confirm = make('button', danger ? 'btn btn-danger' : 'btn', confirmLabel);
  confirm.type = 'submit';
  const actions = make('div', 'dialog-actions');
  actions.append(cancel, confirm);
  form.append(error, actions);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const values = {};
    Object.keys(inputs).forEach((key) => { values[key] = inputs[key].value; });
    const message = onSubmit(values);
    if (message) { error.textContent = message; error.hidden = false; } else { dialog.close(); }
  });
  dialog.replaceChildren(form);
  dialog.showModal();
  const first = form.querySelector('input, select');
  if (first) first.focus(); else confirm.focus();
}

function refreshView() {
  RENDERERS[state.view]();
}

function openCreateDialog() {
  const folders = getFolderPaths().map((p) => ({ value: p, label: p }));
  openDialog({
    title: 'File Baru',
    confirmLabel: 'Buat',
    fields: [
      { key: 'name', label: 'Nama file (tanpa ekstensi)', value: '' },
      { key: 'extension', label: 'Ekstensi', value: 'pdf', options: SUPPORTED_EXTENSIONS.map((e) => ({ value: e, label: '.' + e })) },
      { key: 'directory', label: 'Folder', value: findFolderPath(state.folder) || ROOT_PATH, options: folders },
      { key: 'size', label: 'Ukuran (KB)', type: 'number', min: 0, value: '100' }
    ],
    onSubmit: (v) => {
      const kb = v.size.trim() === '' ? NaN : Number(v.size);
      const result = createFile({ name: v.name, extension: v.extension, directory: v.directory, size: kb * 1024 });
      if (!result.ok) return result.error;
      // Alokasikan blok disk; bila gagal (disk penuh/terfragmentasi), batalkan pembuatan file
      const alloc = allocateFile(result.file);
      if (!alloc.ok) {
        deleteFile(result.file.id);
        return alloc.error;
      }
      showToast('File dibuat: ' + result.file.path);
      refreshView();
      return '';
    }
  });
}

function openRenameDialog(file) {
  openDialog({
    title: 'Ganti Nama',
    confirmLabel: 'Simpan',
    fields: [{ key: 'name', label: 'Nama baru (ekstensi .' + file.extension + ' tetap)', value: file.name }],
    onSubmit: (v) => {
      const result = renameFile(file.id, v.name);
      if (!result.ok) return result.error;
      showToast('Nama diganti: ' + result.file.name + '.' + result.file.extension);
      refreshView();
      return '';
    }
  });
}

function openDeleteDialog(file) {
  openDialog({
    title: 'Hapus file?',
    message: 'Hapus "' + file.name + '.' + file.extension + '" dari simulasi? File asli di komputer Anda tidak terpengaruh, dan data kembali saat halaman dimuat ulang.',
    confirmLabel: 'Hapus',
    danger: true,
    onSubmit: () => {
      const result = deleteFile(file.id);
      if (!result.ok) return result.error;
      freeFile(file.id); // bebaskan blok disk milik file
      showToast('File dihapus: ' + file.name + '.' + file.extension);
      refreshView();
      return '';
    }
  });
}

/* ---------- Aksi ---------- */

function openFile(file) {
  state.openedIds = [file.id, ...state.openedIds.filter((id) => id !== file.id)].slice(0, 10);
  saveState();
  showToast('Simulasi: membuka ' + file.name + '.' + file.extension);
}

function resetSearch() {
  state.query = '';
  state.filterIndex = 0;
  resetAdvanced();
  renderSearch();
  $('search-input').focus();
}

/* ---------- Event ---------- */

function bindEvents() {
  document.querySelectorAll('.nav-item').forEach((b) => b.addEventListener('click', () => showView(b.dataset.view)));

  $('home-form').addEventListener('submit', (e) => {
    e.preventDefault();
    state.query = $('home-input').value.trim();
    recordSearch(state.query);
    showView('search');
  });

  $('search-input').addEventListener('input', (e) => {
    state.query = e.target.value;
    recordSoon(state.query);
    renderSearch();
  });
  $('search-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { clearTimeout(recordTimer); recordSearch(state.query); }
  });
  $('search-clear').addEventListener('click', resetSearch);
  $('empty-reset').addEventListener('click', resetSearch);

  const sort = $('sort');
  SORTS.forEach((s, i) => sort.append(new Option(s.label, String(i))));
  sort.addEventListener('change', () => { state.sortIndex = Number(sort.value); renderSearch(); });

  SIZE_RANGES.forEach((r, i) => $('adv-size').append(new Option(r.label, String(i))));
  $('adv-size').addEventListener('change', (e) => { state.advanced.sizeIndex = Number(e.target.value); renderSearch(); });
  $('adv-from').addEventListener('change', (e) => { state.advanced.dateFrom = e.target.value; renderSearch(); });
  $('adv-to').addEventListener('change', (e) => { state.advanced.dateTo = e.target.value; renderSearch(); });
  $('adv-reset').addEventListener('click', () => { resetAdvanced(); renderSearch(); });
  $('adv-toggle').addEventListener('click', () => {
    const open = $('adv-panel').hidden;
    $('adv-panel').hidden = !open;
    $('adv-toggle').setAttribute('aria-expanded', String(open));
    renderAdvanced();
  });

  $('new-file').addEventListener('click', openCreateDialog);
  $('vs-cards').addEventListener('click', () => { state.filesView = 'cards'; renderFiles(); });
  $('vs-tree').addEventListener('click', () => { state.filesView = 'tree'; expandTo(state.folder); renderFiles(); });
  $('location-up').addEventListener('click', () => { state.folder = ROOT_PATH; renderFiles(); });

  ['ignoreCase', 'includeSubfolders', 'showHidden'].forEach((key) => {
    $('set-' + key).addEventListener('change', (e) => { state.settings[key] = e.target.checked; saveState(); });
  });
  $('set-location').addEventListener('change', (e) => { state.settings.location = e.target.value; saveState(); });
  $('set-darkMode').addEventListener('change', (e) => { state.appearance.darkMode = e.target.checked; applyAppearance(); saveState(); });
  $('set-fontSize').addEventListener('change', (e) => { state.appearance.fontSize = e.target.value; applyAppearance(); saveState(); });
  $('clear-history').addEventListener('click', () => {
    state.history = [];
    saveState();
    showToast('Riwayat pencarian dihapus');
  });
}

/* ---------- Inisialisasi ---------- */

async function init() {
  loadState();
  applyAppearance();
  bindEvents();
  try {
    await loadFiles();
  } catch (e) {
    document.querySelector('.main').prepend(make('p', 'empty-note', 'Data file gagal dimuat. Periksa data/files.json dan data/files.js.'));
    return;
  }
  initDisk(getAllFiles(), DEFAULT_ALLOC_METHOD); // alokasikan semua file ke blok disk simulasi
  showView('home');
}

document.addEventListener('DOMContentLoaded', init);
