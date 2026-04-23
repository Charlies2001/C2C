import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import ProblemListPage from './pages/ProblemListPage';
import ProblemPage from './pages/ProblemPage';
import AuthPage from './pages/AuthPage';
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
      <main className={`flex-1 flex ${isProblemPage ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/problems" element={<ProtectedRoute><ProblemListPage /></ProtectedRoute>} />
          <Route path="/problem/:id" element={<ProtectedRoute><ProblemPage /></ProtectedRoute>} />
        </Routes>
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
