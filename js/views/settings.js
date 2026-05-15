import { loadGoals, saveGoals } from '../utils.js';

export function renderSettings() {
  const app = document.getElementById('app');
  const goals = loadGoals();

  app.innerHTML = `
    <h1>設定</h1>
    <div class="card">
      <h2>年度學習目標</h2>
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px">設為 0 表示不顯示進度條</p>
      <div class="form-group">
        <label>今年書籍目標（本）</label>
        <input type="number" id="book-goal" min="0" max="999" value="${goals.bookGoal}" />
      </div>
      <div class="form-group">
        <label>今年影片目標（部）</label>
        <input type="number" id="video-goal" min="0" max="999" value="${goals.videoGoal}" />
      </div>
      <button class="btn btn-primary" id="btn-save-goals">儲存</button>
      <p id="save-msg" style="color:var(--primary);font-size:14px;margin-top:8px;display:none">✓ 已儲存</p>
    </div>
  `;

  document.getElementById('btn-save-goals').addEventListener('click', () => {
    const bookGoal = Math.max(0, parseInt(document.getElementById('book-goal').value) || 0);
    const videoGoal = Math.max(0, parseInt(document.getElementById('video-goal').value) || 0);
    saveGoals({ bookGoal, videoGoal });
    const msg = document.getElementById('save-msg');
    msg.style.display = 'block';
    setTimeout(() => { msg.style.display = 'none'; }, 2000);
  });
}
