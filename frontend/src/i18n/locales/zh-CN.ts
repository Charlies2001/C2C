const zhCN = {
  // Navigation
  nav: {
    home: '首页',
    problems: '题库',
    preferences: '学习偏好',
    settings: '设置',
  },

  // Settings modal
  settings: {
    title: 'AI 模型设置',
    language: '语言',
    selectProvider: '选择供应商',
    apiKey: 'API Key',
    configured: '已配置',
    newKeyPlaceholder: '输入新 Key 以替换',
    enterKey: '输入 API Key',
    modelName: '模型名称',
    optional: '可选',
    defaultModel: '留空则使用默认模型',
    close: '关闭',
    save: '保存',
    saved: '已保存',
    enterApiKey: '请输入 API Key',
  },

  // Bookmark
  bookmark: {
    tooltip: '收藏',
  },

  // Collection filter chips
  collection: {
    all: '全部',
    manage: '管理收藏夹',
  },

  // Problem description
  problem: {
    loading: '加载中...',
  },

  // Growth tree
  tree: {
    seed: '种子',
    sprout: '发芽',
    seedling: '小苗',
    smallTree: '小树',
    bigTree: '大树',
    flowering: '开花大树',
    tooltip: '{{label}} - 已解 {{count}} 题',
  },

  // Stats panel
  stats: {
    solved: '已解 {{count}} 题',
    nextStage: '下一阶段需 {{count}} 题',
    distribution: '难度分布',
    recent: '最近解题',
  },

  // Problem list page
  problemList: {
    title: '题目列表',
    upload: '上传题目',
    subtitle: '选择一道题目开始练习',
    subtitleHint: '，遇到困难时可以向 AI 助教求助',
    emptyCollection: '该收藏夹暂无题目',
    loading: '加载中...',
    delete: '删除',
    deleteConfirm: '确认删除？',
    deleteCancel: '取消',
  },

  // Collect modal
  collect: {
    title: '收藏到...',
    empty: '暂无收藏夹，请先新建',
    problemCount: '{{count}}题',
    placeholder: '收藏夹名称',
    create: '创建',
    newCollection: '+ 新建收藏夹',
    done: '完成',
  },

  // AI Chat
  loginGate: {
    title: '登录后解锁',
    defaultMessage: '该功能需要登录使用',
    benefit1: 'AI 助教、提示、教学课件、出题等 AI 功能',
    benefit2: 'API Key 用 Fernet 加密存到后端（前端不留明文）',
    benefit3: '笔记、提交记录、刷题进度多设备同步',
    goLogin: '登录 / 注册',
    later: '稍后',
    forChat: '登录后，AI 助教就能看到你的代码、引导你解题。',
    forHint: '登录后，遇到难题可以一键拿到分级提示。',
    forTeaching: '登录后，AI 会为每道题生成专属教学课件。',
    forDispute: '登录后，AI 会自动验证测试用例对错，可一键修正题目。',
    forGenerateProblem: '登录后，可以让 AI 用一句话给你出一道完整题目。',
    forVerifyProblem: '登录后，AI 会自动检查你上传题目的测试用例对不对。',
  },

  submissions: {
    title: '提交记录',
    triggerLabel: '{{total}} 次',
    openTooltip: '查看历次提交（含代码）',
    summary: '{{passed}}/{{total}} 通过',
    accepted: '已通过',
    partial: '部分通过',
    failedRow: '{{passed}}/{{total}} 通过',
    loading: '加载中...',
    empty: '还没有提交记录',
    noCode: '该条记录未保存代码（v1.3.1 之前的旧提交）',
  },

  chat: {
    title: 'AI 助教',
    clearHistory: '清空记录',
    greeting: '你好！我是你的 AI 编程助教。',
    greetingHint: '遇到问题了吗？告诉我你的思路，我来引导你。',
    placeholder: '描述你遇到的问题...（Enter 发送 / Shift+Enter 换行 / ⌘Enter 也可发送）',
    send: '发送',
    sending: '...',
    noTest: '未运行测试',
    contextSeen: '已感知',
    contextCode: '代码',
    contextOutput: '输出',
    contextTest: '测试',
    contextNoCode: '当前无代码',
    contextNoOutput: '当前无输出',
    contextNoTest: '尚未提交测试',
  },

  // Manage collections modal
  manageCollections: {
    title: '管理收藏夹',
    empty: '暂无收藏夹',
    problemCount: '{{count}}题',
    confirm: '确定',
    cancel: '取消',
    rename: '重命名',
    delete: '删除',
    placeholder: '收藏夹名称',
    create: '创建',
    newCollection: '+ 新建收藏夹',
    close: '关闭',
  },

  // Hint panel
  hint: {
    title: '提示',
    clearAll: '清除全部',
    analyzing: '分析中...',
    generating: '生成中...',
    error: '错误',
    level1: '思路方向',
    level2: '算法策略',
    level3: '伪代码框架',
    level4: '关键代码',
    nudge: '看起来遇到了困难，要看看提示吗？',
    getHint: '查看提示',
    dismiss: '我已知晓',
  },

  // Profile setup modal
  profile: {
    title: '个性化设置',
    subtitle: '告诉我们你的学习偏好，AI 助教会据此调整教学方式',
    experience: '编程经验',
    goal: '学习目标',
    style: '学习方式',
    tone: '教学风格',
    cancel: '取消',
    save: '保存',
    // Display labels (internal values stay as Chinese)
    exp: {
      beginner: '零基础',
      elementary: '初学者',
      intermediate: '有一定经验',
      advanced: '熟练开发者',
    },
    goals: {
      interview: '面试刷题',
      homework: '课程作业',
      hobby: '兴趣爱好',
      skill: '技能提升',
    },
    styles: {
      handhold: '手把手教学',
      theoryFirst: '先理论后实践',
      trialError: '直接上手试错',
      example: '看示例学习',
    },
    tones: {
      professional: '严谨专业',
      casual: '轻松有趣',
      encouraging: '温和鼓励',
    },
  },

  // Error jump banner
  errorJump: {
    encountered: '遇到了',
    error: '错误',
    reviewSection: '可以回顾「{{section}}」章节',
    learnSection: '建议先学习「{{section}}」章节',
    goCheck: '去看看',
  },

  // Landing page
  landing: {
    heroTitle1: '帮助你从 0 开始学编程算法的',
    heroTitle2: 'AI 伙伴',
    heroSubtitle: '像一位耐心的老师陪在你身边——它会读懂你的代码、看出你卡在哪里，',
    heroSubtitle2: '一点点给你提示，让你自己解出每一题。',
    heroPill: '开源 · BYOK · MIT License · 已上线',
    heroTagline: '用你自己的 LLM API Key（Anthropic / OpenAI / 通义 / 智谱 / 豆包 / Gemini）— 平台不向你收费',
    startPractice: '打开在线版本',
    viewSource: 'GitHub 源码',
    whyC2C: '它跟别的编程工具不一样在哪？',
    whySubtitle: '',
    feature1Title: 'AI 老师不直接给答案',
    feature1Desc: '它会反问你的思路、指出代码哪里偏了，只透露刚刚够你继续前进的那一点信息。',
    feature2Title: '每道题都有专属课件',
    feature2Desc: '从读懂题目到写完代码，自动生成多章节教学：语法、数据结构、解题思路、逐步实现。',
    feature3Title: 'AI 看得见你的代码',
    feature3Desc: '你的代码、运行结果、哪些用例通过哪些失败，AI 都看得见。你写到哪儿它讲到哪儿。',
    feature4Title: '觉得题目错了？一键质疑',
    feature4Desc: 'AI 会写一份参考解再交叉验证。如果真是题目本身错了，一键就能修正。',
    howStartTitle: '三步上手',
    howStartSubtitle: '不用读文档，三分钟跑起来',
    step1Title: '下载',
    step1Desc: 'macOS / Windows / Linux 任选一个，下载、解压、双击，零依赖。',
    step1Cta: '前往 Releases',
    step2Title: '配置你的 Key',
    step2Desc: '设置里粘贴一把 LLM API Key。挑一家你已有账号的就行——海外用户用海外模型，国内用户用国内模型，速度更快。',
    step2Expand: '展开 6 大供应商配置入口',
    step2Collapse: '收起',
    step2Overseas: '🌏 海外用户推荐',
    step2Domestic: '🇨🇳 国内用户推荐（直连，无需科学上网）',
    step2Hint: '拿到 Key 后回到 C2C：右上角 ⚙️ 设置 → 选 Provider → 粘贴 Key → 保存。Key 会用 Fernet 加密存到后端，前端任何地方都看不到明文。',
    step3Title: '开始学',
    step3Desc: '从内置精选题开始，也可以用一句话让 AI 给你出一道题。卡住了点「需要提示？」，写完了点提交看测试。',
    readyTitle: '准备好了吗？',
    readySubtitle: '现在就开始你的编程学习之旅',
  },

  // Output panel
  output: {
    running: '运行中...',
    run: '▶ 运行 (Ctrl+Enter)',
    submit: '提交',
    pyLoading: 'Python 环境加载中...',
    teachingMode: '教学模式',
    aiClose: 'AI 助教 ✕',
    aiOpen: 'AI 助教 (⌘L)',
    testResult: '测试结果: {{passed}}/{{total}} 通过',
    passed: '通过',
    allPassed: '全部通过!',
    testFailed: '✗ 测试 {{num}}',
    testPassed: '✓ 测试 {{num}}',
    input: '输入',
    expected: '期望',
    actual: '实际',
    passedCount: '✓ {{count}} 个测试通过',
    collapse: '收起 ▲',
    expand: '展开 ▼',
    noOutput: '(无输出)',
    runError: '运行错误',
    testNotPassed: '测试未通过',
    emptyHint: '点击"运行"执行代码，或点击"提交"运行测试用例',
    passedTotal: '{{passed}}/{{total}} 通过',
    dispute: '🤔 质疑此用例',
    disputeHint: 'AI 写参考解 + Pyodide 自动验证；如果题目错了可一键修正',
    disputeRunning: '检测中...',
    disputeStage1: '生成参考解...',
    disputeStage2: '运行参考解...',
    disputePrompt: '我怀疑测试 {{num}} 的标准答案有问题。\n\n- 输入: {{input}}\n- 期望输出: {{expected}}\n- 我的实际输出: {{actual}}\n\n请你结合题目描述和我的代码，判断到底是题目的 expected 错了，还是我的代码错了。如果是题目错了，请说明正确答案应该是什么、为什么；如果是我代码错了，请引导我找到 bug，但不要直接给完整答案。',
    disputeVerifiedTestPrompt: '我刚刚质疑了测试 {{num}}，但 AI 用参考解跑了一遍，证明测试本身是对的：\n\n- 输入: {{input}}\n- 期望输出: {{expected}}（参考解也输出这个）\n- 我的实际输出: {{actual}}\n\n问题确实在我的代码里。请引导我找到 bug，**不要直接给完整答案**。',
    disputeUncertainPrompt: '我怀疑测试 {{num}} 有问题，AI 用参考解跑了一遍，结果三者都不一致：\n\n- 输入: {{input}}\n- 题目 expected: {{expected}}\n- 参考解输出: {{refOutput}}\n- 我的实际输出: {{actual}}\n\n请帮我判断到底是题目错了、参考解错了，还是我的代码错了。',
    autoFixVerdict: 'AI 验证：参考解输出与你一致，但与 expected 不符，可能是题目错了',
    autoFixOldExpected: '当前 expected',
    autoFixNewExpected: '建议修正为',
    autoFixApply: '✓ 应用此修正',
    autoFixApplying: '修正中...',
    autoFixDismiss: '取消',
  },

  // Create problem modal
  createProblem: {
    uploadTitle: '上传题目',
    previewTitle: '预览 & 编辑',
    description: '题目描述',
    placeholder: '例如：写一个函数判断一个整数是否是素数',
    aiHint: '输入简短的题目描述，AI 会自动生成完整的题目结构',
    cancel: '取消',
    generating: 'AI 生成中...',
    generate: 'AI 生成',
    title: '标题',
    slug: 'Slug',
    difficulty: '难度',
    category: '分类',
    descMd: '题目描述 (Markdown)',
    starterCode: '初始代码',
    helperCode: '辅助代码（可选）',
    testCases: '测试用例',
    addTestCase: '+ 添加用例',
    testCase: '用例 {{num}}',
    deleteCase: '删除',
    inputLabel: 'Input (Python 代码)',
    expectedLabel: 'Expected Output',
    backToEdit: '返回修改描述',
    saving: '保存中...',
    saveProblem: '保存题目',
    generateFailed: '生成失败，请重试',
    networkError: '网络错误，请重试',
    titleSlugRequired: '标题和 slug 不能为空',
    saveFailed: '保存失败',
    verifyButton: '🤖 AI 自校验',
    verifyHint: 'AI 写参考解 + Pyodide 跑每个用例，标出可疑的 expected',
    verifyPyLoading: 'Python 环境加载中，请稍候',
    verifying: 'AI 校验中...',
    verifyMissingFields: '需要先填写题目描述和初始代码',
    verifyFailed: '校验失败',
    verifyAllOk: '✓ 全部 {{total}} 个用例 expected 与参考解输出一致',
    verifySuspects: '⚠ 发现 {{suspect}} 个可疑用例（{{ok}}/{{total}} 通过）',
    verifyShowRef: '查看参考解',
    verifyHideRef: '隐藏参考解',
    verifyMismatch: 'expected 与参考解输出不一致',
    verifyRefOutput: '参考解输出',
    verifyRefError: '参考解运行报错',
    verifyAcceptRef: '采用参考解输出',
  },

  // Blackboard (teaching mode)
  blackboard: {
    title: '教学黑板',
    titleWithName: '{{name}} — 教学黑板',
    stage1: '正在分析题目要点...',
    stage2: '正在组织教学思路...',
    stage3: '正在编写教学内容...',
    stage4: '正在打磨细节...',
    stage5: '快好了，再等一下...',
    preparingFor: '正在为你准备「{{title}}」',
    didYouKnow: '你知道吗？',
    funTip1: 'Python 的名字来自 Monty Python 喜剧团，不是蟒蛇',
    funTip2: '第一个计算机 bug 是一只真正的飞蛾，1947 年被发现在继电器里',
    funTip3: 'Git 的作者 Linus Torvalds 说：Git 这个名字是"一个愚蠢的名字"',
    funTip4: '"Hello, World!" 程序最早出现在 1978 年的 C 语言教材中',
    funTip5: 'Python 之禅：简单优于复杂，扁平优于嵌套',
    funTip6: '全球约有 2700 万开发者，其中 Python 开发者超过 1500 万',
    funTip7: '代码中 70% 的时间花在阅读上，只有 30% 在编写',
    funTip8: 'Stack Overflow 上被浏览最多的问题是关于撤销 Git commit',
    funTip9: 'Python 的缩进不是风格偏好，而是语法要求',
    funTip10: '好的变量命名能省掉 80% 的注释',
    funTip11: '二分查找虽然简单，但第一个正确实现花了 16 年',
    funTip12: 'JavaScript 只用了 10 天就被设计出来了',
    generatingChapter: '正在生成第 {{current}}/{{total}} 章：{{title}}...',
    chaptersComplete: '{{completed}}/{{total}} 章完成',
    aiPreparing: 'AI 正在备课中...',
    regenerate: '↻ 重新生成',
    regenerateTitle: '重新生成当前章节',
    noContent: '本章节尚未生成内容',
    startGenerate: '▶ 开始生成',
    collapsed: '内容已折叠，点击标题展开',
    aiTeacherPreparing: 'AI 老师正在为你准备课程...',
    aiTeacherHint: '根据题目内容定制教学内容，请稍候',
    noTeaching: '暂无教学内容',
    prevChapter: '上一章',
    nextChapter: '下一章',
    goToCoding: '我学会了，去做题！',
  },

  // Section titles (teaching chapters)
  sectionTitles: {
    readCode: '读懂代码框架',
    syntax: '必备语法',
    dataStructure: '核心数据结构',
    approach: '解题思路',
    implementation: '逐步实现',
    review: '总结回顾',
    practice: '动手实战',
    errorAnalysis: '常见错误分析',
  },

  // Code block
  codeBlock: {
    copied: '已复制 ✓',
    copy: '复制',
    tryCode: '试一试这段代码',
  },

  // Mini code editor
  miniEditor: {
    running: '运行中...',
    run: '运行',
    reset: '重置',
    pyLoading: 'Python 环境加载中...',
    close: '关闭',
    output: '输出：',
    error: '❌ 错误:',
    noOutput: '(无输出)',
    runFailed: '❌ 运行失败: ',
  },

  // Guided coding (hands-on practice)
  guided: {
    defaultTask: '编码任务',
    idle: '未开始',
    editing: '编写中',
    passed: '已通过',
    goal: '目标：',
    hintLabel: '提示：',
    expectedOutput: '预期输出：',
    outputMatch: '输出匹配，任务通过！',
    outputMismatch: '输出不匹配',
    actualLabel: '实际',
    tryAgain: '再试一次',
    startCoding: '开始编码',
    codeHere: '# 在这里写代码',
    generatingTasks: '正在生成编码任务...',
    noContent: '暂无内容',
    generatingProgress: '正在生成任务...',
    taskCount: '共 {{count}} 个递进任务，从简到难逐步完成：',
  },

  // Problem filters
  filters: {
    allDifficulty: '全部难度',
    allCategory: '全部分类',
  },

  // Pyodide / execution
  execution: {
    timeout: '执行超时（超过10秒），请检查是否存在死循环',
  },

  // API problems
  apiProblems: {
    slugExists: 'slug 已存在',
  },

  // API errors
  error: {
    aiUnavailable: 'AI 服务暂时不可用',
    cannotReadResponse: '无法读取响应',
    networkError: '网络错误，请重试',
  },
};

export default zhCN;
