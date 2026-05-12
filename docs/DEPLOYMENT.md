# CodingBot 生产部署指南

> 目标：云服务器（Ubuntu 22.04+）自建，外部托管 PostgreSQL，Docker Compose + nginx + Let's Encrypt。
> 预计首次部署 30–60 分钟。

---

## 架构概览

```
Internet ──► 云服务器:80/443
            │
            │  frontend 容器（nginx）
            │  ├─ 80: ACME challenge + 301 → HTTPS
            │  ├─ 443: TLS 终止 + 静态 SPA + /api 反向代理
            │  └─ 挂载 /etc/letsencrypt（只读）+ /var/www/certbot
            │
            ▼  Docker 内网（codingbot network）
            │
            backend 容器（FastAPI + uvicorn）
            │  ├─ 未暴露端口，只对内网开放 8000
            │  ├─ 启动自动 alembic upgrade head
            │  └─ 日志写 /var/log/codingbot/codingbot.log
            │
            ▼  TCP
            外部 PostgreSQL（云数据库服务）
```

---

## 0. 前置条件

| 资源 | 说明 |
|------|------|
| 云服务器 | 2 vCPU / 4GB RAM / 40GB SSD 起步；Ubuntu 22.04+ |
| 域名 | A 记录指向服务器公网 IP，含 `@` 和 `www` |
| 防火墙 | 入站开放 80/443；SSH 22 限源 IP |
| PostgreSQL | 外部云 DB，生成连接串 `postgresql://user:pass@host:5432/db` |
| Docker | `docker` + `docker compose`（v2）已安装 |

---

## 1. 拉代码

```bash
git clone <repo-url> /opt/codingbot
cd /opt/codingbot
```

---

## 2. 准备 `.env.production`

```bash
# 生成密钥
python3 -c "import secrets; print('JWT_SECRET_KEY='+secrets.token_urlsafe(32))"
python3 -c "import secrets; print('ENCRYPTION_KEY='+secrets.token_urlsafe(32))"

# 以 .env.example 为模板，写入 backend/.env.production
cp backend/.env.example backend/.env.production
vim backend/.env.production
```

至少需要设置：

```
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<dbname>
JWT_SECRET_KEY=<上一步生成>
ENCRYPTION_KEY=<上一步生成>
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
LOG_FORMAT=json
LOG_DIR=/var/log/codingbot
# 可选：初始 seed 的语言（默认 zh-CN）
# SEED_LANGUAGE=zh-CN
```

**重要**：`.env.production` 必须加入 `.gitignore`（已默认被忽略）。权限收紧：
```bash
chmod 600 backend/.env.production
```

---

## 3. 替换 nginx-ssl.conf 里的域名占位

```bash
# 替换 your-domain.com 为实际域名
sed -i 's/your-domain.com/example.com/g' frontend/nginx-ssl.conf
```

校验结果：`grep server_name frontend/nginx-ssl.conf`。

---

## 4. 首次签发 Let's Encrypt 证书

用 webroot 模式（不需停 nginx）。先确保以下目录存在：

```bash
sudo mkdir -p /etc/letsencrypt /var/www/certbot /var/log/codingbot
sudo chown -R 0:0 /etc/letsencrypt /var/log/codingbot
```

**方案 A — 首次没有证书时**（推荐用 standalone 一次性签发）：

```bash
# 停掉 80 端口监听（如本地 nginx/apache）
# 用 certbot standalone 签发
docker run --rm \
  -p 80:80 \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/www/certbot:/var/www/certbot \
  certbot/certbot:latest certonly --standalone \
    --preferred-challenges http \
    --agree-tos --email your@email.com --no-eff-email \
    -d example.com -d www.example.com
```

签发成功后 `/etc/letsencrypt/live/example.com/` 下应出现 `fullchain.pem` 和 `privkey.pem`。

---

## 5. 启动服务

```bash
cd /opt/codingbot
docker compose -f docker-compose.prod.yml up -d --build

# 观察启动
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f backend
```

预期：
- `backend` 先 healthy（含 `alembic upgrade head` 完成、seed 问题写入）
- `frontend` 随后 healthy（`/healthz` 返回 200）
- `curl -I https://example.com` 返回 200，响应头含 `strict-transport-security` + `x-frame-options` 等

