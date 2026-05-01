# C2C — Coding to Creating

> AI 驱动的开源编程教学平台 · BYOK（用自己的 LLM API Key）· 完全免费

<p align="center">
  <img src="docs/images/banner.png" alt="C2C Banner" width="800" />
</p>

<p align="center">
  <strong>不只是刷题——真正学会编程。</strong><br/>
  从读懂题目到写出代码，像一位耐心的老师陪在你身边，逐步引导。
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License: MIT" /></a>
  <img src="https://img.shields.io/badge/python-3.12+-green.svg" alt="Python 3.12+" />
  <img src="https://img.shields.io/badge/node-20+-green.svg" alt="Node 20+" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
</p>

[中文](#三步上手) | [English](#why-c2c)

---

## 三步上手

C2C 是开源项目，**不收费、不消耗你的钱**——你用自己申请的 LLM API Key（Anthropic / OpenAI / 通义 / 豆包 / GLM / Gemini 任选其一）。

### 方式 1：下载桌面版（推荐 · 零依赖）

去 [Releases](https://github.com/Charlies2001/C2C-coding-coach/releases) 下载对应平台的包：

| 平台 | 文件 | 怎么用 |
|------|------|--------|
| macOS (Apple Silicon) | `CodingBot-macos-arm64.zip` | 解压拖到「应用程序」 |
| Windows (x64) | `CodingBot-windows-x64.zip` | 解压双击 `CodingBot.exe` |
| Linux (x64) | `CodingBot-linux-x64.tar.gz` | `tar xzf` 后 `./CodingBot/CodingBot` |

启动后会自动打开浏览器，左上角/任务栏角落会出现一个 C2C 系统托盘图标——这是 app 在运行的标志，**关闭浏览器标签后请通过托盘菜单退出**，否则后台还在跑。

#### ⚠️ 首次启动会被系统拦截（无代码签名）

开源项目没买代码签名证书，三个系统都会拦截一次。**只需放行一次，之后不再提示。**

**macOS**（看到「Apple 无法验证 CodingBot 是否包含恶意软件」）：

终端跑一行（最快）：
```bash
xattr -dr com.apple.quarantine /Applications/CodingBot.app
```

或图形化：双击 app → 警告框点「完成」→ 打开 **System Settings → Privacy & Security** → 滚到底部找到 "CodingBot was blocked" → 点 **「Open Anyway」**。

**Windows**（看到 SmartScreen 蓝色「Windows 已保护你的电脑」）：

点警告框里的 **「更多信息」** → 出现 **「仍要运行」** 按钮 → 点它。

**Linux**：通常不会被拦。如果文件没有执行权限，跑 `chmod +x ./CodingBot/CodingBot`。

### 方式 2：Docker 一行命令（自己跑后端）

```bash
git clone https://github.com/Charlies2001/C2C-coding-coach.git
cd C2C-coding-coach
cp backend/.env.example backend/.env
docker compose up -d
open http://localhost:3001
```

### 方式 3：本地开发（贡献代码用）

见 [本地开发](#本地开发不用-docker)。

部署到云服务器对外服务参考 [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)。

---

## 设计初衷

大多数编程平台给你一道题和一个编辑器——然后你就得靠自己了。

C2C 不一样。它的核心理念是**「教会你」而不是「替你做」**：

- **卡住了？** AI 不会直接给答案。它会反问你、引导你的思路、只透露刚好够你继续前进的信息。
- **不知道从哪开始？** 教学模式把每道题拆成 6–8 个章节——语法、数据结构、解题思路、逐步实现——每一章都是根据当前题目实时生成的。
- **代码报错了？** 平台自动识别错误类型，映射到对应的教学章节，一键跳转复习。
- **准备代码面试？** C2C 同样适合正在备战技术面试的同学。通过分章节教学和渐进式提示，帮助你系统性地掌握算法思路和解题模式，而不是死记硬背答案，真正提高学习效率。

C2C 是为**想真正学会编程**的人设计的——无论你是编程初学者，还是正在准备面试的求职者。

---

## 核心功能

### AI 分章节教学

每道题生成定制化多章节课程：

| 章节 | 内容 |
|------|------|
| 读懂代码 | 函数签名、参数、返回值、调用示例 |
| 必备语法 | 仅讲解本题需要的 Python 语法，配最小化示例 |
| 核心数据结构 | 生活类比 → Mermaid 图解 → Python 操作 |
| 解题思路 | 纯文字描述算法逻辑，配合测试用例手动模拟 |
| 逐步实现 | 3–5 个递进步骤，每步都有代码 + 「为什么这样写」 |
| 总结回顾 | 知识清单、核心能力、相似题目方向 |
| 动手实战 | 3–5 个递进小任务，内嵌编辑器，由易到难 |
| 常见错误 *(仅困难)* | ❌ 错误写法 vs ✅ 正确写法对比 |

- 章节数量随难度调整：简单(6)、中等(7)、困难(8)
- 每章感知上下文——AI 阅读所有之前的章节，避免重复
- 包含交互式 Mermaid 算法图解

### 4 级渐进式提示

绝不直接给答案——逐步引导：

| 级别 | 名称 | 你会得到 |
|------|------|---------|
| 1 | 方向引导 | 启发性问题，指向正确方向 |
| 2 | 算法策略 | 具体的数据结构/算法建议 |
| 3 | 伪代码框架 | 逐步逻辑框架 |
| 4 | 关键代码 | 关键代码片段（仍不是完整答案） |

- AI 分析你的当前代码，判断应该给哪一级提示
- 连续 3 次测试失败后自动弹出「需要提示吗？」

### AI 苏格拉底式对话

能看到你的题目、代码、输出和测试结果的对话式导师：

- 通过提问引导，绝不直接给答案
- 帮助调试时追踪执行过程，而不是重写你的代码
- 每道题独立保存对话历史——随时继续
- 快捷键 `⌘L` / `Ctrl+L` 切换

### 浏览器内 Python 运行

- 基于 [Pyodide](https://pyodide.org/)——Python 完全在浏览器中运行
- 零配置，无需服务端执行，即时反馈
- **运行**模式：执行代码，查看 stdout/stderr
- **提交**模式：运行全部测试用例（每题 18–22 个），查看通过/失败明细
- 10 秒超时 + 死循环检测

### 智能错误检测

代码报错时，C2C 不只是显示堆栈信息：

- 提取错误类型（`SyntaxError`、`IndexError`、`RecursionError` 等）
- 映射到最相关的教学章节
- 显示横幅：*「遇到 SyntaxError → 复习『必备语法』章节」*
- 一键跳转到对应章节

### AI 出题

用自然语言创建自定义题目：

- 用一句话描述题目 → AI 生成完整结构
- 输出：标题、难度、分类、描述（Markdown）、代码模板、18–22 个测试用例
- 测试用例覆盖：基础、常规、边界、极端、陷阱场景
- 根据当前 UI 语言生成对应语言的题目
- 保存前可编辑所有内容

### 个性化教学

告诉 AI 你的情况，它会据此调整：

| 维度 | 选项 |
|------|------|
| 编程经验 | 零基础 / 初学者 / 有一定基础 / 熟练 |
| 学习目标 | 面试准备 / 课程作业 / 兴趣爱好 / 技能提升 |
| 学习方式 | 手把手教 / 先讲原理 / 先试后学 / 看例子学 |
| 教学风格 | 专业严谨 / 轻松有趣 / 温暖鼓励 |

64 种组合——每种都会改变 AI 的讲解方式、重点和语气。

### 笔记 & 笔记本

每道题独立存放的个人笔记 + 主题式归档：

- **题目笔记**：在题目页底部，写下思路、踩坑、复习要点，800ms 防抖自动保存
- **笔记本**：把题目按主题归档（如「DP 复习」「字节面试题」）
  - 每条笔记本条目：左侧题目描述（Markdown 渲染） + 可选答案代码，右侧纯笔记
  - 「带答案」开关一键控制是否显示解法代码
  - 显示创建/最近编辑日期
- 笔记和笔记本都存后端 SQLite，**换设备登录后能继续**

### 刷题日历 & 收藏夹

- **GitHub 风格热力图**：26 周刷题记录可视化
  - 4 级深浅显示每天题量
  - 当前连续天数 / 最长连续 / 总题数统计
- **收藏夹**：星标题目，按主题命名分组（前端 localStorage）
- **成长树**：种子 → 发芽 → 幼苗 → 小树 → 大树 → 开花，按已解题数等级跃迁

### 账号 & API Key 安全存储

- **JWT 认证**：注册即用本地账号，密码 bcrypt 哈希
- **API Key Fernet 对称加密**保存到后端 SQLite——前端代码、网络请求、localStorage 都看不到明文
- **多 Provider Key 切换**：可同时存 Anthropic + OpenAI + 通义 + ... 多个 Key，一键切默认
- **桌面 app 数据全本地**：账号、笔记、Key 都在 `~/Library/Application Support/CodingBot/coding_bot.db`

### 多语言支持

- **界面**：中文（默认）、英文、日文、韩文——设置中即时切换
- **种子题目**：10 道经典题目翻译为 4 种语言
- **AI 出题**：根据当前 UI 语言生成
- **AI 教学/提示/对话**：自动使用你正在使用的语言

### 多 LLM 供应商支持

| 供应商 | 默认模型 | 备注 |
|--------|---------|------|
| Anthropic | claude-sonnet-4-6 | 原生 SDK |
| OpenAI | gpt-4o | |
| Google Gemini | gemini-2.0-flash | 通过 OpenAI 兼容 API |
| 阿里通义千问 | qwen-plus | 通过 OpenAI 兼容 API |
| 字节豆包 | doubao-1.5-pro-32k | 通过 OpenAI 兼容 API |
| 智谱 GLM | glm-4-flash | 通过 OpenAI 兼容 API |

在 UI 中配置——无需环境变量。API Key 经 Fernet 对称加密后存储在后端 SQLite，前端任何地方都看不到明文。

---

## 系统架构

<p align="center">
  <img src="docs/images/architecture.png" alt="C2C Architecture" width="800" />
</p>

### 关键设计决策

**SSE 流式传输** — 所有 AI 端点使用 Server-Sent Events。比 WebSocket 简单，能穿透代理，实现教学、提示和对话的逐 token 实时渲染。

**浏览器内 Python 执行** — Pyodide 让 Python 完全在浏览器中运行。无需服务端执行代码，无安全风险，无需沙箱，即时反馈。

**供应商抽象** — Anthropic 使用原生 SDK；其他所有供应商通过 OpenAI SDK + 自定义 `base_url` 路由。新增供应商只需在注册表中加一条记录。

**前后端持久化分工** — 短暂、私密、按题目的状态（对话历史、提示、当前代码草稿、刷题日历进度）走 localStorage；账号、API Key、笔记、笔记本走后端 SQLite + alembic 自动迁移。Key 用 Fernet 对称加密存储。

**桌面 app = 一个 Python 进程** — PyInstaller 把 backend + frontend dist + Pyodide runtime 全打进去；启动后用固定端口 17234 + 系统托盘退出 + ~/Library/Application Support/ 下的用户数据目录。Pyodide 13 MB 本地化，离线也能跑学生代码。

**章节 key 系统** — 教学章节内部使用英文 key（`readCode`、`syntax`、`approach`...），显示时通过 i18n 翻译，与后端通信时使用中文标题。前端保持整洁的同时兼容后端。

---

## 本地开发（不用 Docker）

### 前置要求

- Node.js ≥ 20
- Python ≥ 3.12
- 任一支持的 LLM 供应商的 API Key

### 安装 + 启动

```bash
# 后端（终端 1）
cd backend
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 前端（终端 2）
cd frontend
npm install
npm run dev
```

打开 http://localhost:5173 → 注册账号 → **设置**（齿轮图标）→ 填 API Key → 开始学习。

### 生产部署

公网上线（HTTPS + 外部 PostgreSQL + 结构化日志）请参考 [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)。

---

## 配置

### UI 设置

所有主要配置都在 UI 的**设置弹窗**中完成：

| 设置项 | 说明 |
|--------|------|
| **LLM 供应商** | Anthropic、OpenAI、Gemini、通义千问、豆包、GLM |
| **API Key** | 供应商的 API Key（登录后保存到后端数据库，Fernet 对称加密） |
| **模型** | 可选覆盖（留空使用供应商默认模型） |
| **语言** | 界面语言：中文 / English / 日本語 / 한국어 |

### 环境变量（可选）

在 `backend/.env` 中设置：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `DATABASE_URL` | `sqlite:///./coding_bot.db` | 数据库连接串（生产用 `postgresql://...`） |
| `SEED_LANGUAGE` | `zh-CN` | 首次启动时种子题目的语言（`zh-CN`、`en-US`、`ja-JP`、`ko-KR`） |
| `ANTHROPIC_API_KEY` | — | 备用 API Key（用户配置优先） |
| `JWT_SECRET_KEY` | 启动自动生成 | JWT 签名密钥（生产必须固定） |
| `ENCRYPTION_KEY` | 复用 JWT_SECRET | API Key Fernet 加密密钥（生产建议独立） |
| `CORS_ORIGINS` | `localhost:3000,3001,5173` | 允许的前端源（生产填实际域名） |
| `LOG_FORMAT` | `json` | `json`（生产）或 `text`（开发可读） |
| `LOG_DIR` | — | 设置后日志写到该目录（RotatingFileHandler 10MB × 5） |

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19, TypeScript, Vite 7, Tailwind CSS 4, Zustand, Monaco Editor, React Router 7, qrcode.react |
| 后端 | Python 3.12, FastAPI, SQLAlchemy 2, SQLite / PostgreSQL, Alembic（自动迁移） |
| 认证 / 加密 | python-jose (JWT), bcrypt（密码哈希）, cryptography (Fernet API Key 加密) |
| AI | Anthropic SDK, OpenAI SDK（六大供应商兼容） |
| 代码运行时 | Pyodide 0.27（浏览器内 Python，桌面版本地化离线运行） |
| 图表 | Mermaid.js（教学内容中） |
| 国际化 | i18next + react-i18next（中/英/日/韩） |
| 桌面打包 | PyInstaller, pystray（系统托盘） |
| Web 部署 | Docker Compose + Nginx + Let's Encrypt |

## 项目结构

```
C2C-coding-coach/
├── frontend/                     # React SPA
│   ├── src/
│   │   ├── pages/                # Landing / ProblemList / Problem / Auth / NotebookDetail
│   │   ├── components/
│   │   │   ├── TeachingMode/     # Blackboard, CodeBlock, GuidedCoding, MiniCodeEditor
│   │   │   ├── ProblemWorkspace/ # OutputPanel, HintPanel, NotePanel, ErrorJumpBanner
│   │   │   ├── ProblemList/      # ProblemCard, ProblemFilters, ActivityCalendar, NotebooksPanel
│   │   │   ├── AIChat/           # AIChatPanel
│   │   │   ├── GrowthTree/       # GrowthTree, StatsPanel, TreeSVG
│   │   │   ├── SettingsModal.tsx # API Key + provider 选择 + 6 个 provider 获取教程
│   │   │   └── AddProblemToNotebookModal.tsx
│   │   ├── api/                  # auth, ai, problems, notes, notebooks (REST + SSE)
│   │   ├── i18n/locales/         # zh-CN, en-US, ja-JP, ko-KR
│   │   ├── services/             # Pyodide（VITE_PYODIDE_URL 可切本地/CDN）
│   │   ├── store/                # useStore + useAuthStore (Zustand)
│   │   └── utils/
│   ├── public/pyodide/           # （桌面 build 时由 fetch-pyodide 下载）
│   ├── scripts/fetch-pyodide.mjs
│   ├── Dockerfile
│   ├── nginx.conf                # dev
│   └── nginx-ssl.conf            # prod (HTTPS)
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI 入口，含中间件、SPA 静态托管
│   │   ├── config.py             # 环境变量集中
│   │   ├── auth.py               # JWT + bcrypt + Fernet
│   │   ├── database.py           # SQLAlchemy（SQLite/PG 双模式）
│   │   ├── logging_config.py     # JSON formatter + request_id contextvar
│   │   ├── rate_limit.py         # 异步内存令牌桶
│   │   ├── models/               # user, api_key, problem, note, notebook
│   │   ├── routers/              # auth, problems, ai, notes, notebooks
│   │   ├── services/ai_service.py
│   │   └── seed/                 # 10 道种子题 × 4 语言
│   ├── alembic/versions/         # schema 迁移
│   ├── alembic.ini
│   ├── tests/integration.sh      # 52 项 e2e 回归
│   └── requirements.txt
├── desktop/                      # PyInstaller 桌面 app
│   ├── launcher.py               # 启动器：固定端口 + 系统托盘
│   ├── launcher.spec
│   └── requirements.txt          # pystray, Pillow, pyinstaller
├── docs/
│   ├── DEPLOYMENT.md             # 公网部署（HTTPS / cert / 备份 / 回滚）
│   └── DEV_LOG_2026-04-24.md
├── .github/
│   ├── workflows/desktop-release.yml  # tag push 触发三平台 build
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── docker-compose.yml            # dev
├── docker-compose.prod.yml       # prod (HTTPS)
├── CONTRIBUTING.md
├── LICENSE                       # MIT
└── README.md
```

## API 参考

### 认证（JWT）

| 方法 | 端点 | 说明 |
|------|------|------|
| `POST` | `/api/auth/register` | 注册（返回 access + refresh token） |
| `POST` | `/api/auth/login` | 登录 |
| `POST` | `/api/auth/refresh` | 用 refresh_token 换新 access_token |
| `GET` | `/api/auth/me` | 当前用户信息 |
| `GET` | `/api/auth/api-keys` | 列出已存的 LLM Key（不返回明文） |
| `POST` | `/api/auth/api-keys` | 新增/更新某 provider 的 Key |
| `PUT` | `/api/auth/api-keys/{id}/default` | 切换默认 Key |
| `DELETE` | `/api/auth/api-keys/{id}` | 删除 Key |

### 题目

| 方法 | 端点 | 说明 |
|------|------|------|
| `GET` | `/api/problems/` | 列表（可选 `?difficulty=&category=`） |
| `GET` | `/api/problems/{id}` | 详情 |
| `POST` | `/api/problems/` | 创建（要登录） |
| `PUT` | `/api/problems/{id}` | 修改（要登录） |
| `DELETE` | `/api/problems/{id}` | 删除（要登录） |

### 笔记 & 笔记本

| 方法 | 端点 | 说明 |
|------|------|------|
| `GET` / `PUT` | `/api/notes/{problem_id}` | 单题笔记 GET / 上修改 |
| `GET` / `POST` | `/api/notebooks/` | 列出 / 创建笔记本 |
| `GET` / `PUT` / `DELETE` | `/api/notebooks/{id}` | 笔记本详情 / 改 / 删 |
| `POST` / `PUT` / `DELETE` | `/api/notebooks/{id}/items[/{item_id}]` | 加题 / 改条目 / 删条目 |

### AI（全部通过 SSE 流式传输）

| 方法 | 端点 | 说明 |
|------|------|------|
| `POST` | `/api/ai/chat` | 苏格拉底式对话辅导 |
| `POST` | `/api/ai/hint` | 渐进式提示（自动判断级别） |
| `POST` | `/api/ai/teaching-section` | 生成单个教学章节 |
| `POST` | `/api/ai/teaching` | 教学整体（少用） |
| `POST` | `/api/ai/generate-problem` | 根据描述生成题目 |
| `GET` | `/api/ai/teaching-sections/{difficulty}` | 获取对应难度章节标题 |

所有 AI 端点都受 BYOK 保护：未配置 Key → 400 中文引导；超额 → 429 + Retry-After。

| 方法 | 端点 | 说明 |
|------|------|------|
| `GET` | `/api/health` | 健康检查 |

---

## 开源协议

[MIT](LICENSE)

---

## English

### Why C2C?

Most coding platforms give you a problem and an editor — you're on your own. C2C takes a different approach:

- **You're stuck?** The AI doesn't hand you the answer. It asks you questions, nudges your thinking, and reveals just enough to keep you moving.
- **You don't know where to start?** Teaching Mode breaks the problem down into chapters — syntax, data structures, approach, implementation — each generated specifically for the problem you're working on.
- **You made an error?** The platform detects the error type, maps it to the relevant teaching chapter, and offers a one-click jump to review.
- **Preparing for coding interviews?** C2C is also designed for students preparing for technical interviews. Through chapter-based teaching and progressive hints, it helps you systematically master algorithmic thinking and problem-solving patterns — improving study efficiency instead of rote memorization.

C2C is built for people who want to **learn**, not just copy solutions — whether you're a beginner or preparing for your next job interview.

### Features

**AI Chapter-by-Chapter Teaching** — Each problem gets a custom, multi-chapter lesson (6–8 chapters) with syntax explanation, Mermaid algorithm diagrams, step-by-step implementation, and hands-on practice.

**4-Level Progressive Hints** — Direction → Algorithm Strategy → Pseudocode → Key Code. AI analyzes your current code to determine the right hint level.

**AI Chat Tutor (Socratic Method)** — Sees your problem, code, and output. Guides through questioning, never dumps the answer.

**In-Browser Python Execution** — Powered by Pyodide, zero setup. Run mode for output, Submit mode for all test cases (18–22 per problem). Bundled offline in the desktop app.

**Smart Error Detection** — Auto-detects `SyntaxError`, `IndexError`, etc., maps to teaching chapters, one-click jump to review.

**AI Problem Generation** — Describe a problem in one sentence → AI generates a full LeetCode-style problem (`class Solution`, no imports, 18–22 test cases).

**Personalization** — 4 dimensions × 64 combinations of experience / goal / learning style / teaching tone.

**Notes & Notebooks** — Per-problem auto-saved notes + thematic notebooks where you can collect problems and write solution code alongside the description.

**Activity Calendar** — GitHub-style 26-week heatmap, current/longest streak.

**Account & Encrypted Keys** — JWT auth + bcrypt; LLM API keys are Fernet-encrypted at rest. Supports multiple keys per user with one-click default switching.

**Multi-Language** — UI supports Chinese/English/Japanese/Korean.

**Multi-LLM Support** — Anthropic, OpenAI, Gemini, Qwen, Doubao, GLM — configure in the UI with built-in provider sign-up guides.

### Quick Start

#### Option 1: Download desktop app (recommended, zero deps)

Grab a release for your OS at [Releases](https://github.com/Charlies2001/C2C-coding-coach/releases):
- `CodingBot-macos-arm64.zip` — drag to Applications, then `xattr -dr com.apple.quarantine /Applications/CodingBot.app` to bypass Gatekeeper
- `CodingBot-windows-x64.zip` — unzip and run `CodingBot.exe` (SmartScreen → "More info" → "Run anyway")
- `CodingBot-linux-x64.tar.gz` — `tar xzf` and `./CodingBot/CodingBot`

Launch → tray icon appears → browser opens → register an account → enter your LLM API key in Settings.

#### Option 2: Docker

```bash
git clone https://github.com/Charlies2001/C2C-coding-coach.git
cd C2C-coding-coach
cp backend/.env.example backend/.env
docker compose up -d
open http://localhost:3001
```

#### Option 3: Local dev (for contributors)

```bash
# Backend (terminal 1)
cd backend
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (terminal 2)
cd frontend
npm install
npm run dev   # http://localhost:5173
```

For self-hosted production deployment (HTTPS + PostgreSQL), see [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).
