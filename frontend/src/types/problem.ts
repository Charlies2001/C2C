export interface TestCase {
  input: string;
  expected: string;
}

export interface Problem {
  id: number;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  starter_code: string;
  helper_code: string;
  test_cases: TestCase[];
}

export interface ProblemListItem {
  id: number;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
}

export interface TestResult {
  index: number;
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Collection {
  id: string;
  name: string;
  problemIds: number[];
  createdAt: number;
}

export interface UserProfile {
  experience: '零基础' | '初学者' | '有一定经验' | '熟练开发者';
  goal: '面试刷题' | '课程作业' | '兴趣爱好' | '技能提升';
  style: '手把手教学' | '先理论后实践' | '直接上手试错' | '看示例学习';
  tone: '严谨专业' | '轻松有趣' | '温和鼓励';
}

export interface SolvedRecord {
  problemId: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  solvedAt: number;
}

export type TreeStage = 'seed' | 'sprout' | 'seedling' | 'small-tree' | 'big-tree' | 'flowering';
