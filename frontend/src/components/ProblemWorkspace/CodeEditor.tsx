import Editor from '@monaco-editor/react';
import { useStore } from '../../store/useStore';

export default function CodeEditor() {
  const { code, setCode } = useStore();

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
