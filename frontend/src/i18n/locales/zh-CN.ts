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
  chat: {
    title: 'AI 助教',
    clearHistory: '清空记录',
    greeting: '你好！我是你的 AI 编程助教。',
    greetingHint: '遇到问题了吗？告诉我你的思路，我来引导你。',
    placeholder: '描述你遇到的问题...',
    send: '发送',
    sending: '...',
    noTest: '未运行测试',
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
    heroTitle1: '用 AI 学编程',
    heroTitle2: '从零开始',
    heroSubtitle: 'AI 驱动的编程教学平台，渐进式引导你从理解题意到写出代码，',
    heroSubtitle2: '像有一位耐心的老师随时在身边。',
    startPractice: '开始练习',
    whyC2C: '为什么选择 C2C？',
    whySubtitle: '不只是刷题，而是真正理解编程思维',
    feature1Title: 'AI 智能教学',
    feature1Desc: '分章节教学，从零讲起，像真人老师一样耐心引导',
    feature2Title: '渐进式提示',
    feature2Desc: '不直接给答案，层层引导你思考，真正学会解题',
    feature3Title: '在线编程',
    feature3Desc: '浏览器内运行 Python，实时反馈，无需配置环境',
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
