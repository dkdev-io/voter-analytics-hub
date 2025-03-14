
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import ConnectData from './pages/ConnectData';
import { AuthProvider } from './components/AuthProvider';
import { AuthGuard, UnauthGuard } from './components/AuthGuard';
import { IssueTracker } from './components/issue-log/IssueTracker';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

export default function App() {
  // Clear any auth-related flags on initial app load
  // This prevents unexpected redirection on app startup
  console.log('App: Initial load, clearing all auth state flags');
  localStorage.removeItem('skipAuth');
  sessionStorage.removeItem('completedDataConnection');
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Landing page is the default route - no guards on this route */}
            <Route path="/" element={<Landing />} />
            
            {/* Auth route with UnauthGuard to prevent authenticated users from accessing */}
            <Route path="/auth" element={
              <UnauthGuard>
                <Auth />
              </UnauthGuard>
            } />
            
            {/* Protected routes that require authentication */}
            <Route path="/connect-data" element={
              <AuthGuard>
                <ConnectData />
              </AuthGuard>
            } />
            <Route path="/dashboard" element={
              <AuthGuard>
                <Index />
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
            
            {/* Catch-all route - redirect to landing page */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
