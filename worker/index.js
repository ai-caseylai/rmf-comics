const MIME = {
  html: "text/html; charset=utf-8",
  css: "text/css; charset=utf-8",
  js: "application/javascript",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  json: "application/json",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let key = decodeURIComponent(url.pathname.slice(1));
    if (!key) key = "index.html";

    const obj = await env.ASSETS.get(key);
    if (!obj) {
      if (!key.includes(".")) {
        const fallback = await env.ASSETS.get("index.html");
        if (fallback) {
          return new Response(fallback.body, {
            headers: { "content-type": "text/html; charset=utf-8" },
          });
        }
      }
      return new Response("Not Found", { status: 404 });
    }

    const headers = new Headers();
    obj.writeHttpMetadata(headers);
    headers.set("etag", obj.httpEtag);
    headers.set("cache-control", "public, max-age=86400");

    const ext = key.split(".").pop();
    if (MIME[ext]) headers.set("content-type", MIME[ext]);

    return new Response(obj.body, { headers });
  },
};
