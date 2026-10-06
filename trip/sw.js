/* 画面とアイコンを端末に置いておく。
   画面（HTML・config.js）は毎回ネットから最新を取り（キャッシュを使わない）、取れないときだけ端末のコピーを使う。
   GASへの問い合わせ（別のドメイン）はそのまま通す */
const CACHE = 'trip-shell-v3';
const FILES = ['./', './index.html', './config.js', './manifest.webmanifest', './apple-touch-icon.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || e.request.method !== 'GET') return;
  const fresh = e.request.mode === 'navigate' || /\.(html|js)$/.test(url.pathname) || url.pathname.endsWith('/');
  e.respondWith(
    fetch(e.request, fresh ? { cache: 'no-store' } : {})
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
