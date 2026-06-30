self.addEventListener('fetch', (event) => {
    // 拦截请求，并直接返回网络请求的结果
    event.respondWith(fetch(event.request));
});