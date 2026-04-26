import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { fetchProblems, deleteProblem } from '../api/problems';
import ProblemCard from '../components/ProblemList/ProblemCard';
import ProblemFilters from '../components/ProblemList/ProblemFilters';
import CollectionFilterChips from '../components/ProblemList/CollectionFilterChips';
import ActivityCalendar from '../components/ProblemList/ActivityCalendar';
import NotebooksPanel from '../components/ProblemList/NotebooksPanel';
import CreateProblemModal from '../components/CreateProblemModal';
import ProfileSetupModal from '../components/ProfileSetupModal';

export default function ProblemListPage() {
  const { t } = useTranslation();
  const { problems, setProblems, difficultyFilter, categoryFilter, collectionFilter, collections, loadCollections, userProfile, loadProfile } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteProblem(id);
      setProblems(problems.filter((p) => p.id !== id));
    } catch {
      // silently fail
    }
  }, [problems, setProblems]);

  const loadProblems = useCallback(() => {
    const params: Record<string, string> = {};
    if (difficultyFilter) params.difficulty = difficultyFilter;
    if (categoryFilter) params.category = categoryFilter;
    fetchProblems(params).then(setProblems).catch(console.error);
  }, [difficultyFilter, categoryFilter, setProblems]);

  useEffect(() => {
    loadProblems();
  }, [loadProblems]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (userProfile === null) {
      const stored = localStorage.getItem('user_profile');
      if (!stored) setShowProfile(true);
    }
  }, [userProfile]);

  const filteredProblems = useMemo(() => {
    if (!collectionFilter) return problems;
    const col = collections.find((c) => c.id === collectionFilter);
    if (!col) return problems;
    const idSet = new Set(col.problemIds);
    return problems.filter((p) => idSet.has(p.id));
  }, [problems, collectionFilter, collections]);

  const emptyText = collectionFilter ? t('problemList.emptyCollection') : t('problemList.loading');

  return (
    <div className="max-w-5xl mx-auto p-6 hero-gradient">
      <div className="mb-6 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-white">{t('problemList.title')}</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-1.5 text-sm bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white rounded-xl transition-all"
          >
            {t('problemList.upload')}
          </button>
        </div>
        <p className="text-sm">
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent font-medium">
            {t('problemList.subtitle')}
          </span>
          <span className="text-gray-500 ml-1">{t('problemList.subtitleHint')}</span>
        </p>
      </div>
      <div className="mb-5 relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-3"><ActivityCalendar /></div>
        <div className="lg:col-span-2"><NotebooksPanel /></div>
      </div>
      <div className="mb-4 relative z-10 space-y-3">
        <ProblemFilters />
        <CollectionFilterChips />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 relative z-10">
        {filteredProblems.map((p) => (
          <ProblemCard key={p.id} problem={p} onDelete={handleDelete} />
        ))}
        {filteredProblems.length === 0 && (
          <div className="col-span-3 text-center text-gray-500 py-12">
            {emptyText}
          </div>
        )}
      </div>
      <CreateProblemModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={loadProblems}
      />
      <ProfileSetupModal
        open={showProfile}
        onClose={() => setShowProfile(false)}
        initialProfile={userProfile}
      />
    </div>
  );
}
