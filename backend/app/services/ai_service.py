import json
import logging
import re
import time
import asyncio
import anthropic
import openai
from typing import AsyncGenerator
from ..config import settings

logger = logging.getLogger("codingbot.ai")

# ─── Provider registry ───

PROVIDER_REGISTRY = {
    "openai":    {"base_url": "https://api.openai.com/v1",                              "default_model": "gpt-4o"},
    "qwen":      {"base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1",      "default_model": "qwen-plus"},
    "doubao":    {"base_url": "https://ark.cn-beijing.volces.com/api/v3",               "default_model": "doubao-1.5-pro-32k-250115"},
    "glm":       {"base_url": "https://open.bigmodel.cn/api/paas/v4",                   "default_model": "glm-4-flash"},
    "gemini":    {"base_url": "https://generativelanguage.googleapis.com/v1beta/openai", "default_model": "gemini-2.0-flash"},
}

# ─── LLM client pool (reuse clients to avoid TCP connection accumulation) ───

_anthropic_clients: dict[str, anthropic.AsyncAnthropic] = {}
_openai_clients: dict[str, openai.AsyncOpenAI] = {}

# Default timeout for LLM requests (seconds)
LLM_STREAM_TIMEOUT = 120
LLM_CALL_TIMEOUT = 60


def _get_anthropic_client(api_key: str) -> anthropic.AsyncAnthropic:
    """Get or create a cached Anthropic client for the given API key."""
    if api_key not in _anthropic_clients:
        _anthropic_clients[api_key] = anthropic.AsyncAnthropic(
            api_key=api_key,
            timeout=LLM_STREAM_TIMEOUT,
        )
    return _anthropic_clients[api_key]


def _get_openai_client(api_key: str, base_url: str) -> openai.AsyncOpenAI:
    """Get or create a cached OpenAI-compatible client."""
    cache_key = f"{api_key}:{base_url}"
    if cache_key not in _openai_clients:
        _openai_clients[cache_key] = openai.AsyncOpenAI(
            api_key=api_key,
            base_url=base_url,
            timeout=LLM_STREAM_TIMEOUT,
        )
    return _openai_clients[cache_key]


class MissingAPIKeyError(Exception):
    """Raised when neither user nor (dev-only) env provides an API key."""


def _format_llm_error(exc: Exception) -> str:
    """Map provider SDK exceptions to a user-facing Chinese message.

    Both anthropic and openai SDKs expose .status_code on APIError subclasses,
    so we match on HTTP status when available, then fall back to a generic
    message that hides raw stack/JSON.
    """
    from ..logging_config import _redact

    code = getattr(exc, "status_code", None)
    # Defensive: even though provider error.message rarely includes the API
    # key, we redact before echoing back to the user just in case a future
    # SDK version (or a misbehaving server) leaks one.
    raw = _redact(getattr(exc, "message", "") or str(exc))
    if code == 401:
        return "API Key 无效或已过期，请在「设置」中检查或重新配置"
    if code == 402:
        return "API Key 余额不足，请前往 provider 控制台充值"
    if code == 403:
        return "Key 无权调用该模型，请检查 provider 控制台权限或更换模型"
    if code == 404:
        return "请求的模型不存在，请在「设置」中更换模型"
    if code == 429:
        return "调用频率超限或当日额度已用完，请稍后重试或检查 provider 控制台"
    if code == 400:
        return f"请求参数有误：{raw[:120]}"
    if code in (500, 502, 503, 504):
        return "AI 服务暂时不可用，请稍后重试"
    return f"AI 服务错误，请稍后重试（{raw[:80]}）"


def _resolve_provider_config(provider_config: dict | None) -> dict:
    """Resolve provider config from user-supplied data.

    BYOK model: users supply their own keys via Settings. The
    `ANTHROPIC_API_KEY` env var is honored ONLY when ALLOW_ENV_KEY_FALLBACK
    is true — for local dev convenience, never in production.
    """
    if provider_config and provider_config.get("api_key"):
        provider = provider_config.get("provider", "anthropic")
        model = provider_config.get("model", "")
        api_key = provider_config["api_key"]
        if not model:
            if provider == "anthropic":
                model = "claude-sonnet-4-6"
            else:
                model = PROVIDER_REGISTRY.get(provider, {}).get("default_model", "")
        return {"provider": provider, "api_key": api_key, "model": model}
    # Dev-only fallback (off by default in prod). See config.ALLOW_ENV_KEY_FALLBACK.
    if settings.ALLOW_ENV_KEY_FALLBACK and settings.ANTHROPIC_API_KEY:
        return {"provider": "anthropic", "api_key": settings.ANTHROPIC_API_KEY, "model": "claude-sonnet-4-6"}
    raise MissingAPIKeyError("请在「设置」中配置 API Key 后再使用 AI 功能")


async def _stream_llm_response(
    system_prompt: str,
    messages: list[dict],
    max_tokens: int,
    provider_config: dict | None = None,
) -> AsyncGenerator[str, None]:
    """Unified streaming LLM call. Yields plain text tokens.

    Raises MissingAPIKeyError if no key is configured.
    """
    cfg = _resolve_provider_config(provider_config)

    provider = cfg["provider"]
    api_key = cfg["api_key"]
    model = cfg["model"]
    start = time.perf_counter()
    chars = 0
    error: str | None = None
    try:
        if provider == "anthropic":
            client = _get_anthropic_client(api_key)
            async with asyncio.timeout(LLM_STREAM_TIMEOUT):
                async with client.messages.stream(
                    model=model,
                    max_tokens=max_tokens,
                    system=system_prompt,
                    messages=messages,
                ) as stream:
                    async for text in stream.text_stream:
                        chars += len(text)
                        yield text
        else:
            base_url = PROVIDER_REGISTRY.get(provider, {}).get("base_url", "https://api.openai.com/v1")
            client = _get_openai_client(api_key, base_url)
            oai_messages = [{"role": "system", "content": system_prompt}] + messages
            async with asyncio.timeout(LLM_STREAM_TIMEOUT):
                stream = await client.chat.completions.create(
                    model=model,
                    max_tokens=max_tokens,
                    messages=oai_messages,
                    stream=True,
                )
                async for chunk in stream:
                    delta = chunk.choices[0].delta if chunk.choices else None
                    if delta and delta.content:
                        chars += len(delta.content)
                        yield delta.content
    except Exception as e:
        error = type(e).__name__
        raise
    finally:
        logger.info(
            "llm_stream",
            extra={
                "provider": provider,
                "model": model,
                "max_tokens": max_tokens,
                "duration_ms": round((time.perf_counter() - start) * 1000, 2),
                "output_chars": chars,
                "error": error,
            },
        )


