import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import ProblemListPage from './pages/ProblemListPage';
import ProblemPage from './pages/ProblemPage';

function AppShell() {
  const location = useLocation();
  const isProblemPage = location.pathname.startsWith('/problem/');

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-gray-100">
      <Navbar />
      <main className={`flex-1 flex ${isProblemPage ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/problems" element={<ProblemListPage />} />
          <Route path="/problem/:id" element={<ProblemPage />} />
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
