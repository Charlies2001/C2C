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

## 12. 接入支付（支付宝 + 微信支付）

商业模式：BYOK（用户自带 LLM API Key）+ 平台月订阅。两个支付通道同时启用。

### 12.1 前置：必须满足的运营资质

| 项 | 说明 |
|----|------|
| 营业执照 | 微信支付 + 支付宝商户号都强制要求企业主体 |
| 域名 ICP 备案 | 微信支付强制要求；支付宝当面付不强制但建议办 |
| HTTPS 已上线 | webhook 回调 URL 必须是 https；用 DEPLOYMENT.md 第 4 节签发证书 |
| 公网可达回调 URL | 两个 provider 都从公网回调 backend，不能是 IP / 内网 |

### 12.2 支付宝接入

1. 注册 [支付宝开放平台](https://open.alipay.com/) 并完成企业实名
2. 创建「网页&移动应用」→ 添加「当面付」能力（用于扫码）
3. 在「应用信息」→「接口加签方式」生成 RSA2 公私钥对：
   - 上传你的 **应用公钥**
   - 复制平台返回的 **支付宝公钥**
4. 把 4 项写入 `backend/.env.production`：
   ```
   ALIPAY_APP_ID=2021xxxxxxxxxxxx
   ALIPAY_APP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE..."
   ALIPAY_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\nMIIB..."
   ALIPAY_NOTIFY_URL=https://your-domain.com/api/billing/alipay/notify
   ```
5. 在「开发设置」→「应用网关」填同样的 notify URL（接收异步回调）

### 12.3 微信支付接入

1. 注册 [微信支付商户平台](https://pay.weixin.qq.com/) 并完成企业认证
2. 在 [公众平台](https://mp.weixin.qq.com/) 注册「服务号」或「小程序」拿到 AppID
   并在商户平台「关联 AppID」绑定该 AppID
3. 商户平台 → API 安全 → 申请「API 证书」（API v3）
   - 拿到 `apiclient_key.pem`（商户私钥）
   - 拿到「证书序列号」
4. 商户平台 → API 安全 → 设置「APIv3 密钥」（32 位字符串）
5. 6 项写入 `.env.production`：
   ```
   WECHAT_APP_ID=wx0000000000000000
   WECHAT_MCH_ID=1600000000
   WECHAT_API_V3_KEY=32个字符的密钥
   WECHAT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
   WECHAT_CERT_SERIAL_NO=证书序列号大写
   WECHAT_NOTIFY_URL=https://your-domain.com/api/billing/wechat/notify
   WECHAT_CERT_DIR=/var/lib/codingbot/wechat_certs
   ```
6. 在 host 上创建 `WECHAT_CERT_DIR` 并挂载到 backend 容器（SDK 会缓存平台证书）：
   ```bash
   sudo mkdir -p /var/lib/codingbot/wechat_certs
   ```
   并在 `docker-compose.prod.yml` backend 的 volumes 加：
   ```yaml
   - /var/lib/codingbot/wechat_certs:/var/lib/codingbot/wechat_certs
   ```

### 12.4 验证支付通道

启动 backend 后：
```bash
curl -s https://your-domain.com/api/billing/providers
# 应返回 [{"id":"alipay","available":true},{"id":"wechat","available":true}]
```

打开网站登录任意账号，导航栏应显示「升级」按钮 → 点开 → 选支付方式 →
显示二维码 → 用对应 App 扫描完成支付 → 页面在 3 秒内自动刷新为「支付成功」。

### 12.5 常见问题

| 症状 | 排查 |
|------|------|
| /api/billing/providers 显示 available=false | 检查对应 env 是否全部填齐（包括 NOTIFY_URL） |
| 扫码后 App 提示「商家订单异常」 | 多半是签名错误 → 私钥/公钥贴反 / 序列号错 |
| 支付成功但订单状态还是 pending | webhook 没回调到 backend → 检查 nginx 是否暴露 `/api/billing/*/notify` 到公网；ICP 备案未完成 |
| 微信回调返回 401 | API v3 密钥错 / 证书序列号错 / 平台证书过期（重启 backend 自动重新下载） |

---

## 13. 常见故障

| 症状 | 可能原因 | 排查 |
|------|----------|------|
| 502 Bad Gateway 访问 /api | backend 未起或退出 | `docker compose logs backend`，查 alembic 错误 |
| SSL 证书警告 | 证书路径错 / 未签发 | `ls /etc/letsencrypt/live/` 验证目录，重跑 certbot |
| 注册/登录 500 | JWT/ENC 密钥未设 | `docker compose exec backend env \| grep -E 'JWT\|ENCRYPT'` |
| 跨域被拒 | CORS_ORIGINS 没含前端地址 | 更新 .env.production 后 `docker compose restart backend` |
| 日志文件不生成 | `LOG_DIR` 未挂载或权限 | 确认 host `/var/log/codingbot` 存在、容器可写 |
