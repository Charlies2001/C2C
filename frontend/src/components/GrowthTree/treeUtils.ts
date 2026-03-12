import i18n from '../../i18n';
import type { TreeStage, SolvedRecord } from '../../types/problem';

export interface TreeStageInfo {
  stage: TreeStage;
  label: string;
  threshold: number;
  nextThreshold: number | null;
}

const STAGES: { stage: TreeStage; labelKey: string; threshold: number }[] = [
  { stage: 'seed', labelKey: 'tree.seed', threshold: 0 },
  { stage: 'sprout', labelKey: 'tree.sprout', threshold: 1 },
  { stage: 'seedling', labelKey: 'tree.seedling', threshold: 3 },
  { stage: 'small-tree', labelKey: 'tree.smallTree', threshold: 5 },
  { stage: 'big-tree', labelKey: 'tree.bigTree', threshold: 7 },
  { stage: 'flowering', labelKey: 'tree.flowering', threshold: 10 },
];

export function getTreeStageInfo(solvedCount: number): TreeStageInfo {
  let current = STAGES[0];
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (solvedCount >= STAGES[i].threshold) {
      current = STAGES[i];
      break;
    }
  }
  const idx = STAGES.indexOf(current);
  const nextThreshold = idx < STAGES.length - 1 ? STAGES[idx + 1].threshold : null;
  return { stage: current.stage, label: i18n.t(current.labelKey), threshold: current.threshold, nextThreshold };
}

export function getDifficultyStats(records: SolvedRecord[]) {
  const stats = { Easy: 0, Medium: 0, Hard: 0 };
  for (const r of records) {
    stats[r.difficulty]++;
  }
  return stats;
}