async def _call_llm(
    system_prompt: str,
    messages: list[dict],
    max_tokens: int,
    provider_config: dict | None = None,
) -> str:
    """Unified non-streaming LLM call. Returns full text.

    Raises MissingAPIKeyError if no key is configured.
    """
    cfg = _resolve_provider_config(provider_config)

    provider = cfg["provider"]
    api_key = cfg["api_key"]
    model = cfg["model"]
    start = time.perf_counter()
    result = ""
    error: str | None = None
    try:
        if provider == "anthropic":
            client = _get_anthropic_client(api_key)
            async with asyncio.timeout(LLM_CALL_TIMEOUT):
                response = await client.messages.create(
                    model=model,
                    max_tokens=max_tokens,
                    system=system_prompt,
                    messages=messages,
                )
            result = response.content[0].text.strip()
        else:
            base_url = PROVIDER_REGISTRY.get(provider, {}).get("base_url", "https://api.openai.com/v1")
            client = _get_openai_client(api_key, base_url)
            oai_messages = [{"role": "system", "content": system_prompt}] + messages
            async with asyncio.timeout(LLM_CALL_TIMEOUT):
                response = await client.chat.completions.create(
                    model=model,
                    max_tokens=max_tokens,
                    messages=oai_messages,
                )
            result = response.choices[0].message.content.strip()
        return result
    except Exception as e:
        error = type(e).__name__
        raise
    finally:
        logger.info(
            "llm_call",
            extra={
                "provider": provider,
                "model": model,
                "max_tokens": max_tokens,
                "duration_ms": round((time.perf_counter() - start) * 1000, 2),
                "output_chars": len(result),
                "error": error,
            },
        )

HINT_LEVEL_NAMES = {
    1: "思路方向",
    2: "算法策略",
    3: "伪代码框架",
    4: "关键代码",
}

HINT_LEVEL_ANALYZE_PROMPT = """你是编程教学分析器。根据学生代码状态判断应给出哪个级别的提示。

## 判断标准
- **1（思路方向）**：代码为空、只有初始模板、或完全看不出解题思路。
- **2（算法策略）**：已有大致方向（写了变量/循环），但未选择正确的数据结构或算法。
- **3（伪代码框架）**：已选对算法方向，但实现框架不完整或步骤不清晰。
- **4（关键代码）**：已有基本框架，但核心逻辑（状态转移、边界处理等）写错或缺失。

## 输出
只回复一个数字：1、2、3 或 4。不要有任何其他文字。"""

HINT_SYSTEM_PROMPT = """你是编程提示生成器。根据指定级别为学生生成有针对性的提示。

## 级别定义
- **级别 1（思路方向）**：引导思考方向，提出 1-2 个关键问题，帮助理解题目本质。不给出具体算法名称。
- **级别 2（算法策略）**：给出具体的数据结构或算法建议，说明为什么适合本题，但不展示实现代码。
- **级别 3（伪代码框架）**：用伪代码或分步骤描述展示解题框架，让学生理解整体流程。
- **级别 4（关键代码）**：给出关键代码片段（核心循环、状态转移等），但不给完整答案。

## 规则
- 严格按当前级别生成，不要跨级
- 使用中文
- 每级提示控制在 3-8 行，简洁有力
- 使用 Markdown 格式，**代码块只用于实际代码**
- 如果有之前级别的提示，确保内容递进、不重复"""

# ─── Item 2+3: Rewritten TEACHING_SECTIONS with max_tokens & richer prompts ───