---

## 6. 证书续期（自动化）

Let's Encrypt 证书 90 天有效。用 host cron 触发续期：

```bash
sudo crontab -e
```

添加：
```
0 3 * * * docker run --rm -v /etc/letsencrypt:/etc/letsencrypt -v /var/www/certbot:/var/www/certbot certbot/certbot:latest renew --webroot -w /var/www/certbot --quiet && docker compose -f /opt/codingbot/docker-compose.prod.yml exec -T frontend nginx -s reload
```

每天凌晨 3 点检查续期（到期前 30 天才实际续）。

---

## 7. 日志查看

```bash
# Backend JSON 日志（容器 stdout + 落盘）
tail -f /var/log/codingbot/codingbot.log

# 过滤某个 request_id
grep '"request_id": "abc123"' /var/log/codingbot/codingbot.log | jq .

# 按用户 ID 追踪
grep '"user_id": 42' /var/log/codingbot/codingbot.log | jq .

# 实时容器日志
docker compose -f docker-compose.prod.yml logs -f
```

---

## 8. 数据库备份

云 PG 服务一般提供自动快照。若需手动：

```bash
pg_dump "$DATABASE_URL" | gzip > backup-$(date +%F).sql.gz
```

恢复：
```bash
gunzip -c backup-2026-04-24.sql.gz | psql "$DATABASE_URL"
```

---

## 9. 滚动发布

```bash
cd /opt/codingbot
git pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
# 等 healthcheck 通过
docker compose -f docker-compose.prod.yml ps
```

**注意**：含 schema 变更时，alembic 会在 backend 启动自动执行 `upgrade head`。若升级失败，backend 容器会立即退出，旧版本 nginx 仍继续对外服务（但 `/api` 会 502）。回滚步骤见下。

---

## 10. 回滚

```bash
cd /opt/codingbot
git log --oneline -5               # 找到上一个稳定 commit
git checkout <prev-commit>
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

**数据库 downgrade**（仅在 schema 变更需要回滚时）：
```bash
docker compose -f docker-compose.prod.yml exec backend \
  alembic -c alembic.ini downgrade -1
```

---

## 11. 健康检查清单（首次上线前）

- [ ] `.env.production` 已创建，权限 600，含 JWT/ENC/DATABASE_URL/CORS
- [ ] `nginx-ssl.conf` 域名已替换
- [ ] `/etc/letsencrypt/live/<domain>/fullchain.pem` 存在
- [ ] `curl -I https://your-domain.com` 返回 200 + HSTS 头
- [ ] `curl -I http://your-domain.com` 返回 301 → https
- [ ] 注册新用户、登录、访问 `/api/auth/me` 正常
- [ ] `/api/problems/` 返回 10 条 seed
- [ ] 浏览器打开显示 SPA，点击题目可进入
- [ ] 日志文件 `/var/log/codingbot/codingbot.log` 有 JSON 行输出
- [ ] 续期 cron 已添加（`sudo crontab -l`）

---

## 12. 监控告警（Uptime Kuma + ntfy）

`docker-compose.prod.yml` 已经内置可选的 **Uptime Kuma** 容器，加上 backend 暴露的 `/api/metrics` JSON 端点，可以做轻量监控告警，零成本。

### 12.1 启动 Uptime Kuma

Kuma 跟 backend / frontend 一起启动：
```bash
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps  # 应该看到 codingbot-uptime-kuma running
```

Kuma 默认**只绑定 127.0.0.1:3010**（防止 dashboard 公网裸奔），通过 SSH 隧道访问：
```bash
ssh -L 3010:127.0.0.1:3010 user@your-server
# 浏览器打开 http://localhost:3010
```
首次访问会要求创建管理员账号。

### 12.2 三个核心 Monitor

在 Kuma UI 里 **Add New Monitor**，建议至少配这三个：

