// app.js
// Lapisan presentasi: inisialisasi, event handler, dan render ke DOM.

const searchInput = document.getElementById('search-input');
const extensionFilter = document.getElementById('extension-filter');
const sortSelect = document.getElementById('sort-select');
const resultList = document.getElementById('result-list');
const resultCount = document.getElementById('result-count');
const emptyMessage = document.getElementById('empty-message');

// Menampilkan hasil pencarian ke DOM
function renderResults(files) {
  resultList.innerHTML = '';
  resultCount.textContent = `${files.length} file ditemukan`;
  emptyMessage.hidden = files.length > 0;

  files.forEach((file) => {
    const item = document.createElement('li');
    item.className = 'result-item';
    item.textContent = `${file.name}.${file.extension}`;
    resultList.appendChild(item);
  });
}

// Menjalankan pencarian berdasarkan input pengguna
function handleSearch() {
  const results = searchFiles(searchInput.value, extensionFilter.value);
  renderResults(sortFiles(results, sortSelect.value));
}

// Inisialisasi aplikasi
function init() {
  loadFiles();
  searchInput.addEventListener('input', handleSearch);
  extensionFilter.addEventListener('change', handleSearch);
  sortSelect.addEventListener('change', handleSearch);
  handleSearch();
}

document.addEventListener('DOMContentLoaded', init);
