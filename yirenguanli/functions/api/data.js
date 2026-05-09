/**
 * Cloudflare Pages Function: /api/data
 * 处理日程数据的读取与保存（绑定 KV 命名空间 SCHEDULE_KV）
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  const json = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });

  try {
    if (request.method === 'GET') {
      const raw = await env.SCHEDULE_KV.get('schedule');
      const data = raw ? JSON.parse(raw) : { days: [], lastUpdated: null, version: 1 };
      return json(data);
    }

    if (request.method === 'POST') {
      const body = await request.json();
      body.lastUpdated = new Date().toISOString();
      await env.SCHEDULE_KV.put('schedule', JSON.stringify(body));
      return json({ ok: true, lastUpdated: body.lastUpdated });
    }

    return json({ error: 'Method Not Allowed' }, 405);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}
