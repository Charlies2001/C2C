# 贡献指南

感谢你想为 CodingBot 出一份力！本项目是一个 BYOK（用户自带 LLM API Key）的开源
编程教学平台，欢迎任何形式的贡献。

## 开发环境

```bash
git clone <your-fork-url>
cd codingbot

# 后端
cd backend
pip install -r requirements.txt
cp .env.example .env
# 至少把 JWT_SECRET_KEY 和 ENCRYPTION_KEY 填上
python -m uvicorn app.main:app --reload --port 8000

# 前端（另一个终端）
cd frontend
npm install
npm run dev
```

打开 http://localhost:5173/ 即可。

## 提交 PR 之前

1. **跑集成测试**：`bash backend/tests/integration.sh`，全过再提
2. **TypeScript 不能有错**：`cd frontend && npx tsc --noEmit`
3. **commit 信息中文 + 前缀**：`feat:`、`fix:`、`docs:`、`refactor:`
4. **改了 schema 一定要加 alembic 迁移**：`alembic revision --autogenerate -m "..."`

## 适合新人入手的任务

我们用 GitHub Issue 标签管理：
- `good first issue` — 入门级
- `help wanted` — 欢迎认领
- `documentation` — 文档改进

具体可做的方向（短中期）：
- 题库扩充：在 `backend/app/seed/problems.py` 加新题
- 补充 i18n 翻译：`frontend/src/i18n/locales/`
- 补充 LLM provider：`backend/app/services/ai_service.py` 的 PROVIDER_REGISTRY
- 修文档错别字 / 加截图

中长期路线（issue 标签 `roadmap`）：
- Pyodide Web Worker 隔离（防 `while True` 冻结浏览器）
- 前端 ErrorBoundary
- 监控告警（Uptime Kuma 等轻量方案）
- CI/CD（GitHub Actions 跑 integration.sh）
- 自动判题
- a11y / SEO / 移动端适配

## 报 Bug

请用 `bug_report` issue 模板，至少包含：
- 复现步骤
- 期望行为
- 实际行为
- 浏览器 / 操作系统
- 后端日志（如有）

## 行为准则

请保持友善、理性、聚焦技术。我们参考 [Contributor Covenant](https://www.contributor-covenant.org/)
但不强制采纳——只要不挑事都没问题。
