import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

// Simple debounce function to prevent rapid consecutive calls
const debounce = (func: Function, wait = 1000) => {
  let timeout: number | null = null;
  return (...args: any[]) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait) as unknown as number;
  };
};

export function useErrorLogger() {
  const location = useLocation();
  
  const logError = async (error: Error | string, source: string, metadata?: Record<string, any>) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error(`[ERROR] ${source}:`, error);
    
    try {
      const { error: logError } = await supabase.functions.invoke('slack-error-logger', {
        body: {
          message: errorMessage,
          stack: errorStack,
          source,
          route: location.pathname,
          metadata
        }
      });
      
      if (logError) {
        console.error('Failed to log error to Slack:', logError);
      }
    } catch (loggingError) {
      console.error('Error while sending to error logger:', loggingError);
    }
  };
  
  // Debounced version for auth flow to prevent excessive logging
  const logAuthFlowIssue = debounce(async (source: string, metadata: Record<string, any>) => {
    // Only log critical auth issues or errors, not routine state
    if (!metadata.error && !source.includes("Error") && !source.includes("Failed")) {
      // Skip logging for routine auth state changes
      return;
    }
    
    console.warn(`[AUTH FLOW] ${source}:`, metadata);
    
    try {
      await supabase.functions.invoke('slack-error-logger', {
        body: {
          message: `Auth Flow Issue: ${source}`,
          source: 'Auth Flow Debugger',
          route: location.pathname,
          metadata: {
            ...metadata,
            // Minimal browser state for debugging
            location: {
              pathname: window.location.pathname
            }
          }
        }
      });
    } catch (loggingError) {
      console.error('Error while sending auth flow log:', loggingError);
    }
  }, 2000);
  
  // Keep existing functions for data issues and error wrapping
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
      console.error('Error while sending data issue log:', loggingError);
    }
  };
  
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
