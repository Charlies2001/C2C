import Editor from '@monaco-editor/react';
import { useStore } from '../../store/useStore';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import MobileCodeEditor from './MobileCodeEditor';

export default function CodeEditor() {
  const code = useStore((s) => s.code);
  const setCode = useStore((s) => s.setCode);

  // Monaco's IME + touch on mobile browsers is broken. Below 768px we swap
  // in a plain textarea so users at least see and edit their code on phones.
  const isMobile = useMediaQuery('(max-width: 767px)');
  if (isMobile) return <MobileCodeEditor />;

  return (
    <div className="h-full">
      <Editor
        height="100%"
        language="python"
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value || '')}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          renderLineHighlight: 'line',
          automaticLayout: true,
          tabSize: 4,
          wordWrap: 'on',
          padding: { top: 8 },
        }}
      />
    </div>
  );
}
