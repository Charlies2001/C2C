/**
 * Shared section title utilities — used by Blackboard (teaching) and OutputPanel (error jump).
 * Internal keys are English; display uses i18n t('sectionTitles.<key>').
 * Backend communication uses Chinese titles (kept in KEY_TO_ZH).
 * Keep in sync with backend `_get_sections_for_difficulty()`.
 */

/** Mapping from internal key to Chinese title (for backend communication) */
const KEY_TO_ZH: Record<string, string> = {
  readCode: '读懂代码框架',
  syntax: '必备语法',
  dataStructure: '核心数据结构',
  approach: '解题思路',
  implementation: '逐步实现',
  review: '总结回顾',
  practice: '动手实战',
  errorAnalysis: '常见错误分析',
};

/** Get the Chinese title for a section key (for backend API calls) */
export function getSectionZhTitle(key: string): string {
  return KEY_TO_ZH[key] || key;
}

export function getSectionTitlesForDifficulty(difficulty: string): string[] {
  const base = ['readCode', 'syntax', 'dataStructure', 'approach', 'implementation', 'review', 'practice'];
  if (difficulty === 'Easy') {
    return base.filter((t) => t !== 'dataStructure'); // 6 chapters
  }
  if (difficulty === 'Hard') {
    const implIdx = base.indexOf('implementation');
    const result = [...base];
    result.splice(implIdx + 1, 0, 'errorAnalysis'); // 8 chapters
    return result;
  }
  return base; // Medium: 7 chapters
}

// ─── Error classification for smart jump ───

const ERROR_TO_SECTION: Record<string, string> = {
  SyntaxError: 'syntax',
  IndentationError: 'syntax',
  TypeError: 'syntax',
  NameError: 'syntax',
  ValueError: 'syntax',
  IndexError: 'dataStructure',
  KeyError: 'dataStructure',
  AttributeError: 'dataStructure',
  ZeroDivisionError: 'approach',
  RecursionError: 'approach',
  RuntimeError: 'implementation',
};

/** Extract the Python error type name from stderr output (e.g. "SyntaxError") */
export function extractErrorType(errorOutput: string): string {
  const match = errorOutput.match(/(\w+Error)\s*:/);
  return match ? match[1] : '';
}

/**
 * Given error output and a list of section keys, return the index of the most
 * relevant section to review (-1 if no match or section doesn't exist for this difficulty).
 */
export function findRelevantSectionIndex(errorOutput: string, sectionKeys: string[]): number {
  const errorType = extractErrorType(errorOutput);

  if (errorType && ERROR_TO_SECTION[errorType]) {
    const idx = sectionKeys.indexOf(ERROR_TO_SECTION[errorType]);
    return idx;
  }

  // Test failure without a Python exception → recommend implementation
  if (
    errorOutput.includes('测试结果') ||
    errorOutput.includes('✗') ||
    errorOutput.includes('不匹配')
  ) {
    return sectionKeys.indexOf('implementation');
  }

  return -1;
}
