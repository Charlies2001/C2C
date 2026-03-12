import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Editor from '@monaco-editor/react';
import { useStore } from '../../store/useStore';
import { runPythonCode } from '../../services/pyodide';

export interface ExecutionResult {
  stdout: string;
  error: string;
}

interface MiniCodeEditorProps {
  initialCode: string;
  onClose: () => void;
  onResult?: (result: ExecutionResult) => void;
  height?: number;
}

export default function MiniCodeEditor({ initialCode, onClose, onResult, height = 200 }: MiniCodeEditorProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const pyodideReady = useStore((s) => s.pyodideReady);
  const editorRef = useRef<any>(null);

  const handleRun = useCallback(async () => {
    if (!pyodideReady) return;
    setIsRunning(true);
    setOutput('');
    try {
      const result = await runPythonCode(code);
      if (result.error) {
        setOutput(`${t('miniEditor.error')}\n${result.error}`);
      } else {
        setOutput(result.stdout || t('miniEditor.noOutput'));
      }
      onResult?.({ stdout: result.stdout || '', error: result.error || '' });
    } catch (err) {
      setOutput(`${t('miniEditor.runFailed')}${String(err)}`);
    } finally {
      setIsRunning(false);
    }
  }, [code, pyodideReady]);

  const handleReset = useCallback(() => {
    setCode(initialCode);
    setOutput('');
  }, [initialCode]);

  return (
    <div className="mt-2 rounded-xl border border-emerald-500/20 bg-gray-950/80 overflow-hidden">
      {/* Editor area */}
      <div style={{ height: `${height}px` }}>
        <Editor
          height="100%"
          defaultLanguage="python"
          value={code}
          onChange={(v) => setCode(v || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            padding: { top: 8 },
            renderLineHighlight: 'none',
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: { vertical: 'hidden', horizontal: 'auto' },
          }}
          onMount={(editor) => { editorRef.current = editor; }}
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-white/10 bg-gray-900/60">
        <button
          onClick={handleRun}
          disabled={!pyodideReady || isRunning}
          className="px-3 py-1.5 text-xs rounded-lg bg-emerald-500/20 text-emerald-300
            hover:bg-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed
            transition-all flex items-center gap-1.5"
        >
          {isRunning ? (
            <>
              <span className="animate-spin">⟳</span> {t('miniEditor.running')}
            </>
          ) : (
            <>
              <span>▶</span> {t('miniEditor.run')}
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          className="px-3 py-1.5 text-xs rounded-lg bg-white/5 text-gray-400
            hover:bg-white/10 hover:text-gray-200 transition-all"
        >
          {t('miniEditor.reset')}
        </button>
        <div className="flex-1" />
        {!pyodideReady && (
          <span className="text-xs text-amber-400/70">{t('miniEditor.pyLoading')}</span>
        )}
        <button
          onClick={onClose}
          className="px-3 py-1.5 text-xs rounded-lg bg-white/5 text-gray-400
            hover:bg-white/10 hover:text-gray-200 transition-all"
        >
          {t('miniEditor.close')}
        </button>
      </div>

      {/* Output area */}
      {output && (
        <div className="px-4 py-3 border-t border-white/10 bg-black/30">
          <div className="text-xs text-gray-500 mb-1">{t('miniEditor.output')}</div>
          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">{output}</pre>
        </div>
      )}
    </div>
  );
}