TEACHING_SECTIONS = [
    {
        "title": "读懂代码框架",
        "max_tokens": 1536,
        "prompt": (
            "你是一位编程老师，正在讲解一道编程题的函数框架。\n\n"
            "## 任务\n"
            "1. **逐行拆解**函数定义（def 行、参数列表、返回值类型），解释每部分的作用\n"
            "2. 用**类比**解释每个参数代表什么、输出应该是什么\n"
            "3. 给出 1-2 个最简单的**调用示例**（输入→输出）帮助直观理解\n\n"
            "## 格式要求\n"
            "- 使用中文\n"
            "- Markdown 格式排版（标题、粗体、列表）\n"
            "- **代码块只用于实际可运行的 Python 代码**，说明文字用正文\n"
            "- 内容充实但不冗长"
        ),
    },
    {
        "title": "必备语法",
        "max_tokens": 2048,
        "prompt": (
            "你是一位编程老师。请**只**教本题需要用到的 Python 语法知识。\n\n"
            "## 任务\n"
            "1. 用一张 Markdown 表格呈现语法点：| 语法 | 含义 | 本题用途 | 示例 |\n"
            "2. 表格之后，对每个语法点补充 1-2 行说明和一个最小可运行代码块\n\n"
            "## 格式要求\n"
            "- 使用中文\n"
            "- Markdown 格式排版（标题、粗体、表格）\n"
            "- **代码块只用于实际可运行的 Python 代码**，说明文字用正文\n"
            "- 不要教本题用不到的语法\n"
            "- 内容充实但不冗长"
        ),
    },
    {
        "title": "核心数据结构",
        "max_tokens": 2048,
        "prompt": (
            "你是一位编程老师。请讲解本题核心数据结构。\n\n"
            "## 任务\n"
            "1. 用**类比**解释该数据结构是什么（如：字典→电话簿，栈→叠盘子）\n"
            "2. 用 **Mermaid 图表**演示数据结构在本题中如何随操作变化\n"
            "   - 使用 ```mermaid 代码块包裹\n"
            "   - 链表/数组操作适合用 `graph LR`，栈/队列/状态变化适合用 `stateDiagram-v2`，树结构适合用 `graph TD`\n"
            "   - 节点数量控制在 10 个以内，保持图表简洁清晰\n"
            "   - 示例：\n"
            "     ```mermaid\n"
            "     graph LR\n"
            "       A[1] --> B[2] --> C[3] --> D[4]\n"
            "       style B fill:#7c3aed,color:#fff\n"
            "     ```\n"
            "3. 配简短 Python 代码示例展示基本操作\n\n"
            "## 格式要求\n"
            "- 使用中文\n"
            "- Markdown 格式排版（标题、粗体、列表）\n"
            "- **代码块只用于实际可运行的 Python 代码或 Mermaid 图表**，说明文字用正文\n"
            "- 内容充实但不冗长"
        ),
    },
    {
        "title": "解题思路",
        "max_tokens": 2048,
        "prompt": (
            "你是一位编程老师。请用通俗语言讲清解题思路。\n\n"
            "## 任务\n"
            "1. 先用一个**生活场景类比**帮助建立直觉\n"
            "2. 用一个 **Mermaid 流程图**展示算法的主要流程\n"
            "   - 使用 ```mermaid 代码块包裹\n"
            "   - 使用 `graph TD`（从上到下）展示从输入到输出的判断/循环逻辑\n"
            "   - 节点数量控制在 8-12 个，保持图表简洁\n"
            "   - 示例：\n"
            "     ```mermaid\n"
            "     graph TD\n"
            "       A[开始: 读取输入] --> B{条件判断}\n"
            "       B -->|是| C[执行操作]\n"
            "       B -->|否| D[返回结果]\n"
            "       C --> B\n"
            "     ```\n"
            "3. 然后用**编号步骤**（Step 1, Step 2…）详细写出算法流程\n"
            "4. 用一个简单测试用例进行**手动模拟**，展示每步的状态变化\n\n"
            "## 格式要求\n"
            "- 使用中文\n"
            "- Markdown 格式排版（标题、粗体、编号列表）\n"
            "- **禁止写任何 Python 代码**，只用自然语言、Mermaid 图表和示意图\n"
            "- 内容充实但不冗长"
        ),
    },
    {
        "title": "逐步实现",
        "max_tokens": 4096,
        "prompt": (
            "你是一位编程老师。请把解题思路翻译成代码。\n\n"
            "## 任务\n"
            "分 **3-5 个小步骤**，每步：\n"
            "1. 一句话说明这步要做什么\n"
            "2. 给出这步的代码片段\n"
            "3. 解释「为什么这样写」\n\n"
            "最后给出**完整的可提交代码**（所有步骤合并后的最终版本）。\n\n"
            "## 格式要求\n"
            "- 使用中文\n"
            "- Markdown 格式排版（标题、粗体、列表）\n"
            "- **代码块只用于实际可运行的 Python 代码**，步骤描述用正文\n"
            "- 内容充实但不冗长"
        ),
    },
    {
        "title": "总结回顾",
        "max_tokens": 1024,
        "prompt": (
            "你是一位编程老师。请做本课总结。\n\n"
            "## 任务\n"
            "1. **知识清单**：列出本节课学到的所有知识点（语法、数据结构、算法思想）\n"
            "2. **核心能力**：学生现在掌握了哪些解题能力\n"
            "3. **类似题方向**：推荐 2-3 道难度相近的类似题目方向（不需要具体题号）\n\n"
            "## 格式要求\n"
            "- 使用中文\n"
            "- Markdown 格式排版（标题、粗体、列表）\n"
            "- 说明文字用正文，不放进代码块\n"
            "- 简洁精炼，不重复前面章节内容"
        ),
    },
]

# ─── Item 4: Difficulty-adaptive sections ───

HARD_EXTRA_SECTION = {
    "title": "常见错误分析",
    "max_tokens": 2048,
    "prompt": (
        "你是一位编程老师。请分析本题最容易犯的 3-5 个常见错误。\n\n"
        "## 输出格式\n"
        "每个错误用以下格式：\n"
        "### 错误 N：简短描述\n"
        "❌ **错误写法**\n```python\n错误代码\n```\n"
        "为什么错：一句话解释\n\n"
        "✅ **正确写法**\n```python\n正确代码\n```\n\n"
        "如果合适，可以用一个 Mermaid 流程图对比正确和错误的执行路径，例如：\n"
        "```mermaid\n"
        "graph TD\n"
        "  A[输入] --> B{边界检查?}\n"
        "  B -->|❌ 跳过| C[错误结果]\n"
        "  B -->|✅ 检查| D[正确处理]\n"
        "```\n"
        "节点数量控制在 10 个以内。\n\n"
        "## 格式要求\n"
        "- 使用中文\n"
        "- Markdown 格式排版\n"
        "- **代码块只用于实际可运行的 Python 代码或 Mermaid 图表**，说明用正文\n"
        "- 聚焦本题特有的易错点（边界、溢出、特殊输入等）"
    ),
}


GUIDED_CODING_SECTION = {
    "title": "动手实战",
    "max_tokens": 4096,
    "prompt": (
        "你是一位编程老师。请为学生设计 3-5 个**递进的小编码任务**，"
        "帮助他们从零开始一步步实现完整解法。\n\n"
        "## 输出格式\n"
        "每个任务之间用 `---TASK---` 分隔，每个任务包含以下部分：\n\n"
        "### 任务 N：标题\n"
        "**目标**：一句话说明这个任务要做什么\n\n"
        "**提示**：1-2 句提示帮助学生思考\n\n"
        "**起始代码**：\n```python\n# 学生从这里开始写\n```\n\n"
        "**预期输出**：\n```\n预期的运行结果\n```\n\n"
        "## 规则\n"
        "- 使用中文\n"
        "- 任务必须递进：从最简单的子问题开始，逐步接近完整解法\n"
        "- 起始代码包含函数框架和必要注释，让学生只需填写核心逻辑\n"
        "- 预期输出必须是确定性的（不要用随机数等）\n"
        "- 每个任务末尾包含测试调用（如 print(func(args))），使学生能直接运行\n"
        "- 不要在 ---TASK--- 分隔符前后添加多余内容"
    ),
}


