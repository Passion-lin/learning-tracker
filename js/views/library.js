import { getAllEntries } from '../db.js';
import { typeIcon, formatDate, escHtml } from '../utils.js';
import { navigate } from '../router.js';

export async function renderLibrary() {
  const app = document.getElementById('app');
  let entries = await getAllEntries();
  entries.sort((a, b) => (b.completedDate || b.createdAt).localeCompare(a.completedDate || a.createdAt));

  let filterType   = 'all';
  let filterStatus = 'all';
  let query = '';

  function filtered() {
    return entries.filter(e => {
      if (filterType   !== 'all' && e.type   !== filterType)   return false;
      if (filterStatus !== 'all' && e.status !== filterStatus) return false;
      if (query && !e.title.toLowerCase().includes(query.toLowerCase()) &&
                   !(e.creator || '').toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }

  function render() {
    const list = filtered();
    document.getElementById('list-area').innerHTML = list.length
      ? list.map(e => `
          <div class="entry-item" data-id="${e.id}" style="cursor:pointer">
            <span class="entry-icon">${typeIcon(e.type)}</span>
            <div class="entry-info">
              <div class="entry-title">${escHtml(e.title)}</div>
              <div class="entry-meta">${escHtml(e.creator || '')}${e.completedDate ? '　' + formatDate(e.completedDate) : ''}</div>
            </div>
            <span class="badge ${e.status === 'completed' ? 'badge-done' : 'badge-progress'}">
              ${e.status === 'completed' ? '完成' : '進行中'}
            </span>
          </div>
        `).join('')
      : '<p class="empty">沒有符合條件的紀錄</p>';

    document.querySelectorAll('#list-area .entry-item').forEach(el => {
      el.addEventListener('click', () => navigate(`detail?id=${el.dataset.id}`));
    });

    ['chip-all','chip-book','chip-video'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('active', filterType === (id === 'chip-all' ? 'all' : id === 'chip-book' ? 'book' : 'video'));
    });
    ['chip-status-all','chip-progress','chip-done'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('active', filterStatus === (id === 'chip-status-all' ? 'all' : id === 'chip-progress' ? 'in_progress' : 'completed'));
    });
  }

  app.innerHTML = `
    <h1>書庫</h1>
    <input class="search-box" id="search" type="text" placeholder="搜尋標題或作者…" value="${query}" />
    <div class="filter-row">
      <button class="filter-chip active" id="chip-all">全部</button>
      <button class="filter-chip" id="chip-book">📚 書籍</button>
      <button class="filter-chip" id="chip-video">🎬 影片</button>
    </div>
    <div class="filter-row">
      <button class="filter-chip active" id="chip-status-all">全部狀態</button>
      <button class="filter-chip" id="chip-progress">進行中</button>
      <button class="filter-chip" id="chip-done">已完成</button>
    </div>
    <div class="card" id="list-area"></div>
  `;

  render();

  document.getElementById('search').addEventListener('input', (e) => { query = e.target.value; render(); });

  document.getElementById('chip-all').addEventListener('click',   () => { filterType = 'all';   render(); });
  document.getElementById('chip-book').addEventListener('click',  () => { filterType = 'book';  render(); });
  document.getElementById('chip-video').addEventListener('click', () => { filterType = 'video'; render(); });

  document.getElementById('chip-status-all').addEventListener('click', () => { filterStatus = 'all';         render(); });
  document.getElementById('chip-progress').addEventListener('click',   () => { filterStatus = 'in_progress'; render(); });
  document.getElementById('chip-done').addEventListener('click',       () => { filterStatus = 'completed';   render(); });
}
