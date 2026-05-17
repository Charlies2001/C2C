import { useStore } from '../../store/useStore';

/**
 * Mobile fallback for Monaco — Monaco's IME + touch handling is broken on
 * iOS / Android browsers. We give a syntax-highlight-free textarea with
 * monospace + tab handling so the user can at least edit a snippet on phone.
 *
 * Heavy editing is still expected on desktop.
 */
export default function MobileCodeEditor() {
  const code = useStore((s) => s.code);
  const setCode = useStore((s) => s.setCode);

  // Insert 4 spaces on Tab instead of focus-jumping.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = code.substring(0, start) + '    ' + code.substring(end);
      setCode(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <div className="px-3 py-2 text-[11px] text-amber-300 bg-amber-900/20 border-b border-amber-700/30">
        移动端简化编辑器 · 想要语法高亮和补全请在桌面端打开
      </div>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        aria-label="代码编辑器"
        className="flex-1 w-full p-3 bg-transparent text-gray-100 font-mono text-sm leading-relaxed resize-none outline-none"
        style={{ tabSize: 4 }}
      />
    </div>
  );
}
