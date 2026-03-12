# C2C — Coding to Creating

> **v1.0** · AI-Powered Programming Education Platform

<p align="center">
  <strong>Not just practice — truly understand programming.</strong><br/>
  Progressive guidance from understanding problems to writing code, like having a patient teacher by your side.
</p>

[English](#why-c2c) | [中文](#中文说明)

---

## Why C2C?

Most coding platforms give you a problem and an editor — you're on your own. C2C takes a different approach:

- **You're stuck?** The AI doesn't hand you the answer. It asks you questions, nudges your thinking, and reveals just enough to keep you moving.
- **You don't know where to start?** Teaching Mode breaks the problem down into chapters — syntax, data structures, approach, implementation — each generated specifically for the problem you're working on.
- **You made an error?** The platform detects the error type, maps it to the relevant teaching chapter, and offers a one-click jump to review.

C2C is built for people who want to **learn**, not just copy solutions.

---

## Features

### AI Chapter-by-Chapter Teaching

Each problem gets a custom, multi-chapter lesson generated in real-time:

| Chapter | What It Covers |
|---------|---------------|
| Understanding the Code | Function signature, parameters, return value, call examples |
| Essential Syntax | Only the Python syntax needed for this problem, with minimal examples |
| Core Data Structures | Life analogies → Mermaid diagrams → Python operations |
| Problem-Solving Approach | Algorithm logic in plain language, no code — hand simulation with test cases |
| Step-by-Step Implementation | 3–5 incremental steps, each with code + "why we write it this way" |
| Summary & Review | Knowledge checklist, core abilities, similar problem directions |
| Hands-On Practice | 3–5 progressive mini-tasks with embedded editor, from easy to hard |
| Common Errors *(Hard only)* | ❌ Wrong vs ✅ Correct code comparison |

- Chapter count adapts to difficulty: Easy (6), Medium (7), Hard (8)
- Each chapter is context-aware — the AI reads all previous chapters to avoid repetition
- Includes interactive Mermaid diagrams for algorithm visualization

### 4-Level Progressive Hints

Never gives the answer directly — guides you step by step:

| Level | Name | What You Get |
|-------|------|-------------|
| 1 | Direction | Thought-provoking questions to point you the right way |
| 2 | Algorithm Strategy | Specific data structure / algorithm suggestion |
| 3 | Pseudocode | Step-by-step logic framework |
| 4 | Key Code | Critical code snippets (still not the full solution) |

- AI analyzes your current code to determine the right hint level
- Auto-triggers a "need a hint?" nudge after 3 consecutive test failures

### AI Chat Tutor (Socratic Method)

A conversational tutor that sees your problem, code, output, and test results:

- Guides through questioning, never dumps the answer
- Helps debug by tracing execution, not by rewriting your code
- Conversation persisted per problem — pick up where you left off
- Toggle with `⌘L` / `Ctrl+L`

### In-Browser Python Execution

- Powered by [Pyodide](https://pyodide.org/) — Python runs entirely in your browser
- Zero setup, no server-side execution, instant feedback
- **Run** mode: execute your code, see stdout/stderr
- **Submit** mode: run all test cases (18–22 per problem), see pass/fail breakdown
- 10-second timeout with infinite loop detection

### Smart Error Detection

When your code throws an error, C2C doesn't just show the traceback:

- Extracts the error type (`SyntaxError`, `IndexError`, `RecursionError`, etc.)
- Maps it to the most relevant teaching chapter
- Shows a banner: *"Got a SyntaxError → Review the 'Essential Syntax' chapter"*
- One-click jump to the right chapter

### AI Problem Generation

Create custom problems from natural language:

- Describe a problem in one sentence → AI generates full structure
- Output: title, difficulty, category, description (Markdown), starter code, 18–22 test cases
- Test cases cover: basic, normal, edge, extreme, and trap scenarios
- Generated in the UI language (Chinese, English, Japanese, Korean)
- Edit everything before saving

### Personalization

Tell the AI about yourself, and it adapts:

| Dimension | Options |
|-----------|---------|
| Experience | Zero / Beginner / Intermediate / Advanced |
| Goal | Interview Prep / Coursework / Hobby / Skill Building |
| Learning Style | Step-by-step / Theory First / Trial & Error / Learn by Example |
| Teaching Tone | Professional / Casual & Fun / Warm & Encouraging |

64 possible profiles — each changes how the AI explains, what it emphasizes, and how it speaks.

### Collections & Bookmarks

- Star problems to bookmark them
- Organize problems into named collections
- Filter the problem list by collection
- Create, rename, delete collections

### Growth Tree

A visual gamification element tracking your progress:

**Seed → Sprout → Seedling → Small Tree → Big Tree → Flowering Tree**

Solves are tracked per problem with difficulty breakdown and solve history.

### Multi-Language Support

- **UI**: Chinese (default), English, Japanese, Korean — switch instantly in Settings
- **Seed Problems**: 10 classic problems translated into all 4 languages
- **AI Generation**: Problems created in the current UI language
- **AI Teaching/Hints/Chat**: Responds in the language you're using

### Multi-LLM Provider Support

| Provider | Default Model | Notes |
|----------|--------------|-------|
| Anthropic | claude-sonnet-4-6 | Native SDK |
| OpenAI | gpt-4o | |
| Google Gemini | gemini-2.0-flash | Via OpenAI-compatible API |
| Alibaba Qwen | qwen-plus | Via OpenAI-compatible API |
| ByteDance Doubao | doubao-1.5-pro-32k | Via OpenAI-compatible API |
| Zhipu GLM | glm-4-flash | Via OpenAI-compatible API |

Configure in the UI — no environment variables needed. API keys stored in browser localStorage.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│  ┌───────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Monaco    │  │ Pyodide  │  │ localStorage │  │
│  │  Editor    │  │ (Python) │  │ (state, chat,│  │
│  │           │  │          │  │  hints, etc.) │  │
│  └───────────┘  └──────────┘  └──────────────┘  │
│  ┌─────────────────────────────────────────────┐ │
│  │  React 19 + Zustand + i18next               │ │
│  │  Tailwind CSS 4 + React Router 7            │ │
│  └──────────────────┬──────────────────────────┘ │
└─────────────────────┼───────────────────────────┘
                      │ /api/* (REST + SSE streaming)
┌─────────────────────┼───────────────────────────┐
│  FastAPI Backend     │                           │
│  ┌──────────────────┴──────────────────────────┐ │
│  │  Routers: /api/problems, /api/ai/*          │ │
│  └──────────────────┬──────────────────────────┘ │
│  ┌──────────────────┴──────────────────────────┐ │
│  │  AI Service (multi-provider abstraction)    │ │
│  │  ┌──────────┐ ┌──────────┐ ┌────────────┐  │ │
│  │  │Anthropic │ │ OpenAI   │ │Qwen/Doubao/│  │ │
│  │  │  SDK     │ │  SDK     │ │ GLM/Gemini │  │ │
│  │  └──────────┘ └──────────┘ └────────────┘  │ │
│  └─────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────┐ │
│  │  SQLAlchemy + SQLite                        │ │
│  └─────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

### Key Design Decisions

**SSE Streaming for AI responses** — All AI endpoints use Server-Sent Events. Simpler than WebSockets, works through proxies, and gives real-time token-by-token rendering for teaching, hints, and chat.

**In-browser Python execution** — Pyodide runs Python entirely in the browser. No server-side code execution means no security risks, no sandboxing needed, and instant feedback.

**Provider abstraction** — Anthropic uses its native SDK; all other providers route through the OpenAI SDK with custom `base_url`. Adding a new provider is one entry in the registry.

**Per-problem localStorage persistence** — Chat history, hints, teaching content, and code are all stored per-problem in localStorage. No authentication needed, works offline, and data stays private.

**Section key-based system** — Teaching chapters use English keys internally (`readCode`, `syntax`, `approach`...), display via i18n translation, and communicate with the backend using Chinese titles. This keeps the frontend clean while maintaining backward compatibility.

---

## Quick Start

### Prerequisites

- Node.js ≥ 18
- Python ≥ 3.10
- An API key from any supported LLM provider

### 1. Clone & Install

```bash
git clone https://github.com/Charlies2001/C2C.git
cd C2C

# Backend
cd backend
cp .env.example .env
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### 2. Run

```bash
# Terminal 1 — Backend
cd backend
uvicorn app.main:app --reload

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open http://localhost:5173 → click **Settings** (gear icon) → select provider → enter API key → start learning.

### Docker (one command)

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

Open http://localhost:3000.

---

## Configuration

### UI Settings

All primary configuration is done through the **Settings modal** in the UI:

| Setting | Description |
|---------|-------------|
| **LLM Provider** | Anthropic, OpenAI, Gemini, Qwen, Doubao, GLM |
| **API Key** | Your provider's API key (stored in browser localStorage) |
| **Model** | Optional override (leave empty for provider's default) |
| **Language** | UI language: 中文 / English / 日本語 / 한국어 |

### Environment Variables (optional)

Set in `backend/.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:///./coding_bot.db` | Database connection string |
| `SEED_LANGUAGE` | `zh-CN` | Language for seed problems on first run (`zh-CN`, `en-US`, `ja-JP`, `ko-KR`) |
| `ANTHROPIC_API_KEY` | — | Fallback API key (UI config takes priority) |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS 4, Zustand, Monaco Editor, React Router 7 |
| Backend | Python 3.12, FastAPI, SQLAlchemy, SQLite |
| AI | Anthropic SDK, OpenAI SDK (multi-provider) |
| Code Runtime | Pyodide 0.27 (in-browser Python) |
| Diagrams | Mermaid.js (in teaching content) |
| i18n | i18next + react-i18next |
| Deployment | Docker + Nginx |

## Project Structure

```
C2C/
├── frontend/                     # React SPA
│   ├── src/
│   │   ├── pages/                # LandingPage, ProblemListPage, ProblemPage
│   │   ├── components/
│   │   │   ├── TeachingMode/     # Blackboard, CodeBlock, GuidedCoding, MiniCodeEditor
│   │   │   ├── ProblemWorkspace/ # OutputPanel, HintPanel, ErrorJumpBanner
│   │   │   ├── ProblemList/      # ProblemCard, ProblemFilters, CollectionFilterChips
│   │   │   ├── AIChat/           # AIChatPanel
│   │   │   └── GrowthTree/      # GrowthTree, StatsPanel, TreeSVG
│   │   ├── api/                  # REST + SSE streaming clients
│   │   ├── i18n/locales/         # zh-CN, en-US, ja-JP, ko-KR
│   │   ├── services/             # Pyodide integration
│   │   ├── store/                # Zustand state (per-problem persistence)
│   │   └── utils/                # Section titles, error mapping
│   ├── Dockerfile
│   └── nginx.conf
├── backend/
│   ├── app/
│   │   ├── main.py               # App entry, auto-migration, seed logic
│   │   ├── config.py             # Environment settings
│   │   ├── database.py           # SQLAlchemy engine
│   │   ├── models/               # Problem model
│   │   ├── routers/
│   │   │   ├── problems.py       # CRUD endpoints
│   │   │   └── ai.py             # Streaming AI endpoints
│   │   ├── services/
│   │   │   └── ai_service.py     # Multi-provider AI, prompt engineering
│   │   └── seed/                 # 10 problems × 4 languages
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
├── LICENSE                       # MIT
└── README.md
```

## API Reference

### Problems

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/problems` | List problems (optional `?difficulty=&category=`) |
| `GET` | `/api/problems/:id` | Get single problem |
| `POST` | `/api/problems` | Create problem |
| `DELETE` | `/api/problems/:id` | Delete problem |

### AI (all streaming via SSE)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/chat` | Socratic tutoring chat |
| `POST` | `/api/ai/hint` | Progressive hint (auto-detects level) |
| `POST` | `/api/ai/teaching-section` | Generate single teaching chapter |
| `POST` | `/api/ai/generate-problem` | Generate problem from description |
| `GET` | `/api/ai/teaching-sections/:difficulty` | List chapter titles for difficulty |
| `GET` | `/api/health` | Health check |

---

## License

[MIT](LICENSE)

---

## 中文说明

### 设计初衷

大多数编程平台给你一道题和一个编辑器——然后你就得靠自己了。

C2C 不一样。它的核心理念是**「教会你」而不是「替你做」**：

- **卡住了？** AI 不会直接给答案。它会反问你、引导你的思路、只透露刚好够你继续前进的信息。
- **不知道从哪开始？** 教学模式把每道题拆成 6–8 个章节——语法、数据结构、解题思路、逐步实现——每一章都是根据当前题目实时生成的。
- **代码报错了？** 平台自动识别错误类型，映射到对应的教学章节，一键跳转复习。

C2C 是为**想真正学会编程**的人设计的，不是为了复制答案。

### 核心功能

**AI 分章节教学** — 每道题生成定制化多章节课程（6–8 章），包含语法讲解、Mermaid 算法图解、逐步实现、动手实战练习。

**4 级渐进式提示** — 方向引导 → 算法策略 → 伪代码框架 → 关键代码片段。AI 根据你的代码状态自动判断应该给哪一级。

**AI 苏格拉底式对话** — 看得到你的题目、代码和运行结果，通过提问引导你自己解决问题。

**浏览器内 Python 运行** — 基于 Pyodide，无需安装任何环境。运行模式看输出，提交模式跑全部测试用例（每题 18–22 个）。

**智能错误检测** — 自动识别 `SyntaxError`、`IndexError` 等错误类型，推荐跳转到对应教学章节。

**AI 出题** — 用一句话描述题目 → AI 生成完整题目结构（标题、描述、代码模板、测试用例），支持根据当前语言生成对应语言的题目。

**个性化教学** — 4 个维度（经验、目标、学习方式、教学风格），64 种组合，AI 据此调整教学方式。

**收藏夹 & 成长树** — 收藏管理、难度分布统计、成长可视化（种子 → 大树）。

**多语言** — 界面支持中/英/日/韩即时切换，种子题目和 AI 生成题目均支持多语言。

**多 LLM 支持** — Anthropic、OpenAI、Gemini、通义千问、豆包、智谱 GLM，在设置中选择即可。

### 快速开始

```bash
git clone https://github.com/Charlies2001/C2C.git
cd C2C

# 后端
cd backend
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload

# 前端（新终端）
cd frontend
npm install
npm run dev
```

打开 http://localhost:5173 → 点击右上角 **设置**（齿轮图标）→ 选择供应商 → 输入 API Key → 开始学习。

### Docker 一键启动

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

打开 http://localhost:3000。

### 环境变量

在 `backend/.env` 中设置（均为可选）：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `DATABASE_URL` | `sqlite:///./coding_bot.db` | 数据库连接字符串 |
| `SEED_LANGUAGE` | `zh-CN` | 首次启动时种子题目的语言 |
| `ANTHROPIC_API_KEY` | — | 备用 API Key（界面配置优先） |
