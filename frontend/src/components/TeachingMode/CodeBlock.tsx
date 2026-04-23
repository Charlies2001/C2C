import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import mermaid from 'mermaid';
import MiniCodeEditor from './MiniCodeEditor';

// Initialize mermaid with dark theme
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#7c3aed',
    primaryTextColor: '#e5e7eb',
    lineColor: '#6b7280',
    secondaryColor: '#1f2937',
    tertiaryColor: '#111827',
  },
});

// Use modular counter to prevent unbounded growth over long sessions
let mermaidIdCounter = 0;
function nextMermaidId() {
  mermaidIdCounter = (mermaidIdCounter + 1) % 1000000;
  return `mermaid-${mermaidIdCounter}-${Date.now()}`;
}

interface CodeBlockProps {
  className?: string;
  children?: React.ReactNode;
}

function MermaidBlock({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState(false);
  const idRef = useRef(nextMermaidId());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { svg: rendered } = await mermaid.render(idRef.current, code);
        if (!cancelled) setSvg(rendered);
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => { cancelled = true; };
  }, [code]);

  if (error) {
    // Fallback to plain code display
    return (
      <SyntaxHighlighter
        language="text"
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: '0.75rem',
          fontSize: '0.8125rem',
          padding: '1rem',
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(236,72,153,0.1)',
        }}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-4 rounded-xl bg-gray-900/50 border border-white/10 p-4 overflow-x-auto flex justify-center"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export default function CodeBlock({ className, children, ...rest }: CodeBlockProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeString = String(children).replace(/\n$/, '');

  const isInline = !className && !String(children).includes('\n');

  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Cleanup copy timer on unmount
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }, [codeString]);

  // Inline code — no special treatment
  if (isInline) {
    return (
      <code className={className} {...rest}>
        {children}
      </code>
    );
  }

  // Mermaid diagram rendering
  if (language === 'mermaid') {
    return <MermaidBlock code={codeString} />;
  }

  // Count lines to decide if "try it" button is shown
  const lineCount = codeString.split('\n').length;
  const isPython = language === 'python' || language === 'py';
  const showTryButton = isPython && lineCount >= 2;

  return (
    <div className="group relative my-3">
      {/* Copy button — top-right, shown on hover */}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 px-2 py-1 text-xs rounded-md
          bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white
          opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? t('codeBlock.copied') : t('codeBlock.copy')}
      </button>

      {/* Syntax highlighted code */}
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: '0.75rem',
          fontSize: '0.8125rem',
          padding: '1rem',
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(236,72,153,0.1)',
        }}
        showLineNumbers={lineCount > 3}
        wrapLongLines
      >
        {codeString}
      </SyntaxHighlighter>

      {/* "Try it" button for Python code blocks */}
      {showTryButton && !showEditor && (
        <button
          onClick={() => setShowEditor(true)}
          className="mt-1.5 px-3 py-1.5 text-xs rounded-lg
            bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25
            border border-emerald-500/20 transition-all flex items-center gap-1.5"
        >
          <span>▶</span> {t('codeBlock.tryCode')}
        </button>
      )}

      {/* Mini code editor */}
      {showEditor && (
        <MiniCodeEditor
          initialCode={codeString}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}
