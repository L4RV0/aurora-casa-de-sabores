// Entrega los videos por partes (respuesta 206), como lo pide Safari en iPhone.
// Cloudflare sirve los archivos estáticos completos, sin partes, así que los
// videos pasan por aquí; el resto de la página se sirve directamente.
export default {
  async fetch(request, env) {
    const res = await env.ASSETS.fetch(new Request(request.url, { method: request.method }));
    const range = request.headers.get('Range');
    const total = Number(res.headers.get('Content-Length'));
    const match = range && /^bytes=(\d*)-(\d*)$/.exec(range.trim());

    if (!match || res.status !== 200 || !total || (!match[1] && !match[2])) {
      const headers = new Headers(res.headers);
      headers.set('Accept-Ranges', 'bytes');
      return new Response(res.body, { status: res.status, headers });
    }

    let start, end;
    if (match[1]) {
      start = Number(match[1]);
      end = match[2] ? Math.min(Number(match[2]), total - 1) : total - 1;
    } else {
      start = Math.max(total - Number(match[2]), 0); // los últimos N bytes
      end = total - 1;
    }
    if (start > end || start >= total) {
      res.body?.cancel();
      return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${total}` } });
    }

    const headers = new Headers(res.headers);
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Content-Range', `bytes ${start}-${end}/${total}`);
    headers.set('Content-Length', String(end - start + 1));
    if (request.method === 'HEAD') return new Response(null, { status: 206, headers });

    return new Response(cortar(res.body, start, end), { status: 206, headers });
  },
};

// Deja pasar solo los bytes entre start y end, sin cargar el video entero en memoria
function cortar(body, start, end) {
  const reader = body.getReader();
  let pos = 0;
  return new ReadableStream({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) { controller.close(); return; }
        const chunkStart = pos;
        pos += value.byteLength;
        if (pos <= start) continue;
        const from = Math.max(start - chunkStart, 0);
        const to = Math.min(end + 1 - chunkStart, value.byteLength);
        controller.enqueue(value.subarray(from, to));
        if (pos > end) { controller.close(); reader.cancel(); }
        return;
      }
    },
    cancel() { reader.cancel(); },
  });
}
