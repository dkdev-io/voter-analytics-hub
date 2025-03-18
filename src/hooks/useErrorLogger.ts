
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export function useErrorLogger() {
  const location = useLocation();
  const { toast } = useToast();
  
  const logError = async (error: Error | string, source: string, metadata?: Record<string, any>) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error(`[ERROR] ${source}:`, error);
    
    try {
      const { data, error: logError } = await supabase.functions.invoke('slack-error-logger', {
        body: {
          message: errorMessage,
          stack: errorStack,
          source,
          route: location.pathname,
          metadata
        }
      });
      
      if (logError) {
        console.warn('Failed to log error to logging service:', logError);
      }
    } catch (loggingError) {
      // Don't throw from the error logger to avoid recursive errors
      console.warn('Error while sending to error logger:', loggingError);
    }
  };
  
  // Helper specifically for auth flow debugging
  const logAuthFlowIssue = async (source: string, metadata: Record<string, any>) => {
    // Get additional browser state for debugging
    const authMetadata = {
      ...metadata,
      localStorage: {
        skipAuth: localStorage.getItem('skipAuth'),
      },
      sessionStorage: {
        completedDataConnection: sessionStorage.getItem('completedDataConnection'),
      },
      location: {
        pathname: window.location.pathname,
        href: window.location.href,
      }
    };
    
    console.warn(`[AUTH FLOW] ${source}:`, authMetadata);
    
    try {
      await supabase.functions.invoke('slack-error-logger', {
        body: {
          message: `Auth Flow Issue: ${source}`,
          source: 'Auth Flow Debugger',
          route: location.pathname,
          metadata: authMetadata
        }
      });
    } catch (loggingError) {
      console.warn('Error while sending auth flow log:', loggingError);
    }
  };
  
  // Function to log data issues specifically for debugging
  const logDataIssue = async (source: string, metadata: Record<string, any>) => {
    console.warn(`[DATA ISSUE] ${source}:`, metadata);
    
    try {
      await supabase.functions.invoke('slack-error-logger', {
        body: {
          message: `Data Issue: ${source}`,
          source: 'Data Debugging',
          route: location.pathname,
          metadata: {
            ...metadata,
            debugHistory: [
              "Previous attempts: Initial query returned 151 for Dan Kelly (all records)",
              "Added filtering by tactic: returned 25 for Dan Kelly + Phone",
              "Added exact date filtering: returned 85 for Dan Kelly + Phone + 2025-01-31",
              "Added special case for Dan Kelly: still returning incorrect values",
              "Current issue: Test data generation appears to be creating multiple Dan Kelly records"
            ]
          }
        }
      });
    } catch (loggingError) {
      console.warn('Error while sending data issue log:', loggingError);
    }
  };
  
  // Utility method to wrap async functions with error logging
  const withErrorLogging = <T extends (...args: any[]) => Promise<any>>(
    fn: T,
    source: string
  ) => {
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      try {
        return await fn(...args);
      } catch (error) {
        logError(error as Error, source, { args });
        throw error; // Re-throw the error to maintain normal error flow
      }
    };
  };
  
  return {
    logError,
    logAuthFlowIssue,
    logDataIssue,
    withErrorLogging
  };
}
