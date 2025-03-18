
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/components/AuthProvider';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/ErrorBoundary';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Landing from '@/pages/Landing';
import ConnectData from '@/pages/ConnectData';
import NotFound from '@/pages/NotFound';
import { AuthGuard } from '@/components/AuthGuard';
import AIChat from '@/pages/AIChat';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  return (
    <div className="app">
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<AuthGuard><Index /></AuthGuard>} />
          <Route path="/connect-data" element={<AuthGuard><ConnectData /></AuthGuard>} />
          <Route path="/ai-chat" element={<AuthGuard><AIChat /></AuthGuard>} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
}

export default App;
