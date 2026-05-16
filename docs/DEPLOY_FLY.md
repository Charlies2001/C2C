# Fly.io + Neon 部署指南

把 C2C 部署到 Fly.io，数据库走 [Neon](https://neon.tech)（Postgres），HTTPS 自动签发。
预计耗时：**30–45 分钟**（含等 Fly build）。预计月费：**$0–5**（小流量在免费层内）。

---

## 0. 前置

- 已注册 Fly.io 账号（沿用旧账号），本机装好 `fly` CLI：

  ```bash
  # macOS
  brew install flyctl
  # 或
  curl -L https://fly.io/install.sh | sh
  ```

- Cloudflare 已经买好 `coding-coach.org`，DNS 控台可登
- Neon 账号（用 GitHub / Google 一键登录就行）

---

## 1. Neon: 创建 Postgres 数据库

1. 打开 https://console.neon.tech → 新建项目（**Project**）
2. **Region** 选跟 Fly 同区域：东京 `Asia Pacific (Tokyo)`（跟 fly.toml 的 `primary_region=nrt` 对齐，减少跨区域延迟）
3. **Postgres version** 默认 16 就行
4. 创建后页面会展示一串 **Connection string**，形如：

   ```
   postgres://username:password@ep-xxxx-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

   **完整复制下来**，下一步要用。

> Neon 免费层：**0.5GB 存储 + 自动 idle 休眠**。对早期完全够。

---

## 2. Fly: 创建 app

```bash
fly auth login           # 已登录可跳过
cd ~/Desktop/coding-bot
fly apps create coding-coach        # app 名要跟 fly.toml 里一致
```

如果 `coding-coach` 已被占用：换个名（如 `c2c-coding-coach`），同时改 `fly.toml` 顶部 `app = "..."`。

---

## 3. 设置 secrets（敏感配置）

```bash
# 数据库连接串 — 把 Neon 给你的整串贴进来
fly secrets set DATABASE_URL="postgres://用户名:密码@ep-xxx.tokyo.aws.neon.tech/neondb?sslmode=require"

# JWT 签名密钥
fly secrets set JWT_SECRET_KEY="$(openssl rand -base64 32)"

# Fernet 加密密钥（用来加密用户存的 API Key）
fly secrets set ENCRYPTION_KEY="$(python3 -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())')"

# 允许的前端来源
fly secrets set CORS_ORIGINS="https://coding-coach.org,https://www.coding-coach.org"
```

> Secrets 在 Fly 后台是加密的，跑容器时通过环境变量注入。**绝对不要把这些写进 fly.toml 或 git 提交**。

验证：
```bash
fly secrets list
# 应该看到 4 个 key：DATABASE_URL / JWT_SECRET_KEY / ENCRYPTION_KEY / CORS_ORIGINS
```

---

## 4. 部署

```bash
fly deploy
```

第一次部署慢，约 **5–10 分钟**（Fly 要在远端 build 镜像）。会看到：

```
==> Building image
==> Pushing image
==> Creating release
==> Monitoring deployment
  v0 [job] running 1/1 → smoke pass → deployed successfully
```

Fly 启动后立刻 alembic 会自动跑 migration 在 Neon 上建表 + seed 10 道题目。看日志确认：

```bash
fly logs
# 应该看到：alembic.runtime.migration: Running upgrade ...
#          Uvicorn running on http://0.0.0.0:8080
```

默认拿到的 fly 域名访问就能用：`https://coding-coach.fly.dev`

---

## 5. 绑定自有域名 + HTTPS

### 5.1 在 Fly 端登记证书

```bash
fly certs create coding-coach.org
fly certs create www.coding-coach.org    # 可选，让 www 也通
```

执行后 Fly 会告诉你**两套 DNS 记录**：A 记录 + AAAA 记录（IPv4 + IPv6 Anycast IP），或者 CNAME。**复制下来**。

### 5.2 在 Cloudflare 加 DNS

登录 Cloudflare → 选 `coding-coach.org` 域 → **DNS** 标签：

| Type | Name | Content | Proxy status |
|---|---|---|---|
| A | `coding-coach.org` | Fly 给的 IPv4 | **DNS only**（灰云，**不开橙云**）|
| AAAA | `coding-coach.org` | Fly 给的 IPv6 | DNS only |
| CNAME | `www` | `coding-coach.fly.dev` | DNS only |

**⚠️ 千万不要开 Cloudflare 橙云代理**（默认是开的，必须手动改成"DNS only"）：原因 Fly 自己处理 TLS 终止 + Anycast，两层代理冲突会导致证书签发失败。

### 5.3 等证书签发

```bash
fly certs show coding-coach.org
# 等到 Certificate Status: Ready 即可
```

通常 **30 秒–5 分钟**。等不到就 `fly certs check coding-coach.org` 看 DNS 验证状态。

### 5.4 浏览器访问

```
https://coding-coach.org
```

应该看到 LandingPage。完事。

---

## 6. 上线后 smoke test

```bash
# 健康检查
curl -sf https://coding-coach.org/api/health
# {"status":"ok"}

# 题目列表（10 条 seed）
curl -sf https://coding-coach.org/api/problems/ | jq 'length'
# 10

# Metrics
curl -sf https://coding-coach.org/api/metrics | jq
```

再浏览器：
- [ ] LandingPage 打开正常
- [ ] 点「开始练习」跳 `/auth`（未登录）或 `/problems`（已登录）
- [ ] 注册一个新账号
- [ ] 设置里粘贴一个 LLM API Key
- [ ] 进任意题目，跑 Run / Submit 都通

---

## 7. 日常运维

| 操作 | 命令 |
|---|---|
| 看实时日志 | `fly logs` |
| 重新部署 | `fly deploy` |
| 改环境变量 | `fly secrets set KEY=value`（自动 rolling restart） |
| 升级机器配置 | 改 `fly.toml` 里 `[[vm]]` 部分 → `fly deploy` |
| 扩容到多区域 | `fly scale count 2 --region nrt,sin` |
| ssh 进去看 | `fly ssh console` |
| Neon 数据库管理 | https://console.neon.tech → 你的 project → SQL editor / Backups |

---

## 8. 成本控制

| 资源 | 当前配置 | 免费层覆盖？ | 超出后单价 |
|---|---|---|---|
| App（shared-cpu-1x · 512MB · 1 machine） | 1 instance | ✅ 免费层 3 个 256MB 共 8GB-hour/月 | $0.0000022/秒 |
| 出站流量 | 100 GB/月 | ✅ 免费层 160GB/月 | $0.02/GB（北美/欧洲） |
| Neon Postgres | 0.5GB | ✅ 免费层 0.5GB + 自动休眠 | $0.04/GB/月 |
| Fly SSL 证书 | 1 个 | ✅ 免费 | — |
| **总计（早期 < 100 DAU）** | | | **$0/月** |

如果流量上来：
```bash
# 让机器常驻不休眠（首字节响应更快）
# fly.toml: min_machines_running = 1
fly deploy

# Neon 升级到 $19/月 Launch 计划（取消自动休眠 + 更大存储）
```

---

## 9. 常见故障

| 症状 | 排查 |
|---|---|
| `fly deploy` build 失败 | 看日志最后几行：通常是 npm install 网络或 Python 包冲突 |
| 部署成功但访问 502 | `fly logs` 看 backend 启动错误（多半是 DATABASE_URL 没设或 Neon 没启动） |
| 证书 stuck 在 `awaiting verification` | Cloudflare 橙云没关，必须 DNS only |
| 国内访问慢/偶尔 timeout | Fly 没有国内节点；可以在 Cloudflare 开 Argo Smart Routing（付费），或者另外起一个国内备案的镜像节点 |
| Neon 报 `too many connections` | App 重启太频繁；`fly.toml` 加 `min_machines_running=1` 防止冷启风暴 |
| 跑了几天发现 secret 漏配 | `fly secrets list` 看一眼；漏了直接 `fly secrets set KEY=...` 会自动 rolling restart |

---

## 10. 下次更新代码

```bash
git push origin main      # 同步到 GitHub（习惯动作）
fly deploy                # 让 Fly 拉最新代码 + build + rolling restart
```

`fly deploy` 默认会做无 downtime 滚动升级：先启新机器，健康检查通过后切流量，再关旧机器。
