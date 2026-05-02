import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  // What blew up — used in the fallback header so users know which area to reload.
  scope?: string;
}

interface State {
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const REPO_ISSUES_URL = 'https://github.com/Charlies2001/C2C-coding-coach/issues/new?template=bug_report.md';

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // Surface to console so dev / user-with-devtools can copy.
    console.error('[ErrorBoundary] caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleReport = () => {
    const { error, errorInfo } = this.state;
    const stack = (error?.stack || '').slice(0, 1500);
    const componentStack = (errorInfo?.componentStack || '').slice(0, 1000);
    const body = encodeURIComponent(
      `**复现路径**：\n（请描述触发该错误的操作）\n\n` +
      `**Scope**: ${this.props.scope || 'app'}\n\n` +
      `**Error**: ${error?.message || 'unknown'}\n\n` +
      `<details><summary>Stack</summary>\n\n\`\`\`\n${stack}\n\`\`\`\n\n` +
      `\`\`\`\n${componentStack}\n\`\`\`\n</details>`
    );
    window.open(`${REPO_ISSUES_URL}&body=${body}`, '_blank', 'noopener');
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-900/80 border border-rose-500/20 rounded-2xl p-6 text-center">
          <div className="text-rose-400 text-3xl mb-2">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-100 mb-1">
            页面出错了
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            {this.props.scope ? `区域：${this.props.scope}` : '应用渲染过程中遇到了未预期的错误'}
          </p>
          <pre className="text-xs text-rose-300/80 bg-gray-950/60 border border-white/[0.04] rounded-lg p-3 mb-4 text-left overflow-auto max-h-32">
            {this.state.error.message || String(this.state.error)}
          </pre>
          <div className="flex flex-col gap-2">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-colors"
            >
              重试
            </button>
            <button
              onClick={this.handleReload}
              className="px-4 py-2 text-sm border border-white/[0.08] text-gray-300 hover:border-white/[0.20] rounded-xl transition-colors"
            >
              刷新页面
            </button>
            <button
              onClick={this.handleReport}
              className="px-4 py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              报告这个 bug →
            </button>
          </div>
        </div>
      </div>
    );
  }
}
