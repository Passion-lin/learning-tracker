export function uuid() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${y}/${m}/${d}`;
}

export function thisYear() {
  return new Date().getFullYear();
}

export function entryYear(entry) {
  const d = entry.completedDate || entry.startDate || entry.createdAt;
  return new Date(d).getFullYear();
}

export function typeLabel(type) {
  return type === 'book' ? '📚 書籍' : '🎬 影片';
}

export function typeIcon(type) {
  return type === 'book' ? '📚' : '🎬';
}

export function starsHTML(rating) {
  return Array.from({ length: 5 }, (_, i) =>
    `<span class="star ${i < rating ? 'filled' : ''}">★</span>`
  ).join('');
}

export function escHtml(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

const GOALS_KEY = 'learning-goals';

export function loadGoals() {
  try {
    return JSON.parse(localStorage.getItem(GOALS_KEY)) || { bookGoal: 0, videoGoal: 0 };
  } catch {
    return { bookGoal: 0, videoGoal: 0 };
  }
}

export function saveGoals(goals) {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

export function showConfirm(title, message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box">
        <h3>${escHtml(title)}</h3>
        <p>${escHtml(message)}</p>
        <div class="modal-actions">
          <button class="btn btn-danger" id="modal-confirm">確定刪除</button>
          <button class="btn btn-ghost" id="modal-cancel">取消</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#modal-confirm').addEventListener('click', () => { overlay.remove(); resolve(true); });
    overlay.querySelector('#modal-cancel').addEventListener('click', () => { overlay.remove(); resolve(false); });
  });
}
