import { getEntry, deleteEntry } from '../db.js';
import { typeLabel, starsHTML, formatDate, escHtml, showConfirm } from '../utils.js';
import { navigate } from '../router.js';

export async function renderDetail(id) {
  const app = document.getElementById('app');

  if (!id) { navigate('library'); return; }

  const e = await getEntry(id);
  if (!e) { app.innerHTML = '<p class="empty">找不到這筆紀錄</p>'; return; }

  app.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
      <button id="btn-back" style="background:none;border:none;font-size:20px;cursor:pointer">←</button>
      <h1 style="margin:0;flex:1">${escHtml(e.title)}</h1>
    </div>

    <div class="card">
      <p style="color:var(--text-muted);font-size:13px;margin-bottom:4px">${typeLabel(e.type)}</p>
      ${e.creator ? `<p style="margin-bottom:8px">${escHtml(e.creator)}</p>` : ''}
      <span class="badge ${e.status === 'completed' ? 'badge-done' : 'badge-progress'}" style="margin-bottom:12px;display:inline-block">
        ${e.status === 'completed' ? '已完成' : '進行中'}
      </span>
      ${e.startDate ? `<p style="font-size:14px;color:var(--text-muted)">開始日期：${formatDate(e.startDate)}</p>` : ''}
      ${e.completedDate ? `<p style="font-size:14px;color:var(--text-muted)">完成日期：${formatDate(e.completedDate)}</p>` : ''}
      ${e.rating ? `<div class="stars" style="margin-top:12px;font-size:20px">${starsHTML(e.rating)}</div>` : ''}
      ${(e.tags && e.tags.length) ? `
        <div class="tags-wrap" style="margin-top:12px">
          ${e.tags.map(t => `<span class="tag-chip-view">${escHtml(t)}</span>`).join('')}
        </div>
      ` : ''}
    </div>

    ${e.notes ? `
      <div class="card">
        <h2>心得筆記</h2>
        <p style="white-space:pre-wrap;line-height:1.7">${escHtml(e.notes)}</p>
      </div>
    ` : ''}

    <button class="btn btn-ghost" id="btn-edit" style="margin-bottom:8px">編輯</button>
    <button class="btn btn-danger" id="btn-delete">刪除</button>
  `;

  document.getElementById('btn-back').addEventListener('click', () => history.back());
  document.getElementById('btn-edit').addEventListener('click', () => navigate(`edit?id=${id}`));
  document.getElementById('btn-delete').addEventListener('click', async () => {
    const ok = await showConfirm('刪除紀錄', `確定要刪除「${e.title}」？此動作無法復原。`);
    if (ok) {
      await deleteEntry(id);
      navigate('library');
    }
  });
}
