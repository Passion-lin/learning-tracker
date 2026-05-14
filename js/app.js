import { initDB } from './db.js';
import { initRouter } from './router.js';
import { renderDashboard } from './views/dashboard.js';
import { renderLibrary } from './views/library.js';
import { renderForm } from './views/form.js';
import { renderDetail } from './views/detail.js';

async function main() {
  await initDB();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  initRouter({
    dashboard: () => renderDashboard(),
    library:   () => renderLibrary(),
    add:       () => renderForm(),
    edit:      (params) => renderForm(params.id),
    detail:    (params) => renderDetail(params.id),
  });
}

main().catch(err => {
  document.getElementById('app').textContent = '載入失敗，請重新整理。';
  console.error(err);
});