EXPERIENCE_GUIDANCE = {
    "零基础": (
        "## 经验适配：零基础\n"
        "- 禁止使用任何未解释的专业术语（如「遍历」「递归」「哈希」），首次出现时必须用大白话解释\n"
        "- 每个概念用生活类比引入（列表→购物清单，循环→重复做家务，字典→电话簿）\n"
        "- 代码示例从最简单的开始，一次只引入一个新概念\n"
        "- 主动预判学生可能的困惑点并提前解释\n"
        "- 多用「想象一下…」「就好比…」等引导语\n"
        "- 回复中穿插确认：「这里能理解吗？」「有没有跟上？」"
    ),
    "初学者": (
        "## 经验适配：初学者\n"
        "- 可以使用基本术语（变量、循环、条件、函数），复杂概念仍需解释\n"
        "- 适当使用类比，但不必每个概念都类比\n"
        "- 可以假设学生理解基本语法，重点讲解算法逻辑\n"
        "- 鼓励学生先尝试再纠正\n"
        "- 代码示例可以稍复杂，但要解释关键行"
    ),
    "有一定经验": (
        "## 经验适配：有经验\n"
        "- 可以直接使用常见术语（时间复杂度、空间复杂度、数据结构名称等）\n"
        "- 跳过基础语法讲解，聚焦算法思路和优化策略\n"
        "- 讨论多种解法的优劣对比\n"
        "- 适当提及边界情况和工程实践考量\n"
        "- 回复更精练，不过度解释基础概念"
    ),
    "熟练开发者": (
        "## 经验适配：熟练开发者\n"
        "- 直接使用专业术语，无需解释\n"
        "- 重点：复杂度分析、空间优化、多种解法对比、最优解推导\n"
        "- 可提及高级话题：amortized analysis、cache-friendly、并发考量等\n"
        "- 回复精炼直接，像同事间技术讨论\n"
        "- 适当挑战学生：「你觉得还能怎么优化？」「如果数据量到 10^9 呢？」"
    ),
}

GOAL_GUIDANCE = {
    "面试刷题": (
        "## 目标适配：面试刷题\n"
        "- 每道题必须讨论时间复杂度和空间复杂度\n"
        "- 提及该题型在面试中的高频程度和常见变体\n"
        "- 引导学生练习口述解题思路（「面试官问你思路，你会怎么说？」）\n"
        "- 训练思路：先暴力解 → 再优化 → 分析 trade-off\n"
        "- 提醒常见面试陷阱和边界情况"
    ),
    "课程作业": (
        "## 目标适配：课程作业\n"
        "- 注重概念理解的完整性，确保学生真正理解而非死记硬背\n"
        "- 引导规范代码风格（命名、注释、结构清晰）\n"
        "- 强调正确性验证：如何设计测试用例\n"
        "- 将当前题目与课程知识点关联，帮助建立知识体系\n"
        "- 绝不直接给答案，侧重培养独立解题能力"
    ),
    "兴趣爱好": (
        "## 目标适配：兴趣爱好\n"
        "- 保持趣味性，多分享有趣的背景故事或现实应用场景\n"
        "- 不给压力，鼓励探索：「没关系，我们慢慢来」\n"
        "- 展示算法在现实中的应用（游戏、图形、日常工具等）\n"
        "- 允许灵活调整节奏，跳过枯燥的部分\n"
        "- 适当推荐延伸阅读或有趣的小项目"
    ),
    "技能提升": (
        "## 目标适配：技能提升\n"
        "- 注重实战能力，强调代码质量和工程最佳实践\n"
        "- 讨论解法的可扩展性和实际应用场景\n"
        "- 引导思考：这个算法在实际项目中怎么用？\n"
        "- 介绍相关的 Python 标准库实现（collections、heapq、bisect 等）\n"
        "- 鼓励举一反三，将学到的模式迁移到其他问题"
    ),
}

STYLE_GUIDANCE = {
    "手把手教学": (
        "## 教学方式：手把手教学\n"
        "- 将每步拆解到最小粒度，一次只讲一个知识点\n"
        "- 每讲完一步就确认理解：「到这里跟上了吗？」\n"
        "- 用编号步骤清晰标注进度（Step 1, Step 2…）\n"
        "- 出错时从出错位置重新引导，而非跳到正确答案\n"
        "- 先给框架让学生填空，再逐步补全"
    ),
    "先理论后实践": (
        "## 教学方式：先理论后实践\n"
        "- 先用文字完整讲清算法原理和工作机制\n"
        "- 理论讲完后再给代码实现\n"
        "- 用图示或状态变化表辅助理解抽象概念\n"
        "- 先讲「为什么」再讲「怎么做」\n"
        "- 适当引入复杂度推导来支撑理论"
    ),
    "直接上手试错": (
        "## 教学方式：直接上手试错\n"
        "- 先给学生一个可尝试的方向，让他们自己写\n"
        "- 遇到错误时引导分析原因，而非直接纠正\n"
        "- 鼓励先写暴力解再优化\n"
        "- 少说多练，回复简短有力，给行动指令\n"
        "- 多用「试试看…」「如果把这里改成…会怎样？」"
    ),
    "看示例学习": (
        "## 教学方式：看示例学习\n"
        "- 多提供具体的代码示例，从简单到复杂\n"
        "- 每个概念配一个最小可运行示例\n"
        "- 先给类似但更简单的问题做示范，再过渡到原题\n"
        "- 用对比示例展示不同做法的区别\n"
        "- 鼓励学生模仿示例写出自己的版本"
    ),
}

