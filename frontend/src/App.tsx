import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import ProblemListPage from './pages/ProblemListPage';
import ProblemPage from './pages/ProblemPage';
import AuthPage from './pages/AuthPage';
import NotebookDetailPage from './pages/NotebookDetailPage';
import ErrorBoundary from './components/ErrorBoundary';
import LoginGate from './components/LoginGate';
import { useAuthStore } from './store/useAuthStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-violet-500/50 border-t-violet-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AppShell() {
  const location = useLocation();
  const isProblemPage = location.pathname.startsWith('/problem/');
  const isAuthPage = location.pathname === '/auth';
  const { user, loading, init } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  // Redirect logged-in users away from auth page
  if (!loading && user && isAuthPage) {
    return <Navigate to="/problems" replace />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-gray-100">
      {!isAuthPage && <Navbar />}
      <LoginGate />
      <main className={`flex-1 flex ${isProblemPage ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        <ErrorBoundary scope="主界面">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            {/* 题目列表和题目页支持游客访问：浏览、Pyodide 运行代码都不要后端。
                AI 相关功能（助教、提示、教学、出题）在前端会拦截未登录态弹登录引导。 */}
            <Route path="/problems" element={<ProblemListPage />} />
            <Route path="/problem/:id" element={
              <ErrorBoundary scope="题目页">
                <ProblemPage />
              </ErrorBoundary>
            } />
            {/* 笔记本仍然要求登录：里面的内容是用户级私有数据。 */}
            <Route path="/notebooks/:id" element={
              <ProtectedRoute>
                <ErrorBoundary scope="笔记本">
                  <NotebookDetailPage />
                </ErrorBoundary>
              </ProtectedRoute>
            } />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
