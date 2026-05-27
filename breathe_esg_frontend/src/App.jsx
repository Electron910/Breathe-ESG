import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getMe } from './api';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import IngestPage from './pages/IngestPage';
import ReviewPage from './pages/ReviewPage';
import ExportPage from './pages/ExportPage';
import Layout from './components/Layout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));
  const [userRole, setUserRole] = useState(null);

  // Basic auth check
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
    if (token) {
      getMe().then(res => setUserRole(res.data.role)).catch(() => {
        localStorage.removeItem('access_token');
        setIsAuthenticated(false);
      });
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      <Layout onLogout={() => {
        localStorage.removeItem('access_token');
        setIsAuthenticated(false);
      }}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/ingest" element={<IngestPage />} />
          <Route path="/review" element={<ReviewPage userRole={userRole} />} />
          <Route path="/export" element={<ExportPage userRole={userRole} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