TONE_GUIDANCE = {
    "严谨专业": (
        "## 语气风格：严谨专业\n"
        "- 使用准确、规范的表述，避免口语化\n"
        "- 逻辑清晰，论述有理有据\n"
        "- 指出问题时直接客观，不过分委婉\n"
        "- 用「注意」「需要强调的是」等专业过渡语\n"
        "- 像大学教授在答疑"
    ),
    "轻松有趣": (
        "## 语气风格：轻松有趣\n"
        "- 适当使用比喻、类比和轻松的表达\n"
        "- 遇到有趣的点可以加入小幽默\n"
        "- 可以用「哈哈」「有意思」「酷」等口语化表达\n"
        "- 将枯燥概念包装成有趣的故事或场景\n"
        "- 像一位风趣的朋友在聊天"
    ),
    "温和鼓励": (
        "## 语气风格：温和鼓励\n"
        "- 每次回复包含正面反馈（「做得不错」「思路很好」「已经很接近了」）\n"
        "- 犯错时先肯定尝试的勇气，再温和指出问题\n"
        "- 多用「我们一起来看看」「没关系」「慢慢来」\n"
        "- 取得进展时给具体的表扬\n"
        "- 像一位耐心温柔的家教老师"
    ),
}


def _build_user_profile_prompt(user_profile: dict | None) -> str:
    """Build a personalized prompt fragment based on user profile."""
    if not user_profile:
        return ""

    experience = user_profile.get("experience", "")
    goal = user_profile.get("goal", "")
    style = user_profile.get("style", "")
    tone = user_profile.get("tone", "")

    if not any([experience, goal, style, tone]):
        return ""

    parts = ["\n\n# 个性化教学要求（必须严格遵循以下所有规则）"]
    if experience and experience in EXPERIENCE_GUIDANCE:
        parts.append(EXPERIENCE_GUIDANCE[experience])
    if goal and goal in GOAL_GUIDANCE:
        parts.append(GOAL_GUIDANCE[goal])
    if style and style in STYLE_GUIDANCE:
        parts.append(STYLE_GUIDANCE[style])
    if tone and tone in TONE_GUIDANCE:
        parts.append(TONE_GUIDANCE[tone])

    return "\n\n".join(parts)


def _get_sections_for_difficulty(difficulty: str) -> list[dict]:
    """Return the appropriate teaching sections based on problem difficulty."""
    difficulty = difficulty.capitalize() if difficulty else "Medium"
    if difficulty == "Easy":
        # Remove "核心数据结构" → 5 + 1 = 6 chapters
        result = [s for s in TEACHING_SECTIONS if s["title"] != "核心数据结构"]
    elif difficulty == "Hard":
        # Insert "常见错误分析" after "逐步实现" → 7 + 1 = 8 chapters
        result = list(TEACHING_SECTIONS)
        impl_idx = next(
            (i for i, s in enumerate(result) if s["title"] == "逐步实现"), len(result) - 1
        )
        result.insert(impl_idx + 1, HARD_EXTRA_SECTION)
    else:
        # Medium → 6 + 1 = 7 chapters
        result = list(TEACHING_SECTIONS)
    # All difficulties get 动手实战 as the final chapter
    result.append(GUIDED_CODING_SECTION)
    return result


def get_teaching_sections_for_difficulty(difficulty: str) -> list[dict]:
    """Return section titles with indices for a given difficulty."""
    sections = _get_sections_for_difficulty(difficulty)
    return [{"index": i, "title": s["title"]} for i, s in enumerate(sections)]


def get_teaching_sections() -> list[dict]:
    """Return the list of teaching section titles with indices (default Medium)."""
    return [{"index": i, "title": s["title"]} for i, s in enumerate(TEACHING_SECTIONS)]


# ─── Item 1: Prior context for section chaining ───

MAX_PRIOR_CONTEXT_CHARS = 12000


def _build_prior_context(previous_sections: list[dict]) -> str:
    """Build a summary of previous sections to provide continuity.

    previous_sections: list of {"title": str, "content": str}
    """
    if not previous_sections:
        return ""

    parts = ["## 前面章节内容（请递进讲解，不要重复已讲过的概念）\n"]
    total = 0
    for sec in previous_sections:
        title = sec.get("title", "")
        content = sec.get("content", "")
        header = f"### {title}\n"
        remaining = MAX_PRIOR_CONTEXT_CHARS - total
        if remaining <= 0:
            break
        truncated = content[:remaining]
        parts.append(header + truncated)
        total += len(header) + len(truncated)

    return "\n\n".join(parts)


async def stream_teaching_section(
    problem_context: dict,
    section_index: int,
    previous_sections: list[dict] | None = None,
    difficulty: str = "Medium",
    user_profile: dict | None = None,
    provider_config: dict | None = None,
) -> AsyncGenerator[str, None]:
    """Stream a single teaching section's content."""
    sections = _get_sections_for_difficulty(difficulty)

    if section_index < 0 or section_index >= len(sections):
        yield f'data: {json.dumps({"error": f"无效的章节索引: {section_index}"}, ensure_ascii=False)}\n\n'
        yield "data: [DONE]\n\n"
        return

    cfg = _resolve_provider_config(provider_config)
    if not cfg:
        yield f'data: {json.dumps({"error": "未配置 API Key，请在设置中配置"}, ensure_ascii=False)}\n\n'
        yield "data: [DONE]\n\n"
        return

    section = sections[section_index]
    max_tokens = section.get("max_tokens", 2048)
    section_system = section["prompt"] + _build_user_profile_prompt(user_profile)

    parts = _build_problem_parts(problem_context)
    if problem_context.get("starterCode"):
        parts.append(f"## 题目初始代码\n```python\n{problem_context['starterCode']}\n```")

    # Item 1: Add prior context for continuity
    if previous_sections:
        prior = _build_prior_context(previous_sections)
        if prior:
            parts.append(prior)

    user_message = "\n\n".join(parts) + f"\n\n请针对以上题目，生成「{section['title']}」章节的教学内容。"

    try:
        async for text in _stream_llm_response(
            section_system,
            [{"role": "user", "content": user_message}],
            max_tokens,
            provider_config,
        ):
            yield f"data: {json.dumps({'content': text}, ensure_ascii=False)}\n\n"
        yield "data: [DONE]\n\n"
    except TimeoutError:
        yield f'data: {json.dumps({"error": "AI 服务响应超时，请重试"}, ensure_ascii=False)}\n\n'
        yield "data: [DONE]\n\n"
    except (anthropic.APIError, openai.APIError) as e:
        yield f'data: {json.dumps({"error": _format_llm_error(e)}, ensure_ascii=False)}\n\n'
        yield "data: [DONE]\n\n"
    except (asyncio.CancelledError, GeneratorExit):
        return


