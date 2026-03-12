# AI 编程教学平台 — 技术报告

## 一、项目概述

**AI 编程教学平台** 是一款面向零基础编程学习者的全栈 Web 应用，集成了**在线代码编辑与执行**、**AI 自适应教学**、**渐进式提示系统**和**智能对话辅导**四大核心能力。用户可以在浏览器内完成"学习 → 练习 → 求助 → 巩固"的完整学习闭环，无需安装任何开发环境。

### 核心设计理念

| 理念 | 实现方式 |
|------|----------|
| 零门槛 | 浏览器内 Python 执行（Pyodide），无需本地环境 |
| 自适应 | 根据题目难度动态调整教学章节数量和内容深度 |
| 不直接给答案 | 苏格拉底式提问 + 4 级渐进提示，引导学生自主思考 |
| 即时反馈 | 实时代码运行 + 自动测试用例验证 |

---

## 二、技术架构

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌───────────┐ │
│  │  Monaco   │ │ Teaching │ │  AI Chat  │ │  Hint     │ │
│  │  Editor   │ │ Blackboard│ │  Panel   │ │  Panel    │ │
│  └────┬─────┘ └────┬─────┘ └─────┬─────┘ └─────┬─────┘ │
│       │             │             │             │        │
│  ┌────▼─────────────▼─────────────▼─────────────▼────┐  │
│  │              Zustand Store (全局状态)               │  │
│  └────┬──────────────────────────────────────────────┘  │
│       │                                                  │
│  ┌────▼────┐  ┌────────────┐                            │
│  │ API 层  │  │  Pyodide   │  ← 浏览器内 Python 运行时  │
│  └────┬────┘  └────────────┘                            │
└───────┼─────────────────────────────────────────────────┘
        │ HTTP / SSE (Server-Sent Events)
