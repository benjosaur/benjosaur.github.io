interface Env {
  POLLS: KVNamespace;
}

const ALLOWED_ORIGINS = new Set([
  'https://benjosaur.github.io',
  'http://localhost:4321',
  'http://127.0.0.1:4321',
]);

const ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/i;

function corsHeaders(origin: string | null): HeadersInit {
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : '';
  return {
    'access-control-allow-origin': allow,
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    vary: 'Origin',
  };
}

function json(body: unknown, init: ResponseInit = {}, origin: string | null = null): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
      ...corsHeaders(origin),
      ...(init.headers ?? {}),
    },
  });
}

async function readCount(kv: KVNamespace, key: string): Promise<number> {
  const v = await kv.get(key);
  const n = v ? parseInt(v, 10) : 0;
  return Number.isFinite(n) ? n : 0;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = req.headers.get('origin');
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const url = new URL(req.url);
    const match = url.pathname.match(/^\/poll\/([^/]+)\/?$/);
    if (!match) return json({ error: 'not found' }, { status: 404 }, origin);

    const id = decodeURIComponent(match[1]);
    if (!ID_RE.test(id)) return json({ error: 'bad id' }, { status: 400 }, origin);

    if (req.method === 'GET') {
      const [yes, no] = await Promise.all([
        readCount(env.POLLS, `yes:${id}`),
        readCount(env.POLLS, `no:${id}`),
      ]);
      return json({ yes, no }, {}, origin);
    }

    if (req.method === 'POST') {
      let body: { vote?: unknown };
      try {
        body = await req.json();
      } catch {
        return json({ error: 'bad body' }, { status: 400 }, origin);
      }
      const vote = body.vote;
      if (vote !== 'yes' && vote !== 'no') {
        return json({ error: 'vote must be "yes" or "no"' }, { status: 400 }, origin);
      }
      const key = `${vote}:${id}`;
      const current = await readCount(env.POLLS, key);
      await env.POLLS.put(key, String(current + 1));
      const [yes, no] = await Promise.all([
        readCount(env.POLLS, `yes:${id}`),
        readCount(env.POLLS, `no:${id}`),
      ]);
      return json({ yes, no }, {}, origin);
    }

    return json({ error: 'method not allowed' }, { status: 405 }, origin);
  },
} satisfies ExportedHandler<Env>;