_GENERATE_PROBLEM_LANG_CONFIG: dict[str, dict[str, str]] = {
    "zh-CN": {
        "title_field": "题目中文标题",
        "category_examples": "数组、字符串、链表、树、动态规划、数学、哈希表、排序、递归、栈等",
        "desc_lang": "description 使用中文",
        "user_msg": "请根据以下描述生成一道编程题目：\n\n",
    },
    "en-US": {
        "title_field": "problem title in English",
        "category_examples": "Array, String, Linked List, Tree, Dynamic Programming, Math, Hash Table, Sorting, Recursion, Stack, etc.",
        "desc_lang": "description must be in English",
        "user_msg": "Generate a coding problem based on the following description:\n\n",
    },
    "ja-JP": {
        "title_field": "日本語の問題タイトル",
        "category_examples": "配列、文字列、連結リスト、木、動的計画法、数学、ハッシュテーブル、ソート、再帰、スタックなど",
        "desc_lang": "description は日本語で記述すること",
        "user_msg": "以下の説明に基づいてプログラミング問題を生成してください：\n\n",
    },
    "ko-KR": {
        "title_field": "한국어 문제 제목",
        "category_examples": "배열, 문자열, 연결 리스트, 트리, 동적 프로그래밍, 수학, 해시 테이블, 정렬, 재귀, 스택 등",
        "desc_lang": "description은 한국어로 작성할 것",
        "user_msg": "다음 설명을 바탕으로 프로그래밍 문제를 생성해주세요:\n\n",
    },
}


def _build_generate_problem_prompt(language: str) -> str:
    lang_cfg = _GENERATE_PROBLEM_LANG_CONFIG.get(language, _GENERATE_PROBLEM_LANG_CONFIG["zh-CN"])
    return f"""You are a coding problem design expert. Generate a complete Python coding problem based on the user's description.

Output a **strictly valid JSON object** with no markdown fences or extra text.

## JSON Fields
- title: {lang_cfg["title_field"]}
- slug: kebab-case English identifier
- difficulty: "Easy" / "Medium" / "Hard"
- category: category ({lang_cfg["category_examples"]})
- description: problem description (Markdown format, including title, explanation, examples, hints)
- starter_code: function signature template
- helper_code: helper code (empty string "" for simple problems)
- test_cases: array of test cases, each with input and expected

## JSON Format Requirements (most important)
- Use \\n for newlines in strings, \\" for double quotes, \\\\ for backslashes
- Do not use ``` fences in description, use 4-space indentation for code instead
- Ensure the output can be parsed directly by json.loads()

## Content Rules
1. **starter_code MUST use the LeetCode `class Solution` style** with a method, NOT a free function:
   ```python
   class Solution(object):
       def methodName(self, arg1, arg2):
           '''
           :type arg1: List[int]
           :type arg2: int
           :rtype: int
           '''
           pass
   ```
   In the actual JSON output, use `\"\"\"` for the docstring quotes, not single quotes.
2. **DO NOT import any packages** in starter_code, helper_code, or test_cases.
   Built-in types (list, dict, set) are always available; if a problem genuinely
   needs collections.deque or heapq, prefer redesigning the signature to avoid them.
3. test_cases input is executable Python code: define variables first, then
   `print(Solution().methodName(...))`. Method name MUST match starter_code.
4. test_cases expected is the print output string (lists use "[1, 2]" with spaces)
5. Linked list / tree problems must provide ListNode / TreeNode classes and helper
   builder functions in helper_code (NOT in starter_code, NO imports there either)
6. starter_code should only contain the Solution class + method signature + docstring + pass
7. Generate 18-22 test_cases covering:
   - **Basic cases** (3-4): standard inputs from examples
   - **Normal cases** (5-6): normal inputs of varying sizes
   - **Edge cases** (4-5): empty input, single element, minimum, maximum
   - **Extreme cases** (3-4): all same elements, reversed, very large values, special characters
   - **Trap cases** (2-3): common mistakes (off-by-one, overflow, duplicates)
8. {lang_cfg["desc_lang"]}

Output JSON directly, first character {{, last character }}."""


async def generate_problem_from_description(user_description: str, provider_config: dict | None = None, language: str = "zh-CN") -> dict:
    """Call LLM to generate a complete problem structure from a short description."""
    cfg = _resolve_provider_config(provider_config)
    if not cfg:
        return {"success": False, "error": "未配置 API Key，请在设置中配置"}

    lang_cfg = _GENERATE_PROBLEM_LANG_CONFIG.get(language, _GENERATE_PROBLEM_LANG_CONFIG["zh-CN"])

    try:
        raw = await _call_llm(
            _build_generate_problem_prompt(language),
            [{"role": "user", "content": f"{lang_cfg['user_msg']}{user_description}"}],
            8192,
            provider_config,
        )

        # Robust JSON extraction: find the outermost { ... }
        first_brace = raw.find("{")
        last_brace = raw.rfind("}")
        if first_brace == -1 or last_brace == -1 or last_brace <= first_brace:
            return {"success": False, "error": "AI 返回的内容中未找到 JSON 对象，请重试"}
        json_str = raw[first_brace:last_brace + 1]

        problem = json.loads(json_str)

        # Validate required fields
        required = ["title", "slug", "difficulty", "category", "description", "starter_code", "test_cases"]
        for field in required:
            if field not in problem:
                return {"success": False, "error": f"AI 返回的数据缺少字段: {field}"}

        if problem["difficulty"] not in ("Easy", "Medium", "Hard"):
            problem["difficulty"] = "Medium"

        if not isinstance(problem["test_cases"], list) or len(problem["test_cases"]) < 10:
            return {"success": False, "error": "AI 返回的 test_cases 格式不正确"}

        for tc in problem["test_cases"]:
            if "input" not in tc or "expected" not in tc:
                return {"success": False, "error": "test_cases 中缺少 input 或 expected 字段"}

        if "helper_code" not in problem:
            problem["helper_code"] = ""

        return {"success": True, "problem": problem}

    except json.JSONDecodeError as e:
        return {"success": False, "error": f"AI 返回的内容解析失败（{e.msg}，位置 {e.pos}），请重试"}
    except (anthropic.APIError, openai.APIError) as e:
        return {"success": False, "error": _format_llm_error(e)}
    except Exception as e:
        return {"success": False, "error": f"生成题目时出错: {str(e)}"}


