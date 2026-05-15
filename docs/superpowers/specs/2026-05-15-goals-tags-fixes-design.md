# Learning Tracker — 目標設定、自訂標籤、小修正 設計規格

Date: 2026-05-15

## 範圍

本次新增三個功能群：

1. **年度目標設定** — 設定頁 + 首頁進度條
2. **自訂標籤** — 表單新增、詳細頁顯示、書庫篩選
3. **小問題修正** — 開始日期顯示、完成日期自動填、自訂刪除 modal

---

## 1. 導覽列變更

`index.html` 底部導覽新增第 4 個項目：

```
首頁 ｜ ＋新增 ｜ 書庫 ｜ ⚙️設定
```

路由新增 `settings` → `renderSettings()`

---

## 2. 目標設定

### 資料儲存
- 使用 `localStorage`，key 為 `learning-goals`
- 結構：`{ bookGoal: number, videoGoal: number }`
- 預設值：`{ bookGoal: 0, videoGoal: 0 }`（0 表示未設定，不顯示進度條）

### 設定頁（`js/views/settings.js`）
- 標題「目標設定」
- 兩個數字輸入欄：今年書籍目標（本）、今年影片目標（部）
- 儲存後顯示「已儲存」提示，回到當前頁面

### 首頁進度條
- 只在目標 > 0 時顯示
- 顯示在統計卡下方
- 格式：`已完成 7 / 12 本　▓▓▓▓▓░░░░░　58%`
- 進度條使用 CSS，達標時顏色變深

---

## 3. 自訂標籤

### 資料模型
- `Entry` 新增欄位 `tags: string[]`，預設 `[]`
- 舊資料沒有此欄位時視為空陣列，不需要 migration

### 表單（`js/views/form.js`）
- 標籤輸入區：顯示已選標籤 chips + 文字輸入框
- 輸入後按 Enter 或逗號新增標籤
- 點 × 移除標籤
- 輸入框下方顯示「過去用過的標籤」（從所有 entries 收集），點選即加入
- 標籤字串 trim、去重、長度上限 20 字元

### 詳細頁（`js/views/detail.js`）
- 有標籤時顯示 chips，排在狀態 badge 下方

### 書庫（`js/views/library.js`）
- 篩選區新增標籤下拉選單（`<select>`）
- 選項從所有 entries 的 tags 動態收集、排序
- 無任何 entry 有標籤時不顯示此下拉

---

## 4. 小問題修正

### 4a. 詳細頁補開始日期
- `js/views/detail.js` 在「完成日期」同一區塊顯示「開始日期」
- 只在 `e.startDate` 有值時顯示

### 4b. 完成日期自動填今天
- `js/views/form.js` 狀態 select 的 `change` 事件
- 當值變為 `completed` 且 `f-completed` 欄位為空時，填入今天日期
- 不覆蓋已有的日期

### 4c. 自訂刪除確認 modal
- 新增 `.modal-overlay` + `.modal-box` CSS 樣式
- 取代 `confirm()`，顯示書名並提供「確定刪除」（danger）和「取消」兩個按鈕
- 使用 Promise 包裝，呼叫方式與原本一致

---

## 修改檔案清單

| 檔案 | 變更 |
|---|---|
| `index.html` | 導覽列加設定項目、theme-color 已更新 |
| `js/app.js` | 新增 settings 路由 |
| `js/views/settings.js` | 新增 |
| `js/views/dashboard.js` | 讀取目標、顯示進度條 |
| `js/views/form.js` | 標籤 UI、完成日期自動填 |
| `js/views/detail.js` | 顯示標籤、開始日期 |
| `js/views/library.js` | 標籤篩選下拉 |
| `js/utils.js` | 新增 `today()` 已存在，確認可複用 |
| `css/app.css` | 進度條、tag chips、modal 樣式 |

---

## 不在本次範圍

- 跨年度目標（每年手動設定一次即可）
- 標籤管理頁（新增/刪除全域標籤）
- 資料備份匯出（另立規格）