| Name | Type | 配置 |
|---|---|---|
| **CodingBot Health** | HTTP(s) | URL: `https://your-domain.com/api/health` · Interval 60s · 接受 status 200 |
| **CodingBot Metrics** | HTTP(s) - Keyword | URL: `https://your-domain.com/api/metrics` · Keyword: `"status":"ok"` · Interval 60s |
| **AI 失败率** | HTTP(s) - Keyword | URL: `https://your-domain.com/api/metrics` · Keyword (反向): `"ai_failure_ratio":0.` (>0.5 触发 — 详见下） · Interval 5m |

> `/api/metrics` 输出累计计数器 + 几个比率字段。`"status":"ok"` 是恒定关键字，进程活着就有；如果 backend 真挂了，整个 HTTP 调用会失败 → Kuma 触发告警。

**进阶（监控 AI 失败率）**：Kuma keyword 不支持数值阈值，可以反向匹配——预期 `ai_failure_ratio` 在 0.0-0.4 之间：用 keyword `"ai_failure_ratio":0.[0-4]`。失败率超过 0.5 时这个 keyword 不再匹配 → 告警。简单但够用。

### 12.3 接入 ntfy 推送

ntfy.sh 是开源消息推送，免费免账号 self-hosted 也方便。

**最简方案（用公网 ntfy.sh）**：
1. 随便起一个 topic 名字（足够长足够随机）：`codingbot-$(openssl rand -hex 8)`
2. 手机装 ntfy app → Subscribe to topic
3. Kuma 里 **Settings → Notifications → Setup Notification**：
   - Type: `ntfy`
   - Server URL: `https://ntfy.sh`
   - Topic: 上一步的 topic 名
   - Priority: `high`
   - 测试发送 → 手机收到推送 = 接通
4. 每个 Monitor 的 Settings 勾上这个 Notification

**生产建议（self-hosted ntfy）**：把 topic 名当密码一样保护即可。如果想真隔离，可以自己跑一个 ntfy 服务：
```bash
docker run -d --name ntfy --restart unless-stopped \
  -p 127.0.0.1:8011:80 \
  -v /var/lib/ntfy:/var/cache/ntfy \
  binwiederhier/ntfy serve --base-url http://localhost:8011
```

### 12.4 告警策略建议

| 监控项 | 触发条件 | Severity | 行动 |
|---|---|---|---|
| Health | 连续 2 次 60s 失败 | Critical | 立即 SSH 上去看 `docker compose logs backend` |
| Metrics keyword | 连续 2 次 60s 失败 | Critical | 同上 |
| AI 失败率 | 5min 内匹配失败 | Warning | 看 `ai_calls_failed` 增量；可能是某个 provider Key 失效 |
| Cert 到期 | Kuma 内置 SSL Cert monitor | Warning | certbot renew 失败警报 |

⚠️ **不要把 5xx > 0 当告警**：测试请求、用户操作错误都会触发，会很吵。看 5xx **rate** 才有意义（用 ratio 字段或 Grafana 自己算）。

### 12.5 metrics 端点字段

```json
{
  "requests_total": 12345,
  "responses_5xx": 3,
  "responses_4xx": 87,
  "ai_calls_total": 542,
  "ai_calls_failed": 8,
  "ai_cache_read_tokens": 230000,    // Anthropic prompt cache 节省的 input tokens
  "ai_cache_write_tokens": 35000,
  "uptime_seconds": 86400.0,
  "ai_cache_hit_ratio": 0.868,       // read / (read + write)
  "ai_failure_ratio": 0.014,
  "status": "ok"
}
```

> 计数器**每次重启清零**。需要长期保留就让 Kuma / Prometheus / Grafana 周期拉取并自己存储 delta。

---

## 13. 常见故障

| 症状 | 可能原因 | 排查 |
|------|----------|------|
| 502 Bad Gateway 访问 /api | backend 未起或退出 | `docker compose logs backend`，查 alembic 错误 |
| SSL 证书警告 | 证书路径错 / 未签发 | `ls /etc/letsencrypt/live/` 验证目录，重跑 certbot |
| 注册/登录 500 | JWT/ENC 密钥未设 | `docker compose exec backend env \| grep -E 'JWT\|ENCRYPT'` |
| 跨域被拒 | CORS_ORIGINS 没含前端地址 | 更新 .env.production 后 `docker compose restart backend` |
| 日志文件不生成 | `LOG_DIR` 未挂载或权限 | 确认 host `/var/log/codingbot` 存在、容器可写 |