TEACHING_SYSTEM_PROMPT = """你是编程老师，根据题目生成分章节教学内容。

## 输出格式
严格按以下格式输出 6 个章节，每个章节用分隔符隔开：

---SECTION:读懂代码框架---
解释函数框架：函数定义、参数含义、返回值。配简单示例。

---SECTION:必备语法---
只教本题用到的 Python 语法，每个语法点配最小代码示例。

---SECTION:核心数据结构---
讲解本题核心数据结构，用类比帮助理解，配代码示例。

---SECTION:解题思路---
用通俗语言讲清算法逻辑，可用场景类比。不写代码，用自然语言描述步骤。

---SECTION:逐步实现---
一步步把思路翻译成代码，每步解释「为什么这样写」。给出完整代码。

---SECTION:总结回顾---
汇总知识点，鼓励实践。

## 格式要求
- 使用中文
- Markdown 格式排版（标题、代码块、粗体等）
- 代码使用 Python
- 每章内容充实但不冗长"""

SYSTEM_PROMPT = """你是编程导师，正在帮助学生学习算法和数据结构。

## 核心原则
1. **不直接给出完整答案或完整代码**，引导学生自己思考和解决问题。
2. 通过提问帮助学生发现问题和解决方案。
3. 根据对话进展逐步加深提示力度。

## 引导策略
- **概念引导**：提问帮助理解题意，引导思考方向。如「你觉得这道题可以用什么数据结构？」
- **策略提示**：仍困惑时给出更具体的策略。如「试试用哈希表来存储遍历过的元素？」
- **伪代码引导**：理解策略但不知如何实现时，用伪代码或步骤描述。
- **Bug 定位**：代码有 bug 时帮定位位置和原因，让学生自己修复。

## Bug 引导
1. 先问学生认为代码在做什么
2. 引导用简单测试用例手动追踪执行过程
3. 帮助发现预期与实际行为的差异
4. 指出「什么错了」和「在哪里」，让学生思考「为什么」和「怎么修」

## 格式要求
- 使用中文
- 简洁明了，避免冗长
- Markdown 格式，**代码块只用于实际代码片段**
- 代码片段只给关键部分，不给完整方案

## 上下文
你可以看到学生正在做的题目、当前代码、执行结果。据此提供针对性帮助。"""


async def stream_ai_response(
    messages: list[dict],
    problem_context: dict,
    user_profile: dict | None = None,
    provider_config: dict | None = None,
) -> AsyncGenerator[str, None]:
    """Stream AI response with SSE format."""
    cfg = _resolve_provider_config(provider_config)
    if not cfg:
        yield 'data: {"error": "未配置 API Key，请在设置中配置"}\n\n'
        yield "data: [DONE]\n\n"
        return

    # Build context message
    context_parts = []
    if problem_context.get("title"):
        context_parts.append(f"## 当前题目: {problem_context['title']}")
    if problem_context.get("description"):
        context_parts.append(f"## 题目描述\n{problem_context['description']}")
    if problem_context.get("code"):
        context_parts.append(f"## 学生当前代码\n```python\n{problem_context['code']}\n```")
    if problem_context.get("output"):
        context_parts.append(f"## 代码执行输出\n```\n{problem_context['output']}\n```")
    if problem_context.get("testResults"):
        context_parts.append(f"## 测试结果\n{problem_context['testResults']}")

    context_message = "\n\n".join(context_parts)

    # Build messages
    api_messages = []
    if context_message:
        api_messages.append({
            "role": "user",
            "content": f"[系统上下文 - 学生当前的做题情况]\n\n{context_message}\n\n---\n请基于以上上下文回答学生的问题。"
        })
        api_messages.append({
            "role": "assistant",
            "content": "好的，我已了解学生当前的做题情况，我会基于这些信息来引导他们。请问有什么问题？"
        })

    # Add conversation history
    for msg in messages:
        api_messages.append({
            "role": msg["role"],
            "content": msg["content"],
        })

    system_prompt = SYSTEM_PROMPT + _build_user_profile_prompt(user_profile)

    try:
        async for text in _stream_llm_response(
            system_prompt,
            api_messages,
            2048,
            provider_config,
        ):
            yield f"data: {json.dumps({'content': text}, ensure_ascii=False)}\n\n"
        yield "data: [DONE]\n\n"
    except TimeoutError:
        yield f'data: {json.dumps({"error": "AI 服务响应超时，请重试"}, ensure_ascii=False)}\n\n'
        yield "data: [DONE]\n\n"
    except (anthropic.APIError, openai.APIError) as e:
        yield f'data: {json.dumps({"error": _format_llm_error(e)}, ensure_ascii=False)}\n\n'
        yield "data: [DONE]\n\n"
    except (asyncio.CancelledError, GeneratorExit):
        return


def _build_problem_parts(problem_context: dict) -> list[str]:
    """Build context parts from problem_context dict."""
    parts = []
    if problem_context.get("title"):
        parts.append(f"## 题目: {problem_context['title']}")
    if problem_context.get("description"):
        parts.append(f"## 题目描述\n{problem_context['description']}")
    if problem_context.get("code"):
        parts.append(f"## 学生当前代码\n```python\n{problem_context['code']}\n```")
    if problem_context.get("output"):
        parts.append(f"## 最近输出\n```\n{problem_context['output']}\n```")
    return parts


