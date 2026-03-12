import { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MiniCodeEditor from './MiniCodeEditor';
import type { ExecutionResult } from './MiniCodeEditor';

interface TaskBlock {
  title: string;
  goal: string;
  hint: string;
  starterCode: string;
  expectedOutput: string;
}

type TaskStatus = 'idle' | 'editing' | 'passed';

interface GuidedCodingProps {
  content: string;
  isStreaming: boolean;
}

function parseTasks(raw: string): TaskBlock[] | null {
  const parts = raw.split(/---TASK---/i).map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return null;

  const tasks: TaskBlock[] = [];
  for (const part of parts) {
    const titleMatch = part.match(/###?\s*任务\s*\d+[：:]\s*(.*)/);
    const goalMatch = part.match(/\*\*目标\*\*[：:]\s*(.*)/);
    const hintMatch = part.match(/\*\*提示\*\*[：:]\s*([\s\S]*?)(?=\n\*\*|$)/);

    // Extract starter code block
    const codeBlocks = [...part.matchAll(/```python\n([\s\S]*?)```/g)];
    const starterCode = codeBlocks.length > 0 ? codeBlocks[0][1].trim() : '';

    // Extract expected output block (the last ``` block, or the one after 预期输出)
    const expectedMatch = part.match(/\*\*预期输出\*\*[：:]\s*\n```\n?([\s\S]*?)```/);
    const expectedOutput = expectedMatch ? expectedMatch[1].trim() : '';

    tasks.push({
      title: titleMatch ? titleMatch[1].trim() : '',
      goal: goalMatch ? goalMatch[1].trim() : '',
      hint: hintMatch ? hintMatch[1].trim() : '',
      starterCode,
      expectedOutput,
    });
  }

  return tasks.length > 0 ? tasks : null;
}

function TaskCard({ task, index }: { task: TaskBlock; index: number }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<TaskStatus>('idle');
  const [showEditor, setShowEditor] = useState(false);
  const [actualOutput, setActualOutput] = useState('');
  const [outputMatch, setOutputMatch] = useState<boolean | null>(null);

  const handleResult = useCallback(
    (result: ExecutionResult) => {
      const actual = (result.error || result.stdout || '').trim();
      setActualOutput(actual);
      if (task.expectedOutput) {
        const match = actual === task.expectedOutput.trim();
        setOutputMatch(match);
        if (match) setStatus('passed');
      }
    },
    [task.expectedOutput]
  );

  const handleOpen = () => {
    setShowEditor(true);
    if (status === 'idle') setStatus('editing');
  };

  const statusConfig = {
    idle: { label: t('guided.idle'), color: 'bg-gray-600', textColor: 'text-gray-400' },
    editing: { label: t('guided.editing'), color: 'bg-amber-500', textColor: 'text-amber-300' },
    passed: { label: t('guided.passed'), color: 'bg-emerald-500', textColor: 'text-emerald-300' },
  };

  const { label: statusLabel, color: statusColor, textColor: statusTextColor } = statusConfig[status];

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
      {/* Task header */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-amber-300">
            Task {index + 1}
          </span>
          <span className="text-sm font-medium text-gray-200">{task.title || t('guided.defaultTask')}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor} text-white`}>
          {statusLabel}
        </span>
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* Goal */}
        {task.goal && (
          <div className="text-sm text-gray-300">
            <span className="text-amber-400 font-medium">{t('guided.goal')}</span>{task.goal}
          </div>
        )}

        {/* Hint */}
        {task.hint && (
          <div className="text-sm text-gray-400 italic">
            <span className="text-gray-500">{t('guided.hintLabel')}</span>{task.hint}
          </div>
        )}

        {/* Expected output */}
        {task.expectedOutput && (
          <div>
            <div className="text-xs text-gray-500 mb-1">{t('guided.expectedOutput')}</div>
            <pre className="text-xs text-emerald-300 bg-emerald-900/20 rounded-lg px-3 py-2 border border-emerald-500/10">
              {task.expectedOutput}
            </pre>
          </div>
        )}

        {/* Output comparison */}
        {outputMatch !== null && (
          <div className={`flex items-center gap-2 text-sm ${outputMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
            {outputMatch ? (
              <><span>&#10003;</span> {t('guided.outputMatch')}</>
            ) : (
              <>
                <span>&#10007;</span>
                <span>{t('guided.outputMismatch')}</span>
                <span className="text-gray-500 text-xs">（{t('guided.actualLabel')}: {actualOutput.slice(0, 100)}）</span>
              </>
            )}
          </div>
        )}

        {/* Editor toggle */}
        {!showEditor ? (
          <button
            onClick={handleOpen}
            className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-400/20 transition-all"
          >
            {status === 'passed' ? t('guided.tryAgain') : t('guided.startCoding')}
          </button>
        ) : (
          <MiniCodeEditor
            initialCode={task.starterCode || `${t('guided.codeHere')}\n`}
            onClose={() => setShowEditor(false)}
            onResult={handleResult}
            height={180}
          />
        )}
      </div>
    </div>
  );
}

export default function GuidedCoding({ content, isStreaming }: GuidedCodingProps) {
  const { t } = useTranslation();
  const tasks = useMemo(() => parseTasks(content), [content]);

  // Fallback: if parsing fails, render as plain markdown
  if (!tasks) {
    return (
      <div className="prose prose-invert prose-sm max-w-none prose-headings:text-pink-200 prose-p:text-gray-300 prose-code:text-pink-300">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content || (isStreaming ? t('guided.generatingTasks') : t('guided.noContent'))}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-400 mb-2">
        {isStreaming ? t('guided.generatingProgress') : t('guided.taskCount', { count: tasks.length })}
      </div>
      {tasks.map((task, i) => (
        <TaskCard key={i} task={task} index={i} />
      ))}
    </div>
  );
}