┌───────▼─────────────────────────────────────────────────┐
│                   Backend (FastAPI)                       │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Problems  │  │  AI Service  │  │   Settings       │  │
│  │ Router    │  │  (Anthropic) │  │   Router         │  │
│  └────┬─────┘  └──────┬───────┘  └──────────────────┘  │
│       │                │                                 │
│  ┌────▼────┐   ┌──────▼───────┐                         │
│  │ SQLite  │   │ Claude API   │                         │
│  │ (题库)  │   │ (Sonnet 4.6) │                         │
│  └─────────┘   └──────────────┘                         │
└─────────────────────────────────────────────────────────┘
```

### 技术栈总览

| 层级 | 技术选型 | 版本 |
|------|----------|------|
| **前端框架** | React + TypeScript | 19.2 / 5.9 |
| **构建工具** | Vite | 7.3 |
| **样式方案** | Tailwind CSS | 4.2 |
| **状态管理** | Zustand | 5.0 |
| **代码编辑器** | Monaco Editor (@monaco-editor/react) | 4.7 |
| **Python 运行时** | Pyodide (WebAssembly) | 0.27.5 |
| **Markdown 渲染** | react-markdown + remark-gfm | 10.1 |
| **语法高亮** | react-syntax-highlighter (Prism) | - |
| **面板布局** | react-resizable-panels | 4.6 |
| **后端框架** | FastAPI | 0.134 |
| **数据库** | SQLite + SQLAlchemy | - |
| **AI 模型** | Anthropic Claude Sonnet 4.6 | - |
| **路由** | React Router DOM | 7.13 |

---

## 三、项目结构

```
coding-bot/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI 入口，挂载路由 + CORS + 数据库初始化
│   │   ├── config.py               # 环境变量配置（ANTHROPIC_API_KEY）
│   │   ├── database.py             # SQLAlchemy 引擎与会话管理
│   │   ├── models/
│   │   │   └── problem.py          # Problem ORM 模型
│   │   ├── schemas/
│   │   │   └── problem.py          # Pydantic 请求/响应模型
│   │   ├── routers/
│   │   │   ├── problems.py         # 题目 CRUD 接口
│   │   │   └── ai.py               # AI 相关接口（聊天/提示/教学）
│   │   ├── services/
│   │   │   └── ai_service.py       # AI 核心逻辑（流式生成）
│   │   └── seed/
│   │       └── problems.py         # 11 道种子题目数据
│   ├── .env                        # 环境变量（API Key）
│   └── coding_bot.db               # SQLite 数据库文件
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                 # 路由配置（题目列表 / 做题页）
│   │   ├── main.tsx                # React 入口
│   │   ├── index.css               # 全局样式 + 自定义动画
│   │   ├── types/
│   │   │   └── problem.ts          # TypeScript 类型定义
│   │   ├── api/
│   │   │   ├── problems.ts         # 题目 API 客户端
│   │   │   └── ai.ts               # AI API 客户端（SSE 流式）
│   │   ├── store/
│   │   │   └── useStore.ts         # Zustand 全局状态管理
│   │   ├── services/
│   │   │   └── pyodide.ts          # Pyodide 加载与代码执行
│   │   ├── hooks/
│   │   │   ├── usePyodide.ts       # Pyodide 初始化 Hook
│   │   │   └── useHintTrigger.ts   # 提示触发逻辑 Hook
│   │   ├── pages/
│   │   │   ├── ProblemListPage.tsx  # 题目列表页
│   │   │   └── ProblemPage.tsx      # 做题工作区页
│   │   └── components/
│   │       ├── Navbar.tsx           # 顶部导航栏
│   │       ├── SettingsModal.tsx    # 设置弹窗（API Key）
│   │       ├── ProblemWorkspace/
│   │       │   ├── CodeEditor.tsx        # Monaco 代码编辑器
│   │       │   ├── ProblemDescription.tsx # 题目描述面板
│   │       │   ├── OutputPanel.tsx        # 输出 + 测试结果面板
│   │       │   └── HintPanel.tsx          # 渐进提示面板
│   │       ├── ProblemList/
│   │       │   ├── ProblemCard.tsx        # 题目卡片组件
│   │       │   └── ProblemFilters.tsx     # 筛选器组件
│   │       ├── TeachingMode/
│   │       │   ├── Blackboard.tsx         # 教学黑板主界面
│   │       │   ├── CodeBlock.tsx          # 语法高亮 + 复制 + 试运行
│   │       │   └── MiniCodeEditor.tsx     # 内嵌迷你编辑器
│   │       └── AIChat/
│   │           └── AIChatPanel.tsx        # AI 对话面板
│   ├── package.json
│   ├── vite.config.ts              # Vite 配置（含 API 代理）
│   └── tsconfig.json
│
└── .gitignore
```

---

## 四、核心功能模块详解

### 4.1 在线代码执行引擎

**技术方案**：Pyodide — CPython 的 WebAssembly 编译版本，在浏览器中运行完整的 Python 3 解释器。

**工作流程**：
1. 页面加载时异步加载 Pyodide（~11MB，CDN 缓存）
2. 用户点击「运行」→ 将代码注入 Pyodide 沙箱执行
3. 通过重定向 `sys.stdout` / `sys.stderr` 捕获输出
4. 10 秒超时保护，防止死循环
5. 测试用例逐个执行，对比实际输出与预期输出

**优势**：完全客户端执行，无需后端计算资源，无安全风险，支持离线运行。

```typescript
// 核心执行函数签名
async function runPythonCode(
  code: string,
  helperCode?: string,    // 辅助代码（如 ListNode 定义）
  timeoutMs?: number      // 超时时间，默认 10s
): Promise<{ stdout: string; stderr: string; error: string | null }>
```

### 4.2 AI 自适应教学系统

**核心设计**：根据题目难度（Easy / Medium / Hard）动态生成不同数量和深度的教学章节。

| 难度 | 章节数 | 差异 |
|------|--------|------|
| Easy | 5 | 去掉「核心数据结构」，聚焦基础语法 |
| Medium | 6 | 完整 6 章标准教学流程 |
| Hard | 7 | 增加「常见错误分析」章节 |

**教学章节设计**：

| 章节 | Token 上限 | 教学策略 |
|------|-----------|----------|
| 读懂代码框架 | 1536 | 逐行拆解函数、生活类比、调用示例 |
| 必备语法 | 2048 | **强制使用对比表格**（语法\|含义\|用途\|示例） |
| 核心数据结构 | 2048 | 生活物品类比 + ASCII 状态变化图 |
| 解题思路 | 2048 | 生活类比 + 编号步骤 + 手动模拟，**禁止写代码** |
| 逐步实现 | 4096 | 分 3-5 步代码块 + 解释，最终完整代码 |
| 常见错误分析 | 2048 | ❌ 错误写法 → ✅ 正确写法（仅 Hard 题） |
| 总结回顾 | 1024 | 知识清单 + 核心能力 + 类似题方向 |

**上下文衔接机制**：每生成新章节时，自动将前面已完成章节的内容（截断至 12000 字符）作为上下文传递给 AI，并指示"请递进讲解，不要重复"。

### 4.3 渐进式提示系统

**设计哲学**：永远不直接给答案，而是根据学生代码状态智能判断该给哪个级别的提示。

```
级别 1（思路方向）→ 级别 2（算法策略）→ 级别 3（伪代码框架）→ 级别 4（关键代码）
```

**两阶段工作流**：
1. **分析阶段**：用 Claude 分析学生当前代码，判断应给出哪个级别
2. **生成阶段**：根据判定级别 + 已给过的提示内容，流式生成新提示

**智能触发**：连续测试失败 ≥ 2 次时自动弹出"需要提示吗？"的引导气泡。

### 4.4 AI 对话辅导

采用**苏格拉底式教学法**，系统 Prompt 明确规定：
- 绝不直接给出完整答案
- 通过提问引导学生发现问题
- Bug 引导策略：先问学生代码在做什么 → 引导手动追踪 → 指出"什么错了"，让学生自己修

对话上下文包含：题目信息、学生当前代码、执行输出、测试结果，实现精准辅导。

### 4.5 交互功能矩阵

| 功能 | 实现方式 | 位置 |
|------|----------|------|
| 代码语法高亮 | react-syntax-highlighter + oneDark 主题 | CodeBlock.tsx |
| 代码复制按钮 | Clipboard API，hover 时右上角显示 | CodeBlock.tsx |
| 内嵌代码编辑器 | Python 代码块 ≥2 行 → 「试一试」按钮 → Monaco + Pyodide | MiniCodeEditor.tsx |
| 重新生成章节 | 清空内容后重新调用 streamTeachingSection | Blackboard.tsx |
| 章节可折叠 | collapsedMap 状态 + 标题点击切换 | Blackboard.tsx |
| 生成进度条 | 渐变进度条 + 实时状态文本 | Blackboard.tsx |

---

## 五、API 设计

### 5.1 题目管理

| 方法 | 端点 | 功能 |
|------|------|------|
| GET | `/api/problems` | 获取题目列表（支持 difficulty/category 过滤） |
| GET | `/api/problems/{id}` | 获取题目详情 |
| POST | `/api/problems` | 创建题目 |
| PUT | `/api/problems/{id}` | 更新题目 |
| DELETE | `/api/problems/{id}` | 删除题目 |

### 5.2 AI 服务

| 方法 | 端点 | 功能 | 传输方式 |
|------|------|------|----------|
| POST | `/api/ai/chat` | AI 对话 | SSE 流式 |
| POST | `/api/ai/hint` | 渐进提示 | SSE 流式 |
| POST | `/api/ai/teaching-section` | 生成单个教学章节 | SSE 流式 |
| GET | `/api/ai/teaching-sections/{difficulty}` | 获取对应难度的章节列表 | JSON |

**SSE 协议格式**：
```
data: {"content": "流式文本片段"}     ← 内容块
data: {"level": 2}                    ← 提示级别（仅 hint）
data: {"error": "错误信息"}            ← 错误
data: [DONE]                          ← 流结束
```

### 5.3 设置

| 方法 | 端点 | 功能 |
|------|------|------|
| GET | `/api/settings/api-key-status` | 检查 API Key 配置状态 |
| POST | `/api/settings/api-key` | 更新 API Key |

---

## 六、数据模型

### 6.1 后端 — Problem 模型

```python
class Problem(Base):
    id: int              # 主键
    title: str           # 题目标题（如 "两数之和"）
    slug: str            # URL 友好标识（如 "two-sum"）
    difficulty: str      # "Easy" | "Medium" | "Hard"
    category: str        # "数组" | "字符串" | "链表" | "树" | "动态规划"
    description: str     # Markdown 格式题目描述
    starter_code: str    # Python 初始代码模板
    helper_code: str     # 辅助代码（如 ListNode 类定义）
    test_cases: JSON     # [{"input": "...", "expected": "..."}]
