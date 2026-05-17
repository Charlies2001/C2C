# Fly.io + Neon 部署指南

把 C2C 部署到 Fly.io，数据库走 [Neon](https://neon.tech)（Postgres），HTTPS 自动签发。
预计耗时：**30–45 分钟**（含等 Fly build）。预计月费：**$5–15**（双区域 Sydney + Tokyo），单区域可降到 $0–5。

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
2. **Region** 选跟 Fly 同区域：**`AWS Asia Pacific (Sydney)`**（跟 fly.toml 的 `primary_region=syd` 对齐，DB 跟 app 之间 < 10ms）
   - 如果未来你的用户主要在中国大陆 / 东亚，再考虑改用 Tokyo / Singapore
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

# 找回密码邮件 — Resend
# 通过 fly secrets set RESEND_API_KEY -a coding-coach 单独交互式输入，避免 token 写在脚本里
# RESEND_API_KEY="re_xxxxxxxx"
# EMAIL_FROM 必须是 Resend 已验证的发送方：
#   未验证 DNS → 暂时用 "CodingBot <onboarding@resend.dev>"（只能发给注册 Resend 的邮箱）
#   验证自有域名后 → "CodingBot <noreply@coding-coach.org>"
fly secrets set EMAIL_FROM="CodingBot <onboarding@resend.dev>"

# APP_BASE_URL 用于拼装重置密码邮件里的链接
fly secrets set APP_BASE_URL="https://coding-coach.org"
```

> Secrets 在 Fly 后台是加密的，跑容器时通过环境变量注入。**绝对不要把这些写进 fly.toml 或 git 提交**。

验证：
```bash
fly secrets list
# 应该看到：DATABASE_URL / JWT_SECRET_KEY / ENCRYPTION_KEY / CORS_ORIGINS
#         + RESEND_API_KEY / EMAIL_FROM / APP_BASE_URL
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

## 4.5 扩到 Sydney + Tokyo 双区域（服务中国大陆 + 澳洲）

Fly 没有中国大陆机房，**Tokyo 是离大陆最近的节点（50–100ms）**。同时跑 Sydney + Tokyo 两个 instance，靠 Fly 的 Anycast 把用户路由到最近节点：

```bash
# 在 syd 和 nrt 各跑 1 台机器
fly scale count 2 --region syd,nrt
# 验证两台都起来了
fly status
# Machines 列应该看到 2 台，分别在 syd 和 nrt
```

**数据库跨区域权衡**：
- Neon 在 Sydney → Sydney Fly 查询 <5ms（最快）
- Tokyo Fly 查询 Sydney Neon → 跨区域 ~100ms RTT
- 对 C2C 影响小：大部分查询是单条 problem / submission（< 5ms 本地查询时间），加上 100ms 跨区往返还在用户可接受范围。**AI 流式响应才是真正的延迟瓶颈**，DB 100ms 几乎看不出来
- 用户量起来后再考虑 Neon Read Replica（付费）放 Tokyo

**国内访问优化**（不需要 ICP 备案）：
- Cloudflare DNS 已经做了一道：用户解析时拿到的是 Fly Anycast IP，自动就近
- 静态资源（JS / CSS / Pyodide）可以让 **Cloudflare 缓存**，国内访问就走 CF 的 Anycast 边缘节点（包括香港、台湾等接近大陆的节点）
- ⚠️ 但 Fly app 端我们之前要求 **DNS only 不开橙云代理**，原因是 Fly 自己处理 TLS。如果只想缓存静态资源，可以：
  - 主域名 `coding-coach.org` 走 DNS only（API 请求直连 Fly）
  - 后续把 `/assets/*` `/pyodide/*` 这些静态路径单独放 Cloudflare R2 / Pages，开橙云加速

> **现阶段先 DNS only 跑通**。等 Tokyo 节点上线后实测国内访问延迟，决定要不要再做 CDN 优化。

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

| 资源 | 当前配置 | 大概月费 |
|---|---|---|
| App · Sydney (shared-cpu-1x · 512MB) | 1 machine, 常驻 | ~$3.19 |
| App · Tokyo (shared-cpu-1x · 512MB) | 1 machine, 常驻 | ~$3.19 |
| 出站流量 | 估 < 100 GB/月 | $0（免费层 160GB） |
| Neon Postgres (Sydney) | 0.5GB Free | $0 |
| Fly SSL 证书 | 1 主域 + 1 www | $0 |
| **总计（早期 < 100 DAU）** | | **~$6-7/月** |

> 如果想降本，把 `min_machines_running` 改回 `0` 就行，但会有 1-2 秒冷启动。
> 早期用户基数不大时其实可以接受。
>
> 如果只用单区域 Sydney，月费可降到 **$0-3**（甚至 $0，全在免费层）。

如果流量上来要升级：
```bash
# Neon 升级到 $19/月 Launch 计划（取消自动休眠 + 更大存储 + Read Replica）
# Fly 扩容到第三个区域
fly scale count 1 --region hkg            # 加香港，更靠近大陆
# 或扩到 2 GB 内存
# fly.toml 改 [[vm]] memory = "1gb" → fly deploy
```

---

## 9. 常见故障

| 症状 | 排查 |
|---|---|
| `fly deploy` build 失败 | 看日志最后几行：通常是 npm install 网络或 Python 包冲突 |
| 部署成功但访问 502 | `fly logs` 看 backend 启动错误（多半是 DATABASE_URL 没设或 Neon 没启动） |
| 证书 stuck 在 `awaiting verification` | Cloudflare 橙云没关，必须 DNS only |
| 国内访问慢/偶尔 timeout | 已有 Tokyo 节点（§4.5），还慢的话考虑加香港 `fly scale count 1 --region hkg`；真要"国内速度"需要 ICP 备案 + 国内 VPS |
| Neon 报 `too many connections` | App 重启太频繁；`fly.toml` 加 `min_machines_running=1` 防止冷启风暴 |
| 跑了几天发现 secret 漏配 | `fly secrets list` 看一眼；漏了直接 `fly secrets set KEY=...` 会自动 rolling restart |

---

## 10. 下次更新代码

### 推荐：GitHub Actions 自动部署（CI 通过即上线）

仓库已配置 `.github/workflows/ci.yml` 中的 `deploy` job：每次 push 到 `main`，
等 pytest + 前端 build + Playwright e2e 全部通过后，自动跑 `flyctl deploy`。

**一次性配置**：

```bash
# 1. 在本地用 flyctl 生成一个长期 token（不要用 fly auth token，那是个人 token，
#    范围太大）。-x 控制过期时间，例如 8760h ≈ 1 年。
fly tokens create deploy -x 8760h -a coding-coach

# 2. 把输出（FlyV1 fm2_...）复制到 GitHub：
#    Settings → Secrets and variables → Actions → New repository secret
#    Name: FLY_API_TOKEN
#    Value: <粘贴 token>
```

配置完成后，日常发布只需：

```bash
git push origin main      # CI 自动跑测试 + 自动 deploy
```

可以在 GitHub Actions 页面看到 deploy 进度，Fly 会照常做 rolling restart。

### 应急：本地手动部署

CI 挂了 / 想跳过测试快速回滚时：

```bash
git push origin main      # 习惯动作
fly deploy                # 让 Fly 拉最新代码 + build + rolling restart
```

`fly deploy` 默认会做无 downtime 滚动升级：先启新机器，健康检查通过后切流量，再关旧机器。
