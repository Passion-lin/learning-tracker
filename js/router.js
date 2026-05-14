let routes = {};

export function navigate(hash) {
  window.location.hash = hash;
}

function parseHash() {
  const raw = window.location.hash.slice(1) || 'dashboard';
  const [name, query] = raw.split('?');
  const params = {};
  if (query) {
    query.split('&').forEach((p) => {
      const [k, v] = p.split('=');
      params[decodeURIComponent(k)] = decodeURIComponent(v || '');
    });
  }
  return { name, params };
}

function updateNav(name) {
  document.querySelectorAll('.nav-item').forEach((el) => {
    const href = el.getAttribute('href')?.slice(1);
    el.classList.toggle('active', href === name);
  });
}

async function handleRoute() {
  const { name, params } = parseHash();
  updateNav(name);
  const handler = routes[name];
  if (handler) {
    try {
      await handler(params);
    } catch (err) {
      document.getElementById('app').innerHTML =
        `<p class="empty">頁面載入失敗，請重新整理。</p>`;
      console.error(err);
    }
  } else {
    document.getElementById('app').innerHTML =
      `<p class="empty">找不到頁面：${name}</p>`;
  }
}

export function initRouter(routeMap) {
  routes = routeMap;
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
