import { addEntry, getEntry, updateEntry } from '../db.js';
import { uuid, today, escHtml } from '../utils.js';
import { navigate } from '../router.js';

export async function renderForm(id) {
  const app = document.getElementById('app');
  const editing = !!id;
  let entry = editing
    ? await getEntry(id)
    : { id: uuid(), type: 'book', title: '', creator: '', status: 'in_progress',
        startDate: today(), completedDate: '', rating: 0, notes: '', createdAt: new Date().toISOString() };

  app.innerHTML = `
    <h1>${editing ? '編輯' : '新增'} 紀錄</h1>

    <div class="type-toggle">
      <button id="btn-book" class="${entry.type === 'book' ? 'active' : ''}">📚 書籍</button>
      <button id="btn-video" class="${entry.type === 'video' ? 'active' : ''}">🎬 影片</button>
    </div>

    <div class="form-group">
      <label>標題 *</label>
      <input type="text" id="f-title" value="${escHtml(entry.title)}" placeholder="書名 / 影片名稱" />
    </div>

    <div class="form-group">
      <label>作者 / 頻道</label>
      <input type="text" id="f-creator" value="${escHtml(entry.creator)}" placeholder="選填" />
    </div>

    <div class="form-group">
      <label>狀態</label>
      <select id="f-status">
        <option value="in_progress" ${entry.status === 'in_progress' ? 'selected' : ''}>進行中</option>
        <option value="completed"   ${entry.status === 'completed'   ? 'selected' : ''}>已完成</option>
      </select>
    </div>

    <div class="form-group" id="g-completed" style="${entry.status !== 'completed' ? 'display:none' : ''}">
      <label>完成日期</label>
      <input type="date" id="f-completed" value="${entry.completedDate}" />
    </div>

    <div class="form-group">
      <label>評分</label>
      <div class="stars" id="stars">
        ${[1,2,3,4,5].map(i =>
          `<span class="star ${i <= entry.rating ? 'filled' : ''}" data-v="${i}">★</span>`
        ).join('')}
      </div>
    </div>

    <div class="form-group">
      <label>心得筆記</label>
      <textarea id="f-notes" placeholder="選填">${escHtml(entry.notes)}</textarea>
    </div>

    <button class="btn btn-primary" id="btn-save">儲存</button>
    <button class="btn btn-ghost" id="btn-cancel" style="margin-top:8px">取消</button>
  `;

  let currentType = entry.type;
  let currentRating = entry.rating;

  document.getElementById('btn-book').addEventListener('click', () => {
    currentType = 'book';
    document.getElementById('btn-book').classList.add('active');
    document.getElementById('btn-video').classList.remove('active');
  });

  document.getElementById('btn-video').addEventListener('click', () => {
    currentType = 'video';
    document.getElementById('btn-video').classList.add('active');
    document.getElementById('btn-book').classList.remove('active');
  });

  document.getElementById('f-status').addEventListener('change', (e) => {
    document.getElementById('g-completed').style.display =
      e.target.value === 'completed' ? '' : 'none';
  });

  document.getElementById('stars').addEventListener('click', (e) => {
    const v = parseInt(e.target.dataset.v);
    if (!v) return;
    currentRating = currentRating === v ? 0 : v;
    document.querySelectorAll('#stars .star').forEach((s, i) => {
      s.classList.toggle('filled', i < currentRating);
    });
  });

  document.getElementById('btn-save').addEventListener('click', async () => {
    const title = document.getElementById('f-title').value.trim();
    if (!title) { alert('請輸入標題'); return; }

    const updated = {
      ...entry,
      type: currentType,
      title,
      creator: document.getElementById('f-creator').value.trim(),
      status: document.getElementById('f-status').value,
      completedDate: document.getElementById('f-completed')?.value || '',
      rating: currentRating,
      notes: document.getElementById('f-notes').value.trim(),
    };

    editing ? await updateEntry(updated) : await addEntry(updated);
    navigate(editing ? `detail?id=${id}` : 'dashboard');
  });

  document.getElementById('btn-cancel').addEventListener('click', () => {
    history.back();
  });
}

