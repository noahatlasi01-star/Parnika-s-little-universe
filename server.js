const http = require("http");
const fs = require("fs");
const path = require("path");
const root = __dirname;
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".txt": "text/plain; charset=utf-8" };
http.createServer((req, res) => {
  let pathname = decodeURIComponent((req.url || "/").split("?")[0]);
  if (pathname === "/") pathname = "/index.html";
  const filePath = path.join(root, pathname);
  if (!filePath.startsWith(root)) { res.writeHead(403); return res.end("Forbidden"); }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream" }); res.end(data);
  });
}).listen(Number(process.env.PORT) || 3000, "0.0.0.0", () => console.log("جهانی کوچک برای تو روی پورت 3000 اجرا شد."));
