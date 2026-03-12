import { useTranslation } from 'react-i18next';
import { useStore } from '../../store/useStore';

const difficulties = ['', 'Easy', 'Medium', 'Hard'];
const categories = ['', '数组', '字符串', '链表', '树', '动态规划'];

export default function ProblemFilters() {
  const { t } = useTranslation();
  const { difficultyFilter, categoryFilter, setDifficultyFilter, setCategoryFilter } = useStore();

  const selectClass = "bg-gray-900/60 backdrop-blur-xl text-gray-300 text-sm border border-white/[0.06] rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 appearance-none cursor-pointer transition-colors";

  const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239ca3af' d='M3 5l3 3 3-3'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.5rem center',
  };

  return (
    <div className="flex gap-3 flex-wrap">
      <select
        value={difficultyFilter}
        onChange={(e) => setDifficultyFilter(e.target.value)}
        className={selectClass}
        style={selectStyle}
      >
        <option value="">{t('filters.allDifficulty')}</option>
        {difficulties.filter(Boolean).map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      <select
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
        className={selectClass}
        style={selectStyle}
      >
        <option value="">{t('filters.allCategory')}</option>
        {categories.filter(Boolean).map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}
