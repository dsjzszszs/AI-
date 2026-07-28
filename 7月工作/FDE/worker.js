/**
 * FDE训练营 · Cloudflare Worker 后端
 * 接收 apply.html 提交的报名表单，写入 D1 数据库
 *
 * 部署步骤：
 * 1. 在 Cloudflare 控制台创建 D1 数据库：npx wrangler d1 create fde-signup
 * 2. 在 wrangler.toml 中绑定 D1 到 Worker
 * 3. 执行建表 SQL：npx wrangler d1 execute fde-signup --file=schema.sql
 * 4. 部署 Worker：npx wrangler deploy
 */

export default {
  async fetch(request, env) {
    // CORS 头
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers, status: 204 });
    }

    const url = new URL(request.url);

    // POST /api/signup - 接收报名
    if (request.method === 'POST' && url.pathname === '/api/signup') {
      try {
        const { name, phone, goal } = await request.json();

        // 基本校验
        if (!name || !phone) {
          return Response.json(
            { ok: false, message: '姓名和手机号为必填项' },
            { status: 400, headers }
          );
        }

        // 写入 D1
        await env.DB.prepare(
          `INSERT INTO signups (name, phone, goal) VALUES (?, ?, ?)`
        ).bind(name, phone, goal || '').run();

        return Response.json({ ok: true, message: '报名成功' }, { headers });

      } catch (err) {
        return Response.json(
          { ok: false, message: '服务器错误，请稍后重试' },
          { status: 500, headers }
        );
      }
    }

    // 其他请求 404
    return new Response('Not Found', { status: 404, headers });
  }
};