async def _determine_hint_level(
    problem_context: dict,
    given_levels: list[int],
    provider_config: dict | None = None,
) -> int:
    """Use AI to analyze code state and determine appropriate hint level."""
    parts = _build_problem_parts(problem_context)
    if given_levels:
        parts.append(f"## 已给过的提示级别: {given_levels}")

    user_message = "\n\n".join(parts)

    try:
        level_text = await _call_llm(
            HINT_LEVEL_ANALYZE_PROMPT,
            [{"role": "user", "content": user_message}],
            8,
            provider_config,
        )
        level = int(level_text)
        if level < 1 or level > 4:
            level = max(given_levels, default=0) + 1
    except Exception:
        # Fallback: next level after highest given
        level = max(given_levels, default=0) + 1

    # Clamp to 1-4
    return max(1, min(4, level))


async def stream_hint_response(
    problem_context: dict,
    previous_hints: list[dict],
    user_profile: dict | None = None,
    provider_config: dict | None = None,
) -> AsyncGenerator[str, None]:
    """Stream hint response for the progressive hint system.

    previous_hints: list of {"level": int, "content": str}
    """
    cfg = _resolve_provider_config(provider_config)
    if not cfg:
        yield f'data: {json.dumps({"error": "未配置 API Key，请在设置中配置"}, ensure_ascii=False)}\n\n'
        yield "data: [DONE]\n\n"
        return

    # Determine appropriate level based on code state
    given_levels = [h["level"] for h in previous_hints]
    hint_level = await _determine_hint_level(problem_context, given_levels, provider_config)

    level_name = HINT_LEVEL_NAMES.get(hint_level, f"级别{hint_level}")

    # Send determined level as first SSE event
    yield f"data: {json.dumps({'level': hint_level}, ensure_ascii=False)}\n\n"

    # Build user message for hint generation
    parts = [f"请生成**{level_name}**（级别 {hint_level}）的提示。\n"]
    parts.extend(_build_problem_parts(problem_context))

    if previous_hints:
        parts.append("## 之前已给的提示（请递进，不要重复）")
        for h in previous_hints:
            lname = HINT_LEVEL_NAMES.get(h["level"], f"级别{h['level']}")
            parts.append(f"### {lname}\n{h['content']}")

    user_message = "\n\n".join(parts)

    hint_system = HINT_SYSTEM_PROMPT + _build_user_profile_prompt(user_profile)

    try:
        async for text in _stream_llm_response(
            hint_system,
            [{"role": "user", "content": user_message}],
            1024,
            provider_config,
        ):
            yield f"data: {json.dumps({'content': text}, ensure_ascii=False)}\n\n"
        yield "data: [DONE]\n\n"
    except TimeoutError:
        yield f'data: {json.dumps({"error": "AI 服务响应超时，请重试"}, ensure_ascii=False)}\n\n'
        yield "data: [DONE]\n\n"
    except (anthropic.APIError, openai.APIError) as e:
        yield f'data: {json.dumps({"error": _format_llm_error(e)}, ensure_ascii=False)}\n\n'
        yield "data: [DONE]\n\n"
    except (asyncio.CancelledError, GeneratorExit):
        return


async def stream_teaching_content(
    problem_context: dict,
    provider_config: dict | None = None,
) -> AsyncGenerator[str, None]:
    """Stream teaching content for the teaching mode, split into sections."""
    cfg = _resolve_provider_config(provider_config)
    if not cfg:
        yield f'data: {json.dumps({"error": "未配置 API Key，请在设置中配置"}, ensure_ascii=False)}\n\n'
        yield "data: [DONE]\n\n"
        return

    parts = _build_problem_parts(problem_context)
    if problem_context.get("starterCode"):
        parts.append(f"## 题目初始代码\n```python\n{problem_context['starterCode']}\n```")
    user_message = "\n\n".join(parts) + "\n\n请根据以上题目，生成分章节教学内容。"

    try:
        current_section = 0
        buffer = ""
        section_started = False
        MAX_BUFFER_SIZE = 32000  # Safety limit to prevent unbounded buffer growth

        async for text in _stream_llm_response(
            TEACHING_SYSTEM_PROMPT,
            [{"role": "user", "content": user_message}],
            4096,
            provider_config,
        ):
            buffer += text
            # Check for section markers in buffer
            while "---SECTION:" in buffer:
                marker_start = buffer.index("---SECTION:")
                marker_end = buffer.find("---", marker_start + 11)
                if marker_end == -1:
                    break
                before = buffer[:marker_start].strip()
                if before and section_started:
                    yield f"data: {json.dumps({'content': before}, ensure_ascii=False)}\n\n"
                title = buffer[marker_start + 11:marker_end]
                current_section += 1
                section_started = True
                yield f"data: {json.dumps({'section': current_section, 'title': title}, ensure_ascii=False)}\n\n"
                buffer = buffer[marker_end + 3:]
            if section_started and buffer and "---SECTION:" not in buffer:
                yield f"data: {json.dumps({'content': buffer}, ensure_ascii=False)}\n\n"
                buffer = ""
            # Safety: flush oversized buffer to prevent memory exhaustion
            if len(buffer) > MAX_BUFFER_SIZE:
                yield f"data: {json.dumps({'content': buffer}, ensure_ascii=False)}\n\n"
                buffer = ""

        if buffer.strip() and section_started:
            yield f"data: {json.dumps({'content': buffer}, ensure_ascii=False)}\n\n"

        yield "data: [DONE]\n\n"
    except TimeoutError:
        yield f'data: {json.dumps({"error": "AI 服务响应超时，请重试"}, ensure_ascii=False)}\n\n'
        yield "data: [DONE]\n\n"
    except (anthropic.APIError, openai.APIError) as e:
        yield f'data: {json.dumps({"error": _format_llm_error(e)}, ensure_ascii=False)}\n\n'
        yield "data: [DONE]\n\n"
    except (asyncio.CancelledError, GeneratorExit):
        return