```

### 6.2 前端 — 状态管理

Zustand Store 管理以下状态域：

| 状态域 | 关键字段 | 持久化 |
|--------|----------|--------|
| 题目 | currentProblem, problems | — |
| 编辑器 | code, output, isRunning | — |
| 测试 | testResults | — |
| AI 聊天 | chatMessages, chatProblemId | localStorage (per problem) |
| 提示 | hints, hintProblemId, consecutiveFailures | localStorage (per problem) |
| 教学 | teachingSections, teachingDifficulty, currentSection | localStorage v2 (per problem) |
| 全局 | pyodideReady, difficultyFilter, categoryFilter | — |

**localStorage v2 格式**（教学数据）：
```json
{
  "version": 2,
  "difficulty": "Medium",
  "sections": [
    { "title": "读懂代码框架", "content": "..." },
    ...
  ]
}
```
自动兼容旧版纯数组格式，无缝迁移。

---

## 七、题库内容

当前内置 11 道种子题目，覆盖 5 大分类：

| # | 题目 | 难度 | 分类 |
|---|------|------|------|
| 1 | 两数之和 (Two Sum) | Easy | 数组 |
| 2 | 反转字符串 (Reverse String) | Easy | 字符串 |
| 3 | 最大子数组和 (Maximum Subarray) | Medium | 数组 |
| 4 | 有效的字母异位词 (Valid Anagram) | Easy | 字符串 |
| 5 | 反转链表 (Reverse Linked List) | Easy | 链表 |
| 6 | 合并两个有序链表 (Merge Two Sorted Lists) | Easy | 链表 |
| 7 | 二叉树的最大深度 (Maximum Depth of Binary Tree) | Easy | 树 |
| 8 | 翻转二叉树 (Invert Binary Tree) | Easy | 树 |
| 9 | 爬楼梯 (Climbing Stairs) | Easy | 动态规划 |
| 10 | 最长回文子串 (Longest Palindromic Substring) | Medium | 字符串 |
| 11 | 零钱兑换 (Coin Change) | Medium | 动态规划 |

---

## 八、性能优化策略

| 优化点 | 技术方案 |
|--------|----------|
| **流式渲染防抖** | 200ms 定时器批量更新 Markdown，避免逐 token 触发 React 重渲染 |
| **Markdown 缓存** | 已完成章节使用 `useMemo` 缓存渲染结果，切换章节不重新解析 |
| **代码高亮轻量化** | 使用 react-syntax-highlighter (Prism) 而非 Monaco 做只读高亮，加载快 |
| **Pyodide 懒加载** | 页面加载后异步初始化，不阻塞首屏渲染 |
| **SSE 流式传输** | AI 内容采用 Server-Sent Events 逐块传输，用户无需等待完整生成 |
| **按需加载章节** | 教学模式逐章生成，用户手动触发下一章，节省 API 调用 |
| **Token 分配** | 每章独立 max_tokens（1024-4096），避免浪费也确保关键章节内容充足 |

---

## 九、安全设计

| 安全点 | 措施 |
|--------|------|
| API Key 保护 | 存储于后端 `.env`，前端仅显示掩码（`sk-...xxxx`） |
| 代码执行隔离 | Pyodide 在 WebAssembly 沙箱内运行，无法访问文件系统或网络 |
| 执行超时 | 10 秒硬性超时，防止恶意死循环 |
| .gitignore | 排除 `.env`、`node_modules`、`.venv`、数据库文件 |
| CORS 配置 | 后端限定允许的跨域来源 |

---

## 十、开发与部署

### 本地开发

```bash
# 后端
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt   # 或使用 pyproject.toml
cp .env.example .env              # 填入 ANTHROPIC_API_KEY
uvicorn app.main:app --reload --port 8000

# 前端
cd frontend
npm install
npm run dev                        # Vite 开发服务器，自动代理 /api → localhost:8000
```

### 访问地址
- 前端：`http://localhost:5173`
- 后端 API：`http://localhost:8000`
- API 文档：`http://localhost:8000/docs`（FastAPI 自动生成）

---

## 十一、未来规划方向

| 方向 | 说明 |
|------|------|
| 用户系统 | 注册登录、学习进度跟踪、做题记录 |
| 更多语言支持 | JavaScript、Java、C++ 代码执行 |
| 题目难度扩展 | Hard 题库补充、竞赛级别题目 |
| 学习数据分析 | 错误模式识别、薄弱点推荐 |
| 移动端适配 | 响应式布局优化、触屏代码编辑 |
| 多模型支持 | 可切换不同 AI 模型（GPT-4、Gemini 等） |
| 协作功能 | 师生互动、代码评审 |

---

*本报告基于项目当前版本编写，技术架构与功能可能随后续迭代更新。*
