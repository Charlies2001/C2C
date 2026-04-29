import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store/useStore';
import { streamAIChat } from '../../api/ai';

// AbortController ref for cancelling in-flight chat requests
let chatAbortController: AbortController | null = null;

const chatMarkdownComponents: Record<string, React.ComponentType<any>> = {
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img
      {...props}
      className="my-2 rounded-lg max-w-full h-auto border border-white/10"
      loading="lazy"
    />
  ),
};

export default function AIChatPanel() {
  const { t } = useTranslation();
  const {
    isChatOpen, setIsChatOpen, chatMessages, addChatMessage,
    updateLastAssistantMessage, isAILoading, setIsAILoading,
    saveChatMessages, clearChat, chatProblemId, currentProblem, code, output, testResults,
  } = useStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (isChatOpen) inputRef.current?.focus();
  }, [isChatOpen]);

  // Abort in-flight request when component unmounts
  useEffect(() => {
    return () => {
      chatAbortController?.abort();
      chatAbortController = null;
    };
  }, []);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isAILoading) return;

    const userMsg = { role: 'user' as const, content: trimmed };
    addChatMessage(userMsg);
    setInput('');
    setIsAILoading(true);

    addChatMessage({ role: 'assistant', content: '' });
    let accumulated = '';

    const testResultStr = testResults.length > 0
      ? testResults.map((r) => `测试${r.index + 1}: ${r.passed ? '通过' : '失败'} (期望: ${r.expected}, 实际: ${r.actual})`).join('\n')
      : t('chat.noTest');

    // Cancel any previous in-flight request
    chatAbortController?.abort();
    chatAbortController = new AbortController();

    await streamAIChat(
      [...chatMessages, userMsg].map((m) => ({ role: m.role, content: m.content })),
      {
        title: currentProblem?.title || '',
        description: currentProblem?.description || '',
        code,
        output,
        testResults: testResultStr,
      },
      (chunk) => {
        accumulated += chunk;
        updateLastAssistantMessage(accumulated);
      },
      () => { setIsAILoading(false); saveChatMessages(); },
      (error) => {
        updateLastAssistantMessage(error);
        setIsAILoading(false);
      },
      chatAbortController.signal,
    );
  };

  if (!isChatOpen) return null;

  return (
    <div className="w-80 h-[calc(100vh-3rem)] border-l border-white/[0.06] bg-gray-900/80 backdrop-blur-xl flex flex-col shrink-0 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06] bg-gray-900/40">
        <span className="text-sm font-medium bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          {t('chat.title')}
        </span>
        <div className="flex items-center gap-2">
          {chatMessages.length > 0 && (
            <button
              onClick={() => {
                clearChat();
                if (chatProblemId !== null) {
                  localStorage.removeItem(`chat_${chatProblemId}`);
                }
              }}
              disabled={isAILoading}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              {t('chat.clearHistory')}
            </button>
          )}
          <button
            onClick={() => setIsChatOpen(false)}
            className="text-gray-400 hover:text-white text-lg leading-none transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
        {chatMessages.length === 0 && (
          <div className="text-gray-500 text-sm text-center mt-8">
            <p>{t('chat.greeting')}</p>
            <p className="mt-2">{t('chat.greetingHint')}</p>
          </div>
        )}
        {chatMessages.map((msg, i) => (
          <div
            key={i}
            className={`text-sm ${
              msg.role === 'user'
                ? 'bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-violet-500/20 rounded-xl p-2.5 ml-4'
                : 'bg-gray-800/40 rounded-xl p-2.5 text-gray-300'
            }`}
          >
            {msg.role === 'assistant' ? (
              <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-code:text-violet-300 prose-pre:bg-gray-950/60 prose-pre:border prose-pre:border-white/[0.06] prose-pre:rounded-xl">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={chatMarkdownComponents}>{msg.content || '...'}</ReactMarkdown>
              </div>
            ) : (
              <span className="text-blue-200">{msg.content}</span>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-2 border-t border-white/[0.06]">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t('chat.placeholder')}
            className="flex-1 bg-gray-900/60 backdrop-blur-xl text-gray-300 text-sm border border-white/[0.06] rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 placeholder-gray-600 transition-colors"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={isAILoading || !input.trim()}
            className="px-3 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed self-end transition-all"
          >
            {isAILoading ? t('chat.sending') : t('chat.send')}
          </button>
        </div>
      </div>
    </div>
  );
}
