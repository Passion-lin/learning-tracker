# Learning Tracker 功能擴充 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增年度目標設定、自訂標籤、三個小修正，讓學習紀錄 app 更完整好用。

**Architecture:** 純 vanilla JS PWA，無框架。目標資料存 `localStorage`；標籤存在每筆 entry 的 `tags: string[]` 欄位；新增 `js/views/settings.js`；共用 modal 和目標讀寫函式放在既有的 `js/utils.js`。

**Tech Stack:** Vanilla JS (ES modules)、IndexedDB（via db.js）、localStorage、CSS variables

---

## 檔案責任對照

| 檔案 | 動作 | 負責內容 |
|---|---|---|
| `css/app.css` | 修改 | 進度條、標籤 chips、custom modal 樣式 |
| `index.html` | 修改 | 導覽列加設定項目 |
| `js/utils.js` | 修改 | 新增 `showConfirm()`、`loadGoals()`、`saveGoals()` |
| `js/app.js` | 修改 | 新增 settings 路由 |
| `js/views/settings.js` | 新增 | 設定頁 render 函式 |
| `js/views/dashboard.js` | 修改 | 讀取目標，顯示進度條 |
| `js/views/form.js` | 修改 | 標籤 UI、完成日期自動填 |
| `js/views/detail.js` | 修改 | 顯示標籤、開始日期、換用 `showConfirm()` |
| `js/views/library.js` | 修改 | 標籤篩選下拉 |
| `sw.js` | 修改 | 快取版本升至 v3 |

---

## Task 1：CSS 樣式（進度條 + 標籤 chips + modal）

**Files:**
- Modify: `css/app.css`

- [ ] **Step 1：在 `css/app.css` 末尾加入以下樣式**

```css
/* === 進度條 === */
.progress-section { margin-bottom: 20px; }
.progress-item { margin-bottom: 12px; }
.progress-label { font-size: 13px; color: var(--text-muted); margin-bottom: 4px; }
.progress-bar-wrap { background: var(--border); border-radius: 99px; height: 8px; overflow: hidden; }
.progress-bar-fill { height: 100%; background: var(--primary); border-radius: 99px; transition: width 0.4s ease; }
.progress-bar-fill.complete { background: #5a7a6a; }
.progress-stat { font-size: 12px; color: var(--text-muted); margin-top: 4px; }

/* === 標籤 chips === */
.tags-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
.tag-chip {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 10px; background: var(--primary-light);
  color: var(--text); border-radius: 99px; font-size: 12px; font-weight: 500;
}
.tag-chip-view { padding: 3px 10px; background: var(--primary-light); color: var(--text); border-radius: 99px; font-size: 12px; }
.tag-remove { background: none; border: none; cursor: pointer; padding: 0; font-size: 15px; line-height: 1; color: var(--text-muted); }
.tag-input-area { border: 1px solid var(--border); border-radius: 8px; padding: 8px; background: var(--bg); }
.tag-input-field { border: none; background: transparent; font-size: 14px; outline: none; width: 120px; }
.tag-suggestions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.tag-suggestion { padding: 3px 10px; border-radius: 99px; border: 1px dashed var(--border); background: var(--card-bg); font-size: 12px; cursor: pointer; color: var(--text-muted); }

/* === 自訂 modal === */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.35);
  display: flex; align-items: center; justify-content: center;
  z-index: 200; padding: 16px;
}
.modal-box { background: var(--card-bg); border-radius: var(--radius); padding: 24px; max-width: 320px; width: 100%; }
.modal-box h3 { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
.modal-box p { font-size: 14px; color: var(--text-muted); margin-bottom: 20px; line-height: 1.5; }
.modal-actions { display: flex; flex-direction: column; gap: 8px; }
```

- [ ] **Step 2：確認無語法錯誤，存檔**

---

## Task 2：共用工具函式（utils.js）

**Files:**
- Modify: `js/utils.js`

- [ ] **Step 1：在 `js/utils.js` 末尾加入以下三個函式**

```js
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
```

- [ ] **Step 2：存檔**

---

## Task 3：導覽列 + 路由

**Files:**
- Modify: `index.html`
- Modify: `js/app.js`

