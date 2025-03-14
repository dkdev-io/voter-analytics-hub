
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import ConnectData from './pages/ConnectData';
import { AuthProvider } from './components/AuthProvider';
import { AuthGuard, UnauthGuard } from './components/AuthGuard';
import { IssueTracker } from './components/issue-log/IssueTracker';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={
              <UnauthGuard>
                <Auth />
              </UnauthGuard>
            } />
            <Route path="/dashboard" element={
              <AuthGuard>
                <Index />
              </AuthGuard>
            } />
            <Route path="/connect-data" element={
              <AuthGuard>
                <ConnectData />
              </AuthGuard>
            } />
            <Route 
              path="/issues/*" 
              element={
                <AuthGuard>
                  <IssueTracker />
                </AuthGuard>
              } 
            />
            {/* Redirect /dashboard to / when user is not authenticated */}
            <Route path="/dashboard" element={<Navigate to="/auth" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
