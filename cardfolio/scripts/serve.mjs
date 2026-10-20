import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await realpath(fileURLToPath(new URL('../', import.meta.url)));
const host = '127.0.0.1';
const port = 4173;
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.md': 'text/plain; charset=utf-8',
};

function withinRoot(path) {
  const part = relative(root, path);
  return !isAbsolute(part) && part !== '..' && !part.startsWith(`..${sep}`);
}

function reply(response, status, message, head = false) {
  response.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(head ? undefined : message);
}

const server = createServer(async (request, response) => {
  const head = request.method === 'HEAD';
  if (request.method !== 'GET' && !head) {
    response.setHeader('Allow', 'GET, HEAD');
    reply(response, 405, 'Method not allowed');
    return;
  }

  try {
    const pathname = decodeURIComponent(new URL(request.url, `http://${host}:${port}`).pathname);
    if (pathname.includes('\0') || pathname.split(/[\\/]/).some((part) => part.startsWith('.'))) {
      reply(response, 403, 'Forbidden', head);
      return;
    }
    let candidate = resolve(root, `.${pathname}`);
    if (!withinRoot(candidate)) {
      reply(response, 403, 'Forbidden', head);
      return;
    }
    if ((await stat(candidate)).isDirectory()) candidate = resolve(candidate, 'index.html');
    // A resolved symlink must remain under the static directory too.
    const target = await realpath(candidate);
    if (!withinRoot(target) || relative(root, target).split(/[\\/]/).some((part) => part.startsWith('.'))) {
      reply(response, 403, 'Forbidden', head);
      return;
    }
    if (!(await stat(target)).isFile()) {
      reply(response, 404, 'Not found', head);
      return;
    }
    const content = await readFile(target);
    response.writeHead(200, {
      'Content-Type': mime[extname(target).toLowerCase()] || 'application/octet-stream',
      'Content-Length': content.length,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(head ? undefined : content);
  } catch (error) {
    const status = error instanceof URIError || error.code === 'ERR_INVALID_URL' ? 400
      : ['ENOENT', 'ENOTDIR', 'EISDIR'].includes(error.code) ? 404 : 500;
    reply(response, status, status === 400 ? 'Bad request' : status === 404 ? 'Not found' : 'Server error', head);
  }
});

server.on('error', (error) => {
  console.error(error.code === 'EADDRINUSE'
    ? `Port ${port} is already in use. Stop the existing preview server and try again.`
    : `Preview server failed: ${error.message}`);
  process.exitCode = 1;
});
server.listen(port, host, () => console.log(`Folio preview: http://${host}:${port}\nPress Ctrl+C to stop.`));