- [ ] **Step 1：在 `index.html` 的 `<nav class="bottom-nav">` 裡，`書庫` 連結後面加一個設定連結**

找到：
```html
    <a href="#library" class="nav-item" data-icon="📚">書庫</a>
```

改成：
```html
    <a href="#library" class="nav-item" data-icon="📚">書庫</a>
    <a href="#settings" class="nav-item" data-icon="⚙️">設定</a>
```

- [ ] **Step 2：在 `js/app.js` 頂部加入 settings import**

找到：
```js
import { renderDetail } from './views/detail.js';
```

改成：
```js
import { renderDetail } from './views/detail.js';
import { renderSettings } from './views/settings.js';
```

- [ ] **Step 3：在 `js/app.js` 的 `initRouter({...})` 裡加 settings 路由**

找到：
```js
    detail:    (params) => renderDetail(params.id),
```

改成：
```js
    detail:    (params) => renderDetail(params.id),
    settings:  () => renderSettings(),
```

- [ ] **Step 4：存檔**

---

## Task 4：設定頁（settings.js）

**Files:**
- Create: `js/views/settings.js`

- [ ] **Step 1：新建 `js/views/settings.js`，內容如下**

```js
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
```

- [ ] **Step 2：存檔**

---

## Task 5：首頁進度條（dashboard.js）

**Files:**
- Modify: `js/views/dashboard.js`

- [ ] **Step 1：在 `dashboard.js` 頂部加入 `loadGoals` import**

找到：
```js
import { typeIcon, starsHTML, formatDate, thisYear, entryYear, escHtml } from '../utils.js';
```

改成：
```js
import { typeIcon, starsHTML, formatDate, thisYear, entryYear, escHtml, loadGoals } from '../utils.js';
```

- [ ] **Step 2：在 `renderDashboard()` 函式裡，`const inProgress` 那行之前加入目標讀取和進度條 helper**

找到：
```js
  const inProgress = entries.filter(e => e.status === 'in_progress');
```

在這行前面插入：
```js
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

```

- [ ] **Step 3：在 `app.innerHTML` 的 stat-row 後面加進度條區塊**

找到：
```js
    </div>

    <div class="card">
      <p style="font-size:13px;color:var(--text-muted);margin-bottom:4px">歷年累積</p>
```

在 `</div>` 和 `<div class="card">` 之間插入：
```js
    ${(goals.bookGoal || goals.videoGoal) ? `
    <div class="progress-section">
      ${progressHTML(booksThisYear, goals.bookGoal, '本書')}
      ${progressHTML(videosThisYear, goals.videoGoal, '部影片')}
    </div>
    ` : ''}

```

- [ ] **Step 4：存檔**

---

## Task 6：表單（form.js）— 標籤 UI + 完成日期自動填

**Files:**
- Modify: `js/views/form.js`

- [ ] **Step 1：在 `form.js` 頂部 import 裡加入 `getAllEntries`**

找到：
```js
import { addEntry, getEntry, updateEntry } from '../db.js';
```

改成：
```js
import { addEntry, getEntry, updateEntry, getAllEntries } from '../db.js';
```

- [ ] **Step 2：在 `renderForm` 函式開頭，`const editing = !!id;` 後面加入「過去標籤」收集**

找到：
```js
  const editing = !!id;
  let entry = editing
```

在這行後面（`let entry = editing` 前）插入：
```js
  const allEntries = await getAllEntries();
  const allUsedTags = [...new Set(allEntries.flatMap(e => e.tags || []))].sort();

```

- [ ] **Step 3：在 `app.innerHTML` 的心得筆記表單群之前，加入標籤輸入區塊**

找到：
```js
    <div class="form-group">
      <label>心得筆記</label>
```

在這行前面插入：
```js
    <div class="form-group">
      <label>標籤</label>
      <div class="tag-input-area">
        <div class="tags-wrap" id="tags-selected"></div>
        <input class="tag-input-field" id="tag-input" type="text" placeholder="輸入後按 Enter 新增…" />
      </div>
      <div class="tag-suggestions" id="tag-suggestions"></div>
    </div>

```

- [ ] **Step 4：在 `let currentType = entry.type;` 後面加入標籤管理邏輯**

找到：
```js
  let currentType = entry.type;
  let currentRating = entry.rating;
```

