
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
  console.log('App rendering');
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Landing page is the default route */}
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
            
            {/* Redirect dashboard attempts to connect-data when not authenticated */}
            <Route path="/dashboard" element={<Navigate to="/connect-data" replace />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
