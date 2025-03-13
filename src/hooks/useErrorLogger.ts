
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

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
      // Don't throw from the error logger to avoid recursive errors
      console.error('Error while sending to error logger:', loggingError);
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
    withErrorLogging
  };
}