改成：
```js
  let currentType = entry.type;
  let currentRating = entry.rating;
  let currentTags = [...(entry.tags || [])];

  function renderTagUI() {
    const selectedEl = document.getElementById('tags-selected');
    const suggestEl  = document.getElementById('tag-suggestions');
    if (!selectedEl || !suggestEl) return;

    selectedEl.innerHTML = currentTags.map(t =>
      `<span class="tag-chip">${escHtml(t)}<button class="tag-remove" data-tag="${escHtml(t)}" type="button">×</button></span>`
    ).join('');
    selectedEl.querySelectorAll('.tag-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        currentTags = currentTags.filter(t => t !== btn.dataset.tag);
        renderTagUI();
      });
    });

    const unused = allUsedTags.filter(t => !currentTags.includes(t));
    suggestEl.innerHTML = unused.map(t =>
      `<span class="tag-suggestion" data-tag="${escHtml(t)}">${escHtml(t)}</span>`
    ).join('');
    suggestEl.querySelectorAll('.tag-suggestion').forEach(el => {
      el.addEventListener('click', () => {
        if (!currentTags.includes(el.dataset.tag)) currentTags.push(el.dataset.tag);
        renderTagUI();
      });
    });
  }

  renderTagUI();

  document.getElementById('tag-input').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const val = e.target.value.trim().slice(0, 20);
    if (val && !currentTags.includes(val)) currentTags.push(val);
    e.target.value = '';
    renderTagUI();
  });
```

- [ ] **Step 5：在狀態 change 監聽器裡加入自動填今天日期**

找到：
```js
  document.getElementById('f-status').addEventListener('change', (e) => {
    document.getElementById('g-completed').style.display =
      e.target.value === 'completed' ? '' : 'none';
  });
```

改成：
```js
  document.getElementById('f-status').addEventListener('change', (e) => {
    const isCompleted = e.target.value === 'completed';
    document.getElementById('g-completed').style.display = isCompleted ? '' : 'none';
    if (isCompleted) {
      const dateField = document.getElementById('f-completed');
      if (!dateField.value) dateField.value = today();
    }
  });
```

- [ ] **Step 6：在儲存時把 `currentTags` 寫入 entry**

找到：
```js
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
```

改成：
```js
    const updated = {
      ...entry,
      type: currentType,
      title,
      creator: document.getElementById('f-creator').value.trim(),
      status: document.getElementById('f-status').value,
      completedDate: document.getElementById('f-completed')?.value || '',
      rating: currentRating,
      notes: document.getElementById('f-notes').value.trim(),
      tags: currentTags,
    };
```

- [ ] **Step 7：存檔**

---

## Task 7：詳細頁（detail.js）— 標籤、開始日期、自訂 modal

**Files:**
- Modify: `js/views/detail.js`

- [ ] **Step 1：在 `detail.js` 頂部 import 裡加入 `showConfirm`**

找到：
```js
import { typeLabel, starsHTML, formatDate, escHtml } from '../utils.js';
```

改成：
```js
import { typeLabel, starsHTML, formatDate, escHtml, showConfirm } from '../utils.js';
```

- [ ] **Step 2：在 app.innerHTML 的 card 區塊裡，`完成日期` 那行後面加入開始日期和標籤**

找到：
```js
      ${e.completedDate ? `<p style="font-size:14px;color:var(--text-muted)">完成日期：${formatDate(e.completedDate)}</p>` : ''}
      ${e.rating ? `<div class="stars" style="margin-top:12px;font-size:20px">${starsHTML(e.rating)}</div>` : ''}
```

改成：
```js
      ${e.startDate ? `<p style="font-size:14px;color:var(--text-muted)">開始日期：${formatDate(e.startDate)}</p>` : ''}
      ${e.completedDate ? `<p style="font-size:14px;color:var(--text-muted)">完成日期：${formatDate(e.completedDate)}</p>` : ''}
      ${e.rating ? `<div class="stars" style="margin-top:12px;font-size:20px">${starsHTML(e.rating)}</div>` : ''}
      ${(e.tags && e.tags.length) ? `
        <div class="tags-wrap" style="margin-top:12px">
          ${e.tags.map(t => `<span class="tag-chip-view">${escHtml(t)}</span>`).join('')}
        </div>
      ` : ''}
```

