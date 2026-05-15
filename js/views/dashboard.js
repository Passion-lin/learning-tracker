import { getAllEntries } from '../db.js';
import { typeIcon, starsHTML, formatDate, thisYear, entryYear, escHtml, loadGoals } from '../utils.js';
import { navigate } from '../router.js';

export async function renderDashboard() {
  const app = document.getElementById('app');
  const entries = await getAllEntries();

  const year = thisYear();
  const booksThisYear  = entries.filter(e => e.type === 'book'  && e.status === 'completed' && entryYear(e) === year).length;
  const videosThisYear = entries.filter(e => e.type === 'video' && e.status === 'completed' && entryYear(e) === year).length;
  const totalBooks     = entries.filter(e => e.type === 'book'  && e.status === 'completed').length;
  const totalVideos    = entries.filter(e => e.type === 'video' && e.status === 'completed').length;

  const goals = loadGoals();

  function progressHTML(current, goal, unit) {
    if (!goal) return '';
    const pct = Math.min(100, Math.round(current / goal * 100));
    return `
      <div class="progress-item">
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill ${pct >= 100 ? 'complete' : ''}" style="width:${pct}%"></div>
        </div>
        <div class="progress-stat">${current} / ${goal} ${unit}　${pct}%</div>
      </div>
    `;
  }

  const inProgress = entries.filter(e => e.status === 'in_progress');
  const recent = entries
    .filter(e => e.status === 'completed')
    .sort((a, b) => (b.completedDate || b.createdAt).localeCompare(a.completedDate || a.createdAt))
    .slice(0, 3);

  app.innerHTML = `
    <h1>${year} 年的學習</h1>

    <div class="stat-row">
      <div class="stat-card">
        <div class="num">${booksThisYear}</div>
        <div class="lbl">📚 本書</div>
      </div>
      <div class="stat-card">
        <div class="num">${videosThisYear}</div>
        <div class="lbl">🎬 部影片</div>
      </div>
    </div>

    ${(goals.bookGoal || goals.videoGoal) ? `
    <div class="progress-section">
      ${progressHTML(booksThisYear, goals.bookGoal, '本書')}
      ${progressHTML(videosThisYear, goals.videoGoal, '部影片')}
    </div>
    ` : ''}

    <div class="card">
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:4px">歷年累積</p>
      <p>書籍 ${totalBooks} 本　影片 ${totalVideos} 部</p>
    </div>

    ${inProgress.length ? `
      <h2>進行中</h2>
      <div class="card">
        ${inProgress.map(e => entryItemHTML(e)).join('')}
      </div>
    ` : ''}

    ${recent.length ? `
      <h2>最近完成</h2>
      <div class="card">
        ${recent.map(e => entryItemHTML(e)).join('')}
      </div>
    ` : `<p class="empty">還沒有紀錄，點＋開始新增吧！</p>`}
  `;

  app.querySelectorAll('.entry-item').forEach((el) => {
    el.addEventListener('click', () => navigate(`detail?id=${el.dataset.id}`));
  });
}

function entryItemHTML(e) {
  return `
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
  `;
}
