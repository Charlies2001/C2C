import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { useStore } from '../store/useStore';
import { fetchProblem } from '../api/problems';
import { usePyodide } from '../hooks/usePyodide';
import { useHintTrigger } from '../hooks/useHintTrigger';
import ProblemDescription from '../components/ProblemWorkspace/ProblemDescription';
import CodeEditor from '../components/ProblemWorkspace/CodeEditor';
import OutputPanel from '../components/ProblemWorkspace/OutputPanel';
import Blackboard from '../components/TeachingMode/Blackboard';
import AIChatPanel from '../components/AIChat/AIChatPanel';

export default function ProblemPage() {
  const { id } = useParams<{ id: string }>();
  const [mode, setMode] = useState<'coding' | 'teaching'>('coding');
  const {
    setCurrentProblem, setCode, setOutput, setTestResults,
    loadChatForProblem, loadHintsForProblem, loadTeachingForProblem,
    isChatOpen, setIsChatOpen,
  } = useStore();

  usePyodide();
  useHintTrigger(mode);

  useEffect(() => {
    if (!id) return;
    let ignore = false;
    const problemId = Number(id);
    setMode('coding');
    setOutput('');
    setTestResults([]);
    loadChatForProblem(problemId);
    loadHintsForProblem(problemId);
    loadTeachingForProblem(problemId);
    fetchProblem(problemId).then((p) => {
      if (!ignore) {
        setCurrentProblem(p);
        setCode(p.starter_code);
      }
    }).catch(console.error);
    return () => {
      ignore = true;
      setCurrentProblem(null);
    };
  }, [id, setCurrentProblem, setCode, setOutput, setTestResults, loadChatForProblem, loadHintsForProblem, loadTeachingForProblem]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        setIsChatOpen(!isChatOpen);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        const runBtn = document.querySelector('[data-run-btn]') as HTMLButtonElement;
        runBtn?.click();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isChatOpen, setIsChatOpen]);

  return (
    <div className={`flex flex-1 overflow-hidden ${mode === 'teaching' ? 'teaching-theme-bg' : ''}`}>
      <div className="flex-1 overflow-hidden">
        <Group orientation="horizontal">
          <Panel defaultSize={40} minSize={20}>
            <div className={`h-full ${mode === 'teaching' ? 'border-r border-pink-200/10' : ''}`}>
              <ProblemDescription />
            </div>
          </Panel>
          <Separator className={`w-1 transition-colors ${mode === 'teaching' ? 'bg-pink-300/10 hover:bg-pink-400/40' : 'bg-white/[0.04] hover:bg-violet-500/60'}`} />
          <Panel defaultSize={60} minSize={30}>
            {mode === 'teaching' ? (
              <Blackboard onGoToCoding={() => setMode('coding')} />
            ) : (
              <Group orientation="vertical">
                <Panel defaultSize={60} minSize={30}>
                  <CodeEditor />
                </Panel>
                <Separator className="h-1 bg-white/[0.04] hover:bg-violet-500/60 transition-colors" />
                <Panel defaultSize={40} minSize={20}>
                  <OutputPanel onGoToTeaching={() => setMode('teaching')} />
                </Panel>
              </Group>
            )}
          </Panel>
        </Group>
      </div>
      <AIChatPanel />
    </div>
  );
}
