var CACHE = "freeboard-v2";
var CORE = ["./", "./index.html", "./FreeBoard-单文件版.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png", "./icons/apple-touch-icon.png", "./lib/pdf.min.js", "./lib/pdf.worker.min.js"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE).catch(function () {}); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || req.url.indexOf(location.origin) !== 0) return;
  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) {
        var p = fetch(req).then(function (res) { if (res && res.ok && req.url.indexOf("index.html") < 0) { var cp = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, cp); }); } return res; }).catch(function () { return hit; });
        return p;
      }
      return fetch(req).then(function (res) {
        if (res && res.ok && (req.url.indexOf(location.origin) === 0)) {
          var cp = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, cp); });
        }
        return res;
      }).catch(function () {
        if (req.mode === "navigate") return caches.match("./index.html");
        return Response.error();
      });
    })
  );
});