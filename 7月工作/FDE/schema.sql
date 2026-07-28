-- FDE训练营 · D1 数据库建表语��
-- 在 Cloudflare 控制台或 wrangler CLI 执行：
-- npx wrangler d1 execute fde-signup --file=schema.sql

CREATE TABLE IF NOT EXISTS signups (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  phone      TEXT NOT NULL,
  wechat     TEXT DEFAULT '',
  city       TEXT DEFAULT '',
  goal       TEXT DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
