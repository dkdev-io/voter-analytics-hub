
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to Slack
    this.logErrorToSlack(error, errorInfo);
  }
  
  async logErrorToSlack(error: Error, errorInfo: ErrorInfo): Promise<void> {
    try {
      await supabase.functions.invoke('slack-error-logger', {
        body: {
          message: error.message,
          stack: error.stack,
          source: 'ErrorBoundary',
          route: window.location.pathname,
          metadata: {
            componentStack: errorInfo.componentStack
          }
        }
      });
    } catch (loggingError) {
      console.error('Failed to log error to Slack:', loggingError);
    }
  }

  handleResetError = (): void => {
    this.setState({ hasError: false, error: null });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-700 mb-4">
              The application encountered an unexpected error. Our team has been notified.
            </p>
            {this.state.error && (
              <div className="bg-gray-100 p-3 rounded mb-4 overflow-auto max-h-48">
                <p className="font-mono text-sm text-gray-800">{this.state.error.message}</p>
              </div>
            )}
            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
              >
                Go Home
              </Button>
              <Button onClick={this.handleResetError}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