- [ ] **Step 3：把刪除按鈕的 `confirm()` 換成 `showConfirm()`**

找到：
```js
  document.getElementById('btn-delete').addEventListener('click', async () => {
    if (confirm(`確定要刪除「${e.title}」？`)) {
      await deleteEntry(id);
      navigate('library');
    }
  });
```

改成：
```js
  document.getElementById('btn-delete').addEventListener('click', async () => {
    const ok = await showConfirm('刪除紀錄', `確定要刪除「${e.title}」？此動作無法復原。`);
    if (ok) {
      await deleteEntry(id);
      navigate('library');
    }
  });
```

- [ ] **Step 4：存檔**

---

## Task 8：書庫標籤篩選（library.js）

**Files:**
- Modify: `js/views/library.js`

- [ ] **Step 1：在 `renderLibrary()` 裡，`let filterType = 'all';` 那段後面加入 tag 相關變數**

找到：
```js
  let filterType   = 'all';
  let filterStatus = 'all';
  let query = '';
```

改成：
```js
  let filterType   = 'all';
  let filterStatus = 'all';
  let filterTag    = 'all';
  let query = '';

  const allTags = [...new Set(entries.flatMap(e => e.tags || []))].sort();
```

- [ ] **Step 2：在 `filtered()` 函式裡加入標籤過濾條件**

找到：
```js
      if (query && !e.title.toLowerCase().includes(query.toLowerCase()) &&
                   !(e.creator || '').toLowerCase().includes(query.toLowerCase())) return false;
```

在這行後面（`return true;` 前）插入：
```js
      if (filterTag !== 'all' && !(e.tags || []).includes(filterTag)) return false;
```

- [ ] **Step 3：在 `app.innerHTML` 裡第二個 filter-row 後面，加入標籤篩選下拉（有標籤才顯示）**

找到：
```js
    <div class="card" id="list-area"></div>
```

改成：
```js
    ${allTags.length ? `
    <div style="margin-bottom:16px">
      <select id="tag-filter" style="width:100%;padding:10px 14px;border-radius:8px;border:1px solid var(--border);font-size:14px;background:var(--bg);color:var(--text)">
        <option value="all">所有標籤</option>
        ${allTags.map(t => `<option value="${escHtml(t)}">${escHtml(t)}</option>`).join('')}
      </select>
    </div>
    ` : ''}
    <div class="card" id="list-area"></div>
```

- [ ] **Step 4：在現有的 event listener 區塊末尾加入標籤篩選監聽**

找到（在最後一個 `chip-done` listener 之後）：
```js
  document.getElementById('chip-done').addEventListener('click',       () => { filterStatus = 'completed';   render(); });
```

在這行後面加入：
```js

  if (allTags.length) {
    document.getElementById('tag-filter').addEventListener('change', (e) => {
      filterTag = e.target.value;
      render();
    });
  }
```

- [ ] **Step 5：存檔**

---

## Task 9：更新 Service Worker 版本並推上線

**Files:**
- Modify: `sw.js`

- [ ] **Step 1：在 `sw.js` 裡把快取版本從 `v2` 改為 `v3`**

找到：
```js
const CACHE = 'learning-tracker-v2';
```

改成：
```js
const CACHE = 'learning-tracker-v3';
```

- [ ] **Step 2：commit 所有變更**

```bash
git add css/app.css index.html js/utils.js js/app.js js/views/settings.js js/views/dashboard.js js/views/form.js js/views/detail.js js/views/library.js sw.js
git commit -m "feat: 新增年度目標、自訂標籤、修正小問題"
```

- [ ] **Step 3：推上 GitHub**

```bash
git push
```

- [ ] **Step 4：等約 1 分鐘後，用瀏覽器開啟 app 重整兩次，確認**
  - 底部導覽出現「設定」第 4 個 icon
  - 設定頁可以輸入目標數字並儲存
  - 首頁在目標 > 0 時出現進度條
  - 新增/編輯表單有標籤輸入欄
  - 詳細頁有開始日期和標籤顯示
  - 刪除按鈕彈出自訂 modal（不是瀏覽器原生彈窗）
  - 書庫有有標籤時才出現標籤篩選下拉
